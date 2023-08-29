const REVISION = 0;
const MAGIC = 'TTYDR-P0';

type Patch = {
  addr: number;
  data: Buffer;
}

export class Patchfile {
  public patches: Patch[];
  public hash: string;

  constructor(data?: Buffer) {
    this.patches = [];
    this.hash = 'XXXXXXXX';

    if (data) {
      if (data.toString('utf8', 0, 8) !== MAGIC) {
        throw new Error('Invalid patch file');
      }
      this.hash = data.toString('utf8', 0x08, 0x10);
      const rev = data.readUInt32LE(0x10);
      if (rev !== REVISION) {
        throw new Error(`Unsupported patch file revision ${rev}`);
      }
      const patchCount = data.readUInt32LE(0x14);

      let offset = 0x20;
      for (let i = 0; i < patchCount; i++) {
        offset = this.parsePatch(data, offset);
      }
    }
  }

  private parsePatch(data: Buffer, offset: number) {
    const addr = data.readUInt32LE(offset);
    const size = data.readUInt32LE(offset + 4);
    const patch = data.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size;
    this.patches.push({ addr, data: patch });
    return offset;
  }

  setHash(hash: string) {
    this.hash = hash;
  }

  addPatch(addr: number, data: Buffer) {
    this.patches.push({ addr, data });
  }

  toBuffer(): Buffer {
    const buffers: Buffer[] = [];
    const header = Buffer.alloc(0x20, 0xff);
    header.write(MAGIC, 0x00, 0x08, 'utf8');
    header.write(this.hash, 0x08, 0x08, 'utf8');
    header.writeUInt32LE(REVISION, 0x10);
    header.writeUInt32LE(this.patches.length, 0x14);
    header.writeUInt32LE(0xffffffff, 0x18);
    header.writeUInt32LE(0xffffffff, 0x1c);
    buffers.push(header);

    for (const p of this.patches) {
      const h = Buffer.alloc(8);
      h.writeUInt32LE(p.addr, 0);
      h.writeUInt32LE(p.data.length, 4);
      buffers.push(h);
      buffers.push(p.data);
    }

    return Buffer.concat(buffers);
  }

  dup() {
    const ret = new Patchfile();
    ret.hash = this.hash;
    ret.patches = [...this.patches];
    return ret;
  }
}
