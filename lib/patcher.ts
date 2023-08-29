import { Buffer } from 'buffer';

import { Patchfile } from './patchfile';

const DOL_OFFSET = 0x20300;

type Section = {
  vstart: number;
  poffset: number;
  size: number;
};

export class Patcher {
  private iso: Buffer;
  private patches: Buffer;
  private patchfile: Patchfile;
  private cursor: number;
  private sections: Section[];

  constructor(iso: Buffer, patches: Buffer, patchfile: Patchfile) {
    this.iso = iso;
    this.patches = patches;
    this.patchfile = patchfile;
    this.cursor = 0;
    this.sections = [];

    /* Read the DOL header */
    for (let i = 0; i < 18; ++i) {
      const offset = DOL_OFFSET + i * 4;
      const poffset = iso.readUInt32BE(offset);
      const vstart = iso.readUInt32BE(offset + 0x48);
      const size = iso.readUInt32BE(offset + 0x90);
      this.sections.push({ vstart, poffset, size });
    }
  }

  private patch(romAddr: number, data: Buffer) {
    this.patchfile.addPatch(romAddr, data);
  }

  private patchVirtual(virtAddr: number, data: Buffer) {
    for (const s of this.sections) {
      if (s.vstart <= virtAddr && virtAddr < s.vstart + s.size) {
        const romAddr = s.poffset + (virtAddr - s.vstart);
        this.patch(romAddr, data);
        return;
      }
    }

    throw new Error(`Invalid virtual address 0x${virtAddr.toString(16)}`);
  }

  patchASM(patch: Buffer) {
    const addr = patch.readUInt32BE(this.cursor + 0x00);
    const size = patch.readUInt32BE(this.cursor + 0x04);
    this.cursor += 0x08;
    const data = patch.subarray(this.cursor, this.cursor + size);
    this.cursor += size;
    this.patchVirtual(addr, data);
  }

  run() {
    this.cursor = 0;
    for (;;) {
      /* Align on a 8-byte boundary */
      this.cursor = (this.cursor + 7) & ~7;
      if (this.cursor >= this.patches.length) {
        break;
      }

      /* Read the patch type */
      const type = this.patches.readUInt32BE(this.cursor) >>> 0;
      this.cursor += 4;

      switch (type) {
      case 0x01:
        this.patchASM(this.patches);
        break;
      default:
        throw new Error("Invalid patch type: " + type);
      }
    }
  }
}
