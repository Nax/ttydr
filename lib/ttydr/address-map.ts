const DOL_OFFSET = 0x20300;
const OVERLAYS_OFFSETS = {
  'aaa': 0x4600ae1c,
  'aji': 0x4600ee9c,
  'bom': 0x46087364,
  'dig': 0x460a6ec0,
  'dmo': 0x460a8b9c,
  'dou': 0x460af274,
  'eki': 0x460de470,
  'end': 0x4610abe0,
  'gon': 0x461129b8,
  'gor': 0x46147d30,
  'gra': 0x461e4d14,
  'hei': 0x461feb60,
  'hom': 0x46234860,
  'jin': 0x4623b6e8,
  'jon': 0x46275cd4,
  'kpa': 0x4631b720,
  'las': 0x46328fd8,
  'moo': 0x463cdbd8,
  'mri': 0x463e2a0c,
  'muj': 0x4646a454,
  'nok': 0x464db3dc,
  'pik': 0x464ec990,
  'qiz': 0x465085dc,
  'rsh': 0x46508884,
  'sys': 0x46555158,
  'tik': 0x46559418,
  'tou': 0x465af660,
  'tou2': 0x4660bfe4,
  'tst': 0x466a0e40,
  'usu': 0x467f5edc,
  'win': 0x46818af4,
  'yuu': 0x468435d8,
};

type Section = {
  vstart: number;
  poffset: number;
  size: number;
};

export class AddressMap {
  private overlays: Map<string, Section[]>;

  constructor(iso: Buffer) {
    this.overlays = new Map();
    this.loadDol(iso);
    this.loadOverlays(iso);
  }

  private loadDol(iso: Buffer) {
    const sections: Section[] = [];

    /* Read the DOL header */
    for (let i = 0; i < 18; ++i) {
      const offset = DOL_OFFSET + i * 4;
      const poffset = iso.readUInt32BE(offset) + DOL_OFFSET;
      const vstart = iso.readUInt32BE(offset + 0x48);
      const size = iso.readUInt32BE(offset + 0x90);
      sections.push({ vstart, poffset, size });
    }

    this.overlays.set('main', sections);
  }

  private loadOverlays(iso: Buffer) {
    for (const ov in OVERLAYS_OFFSETS) {
      this.loadOverlay(iso, ov);
    }
  }

  private loadOverlay(iso: Buffer, ov: string) {
    const ovOffset = (OVERLAYS_OFFSETS as any)[ov] as number;
    const header = iso.subarray(ovOffset, ovOffset + 0x4c);
    const numSections = header.readUInt32BE(0x0c);
    const sectionInfoOffset = header.readUInt32BE(0x10);

    const sections: Section[] = [];
    let virtAddr = 0x805fb984;
    for (let i = 0; i < numSections; ++i) {
      const base = ovOffset + sectionInfoOffset + i * 0x08;
      const sectionData = iso.subarray(base, base + 0x08);
      const off = sectionData.readUInt32BE(0x00) & 0xfffffffe;
      let size = sectionData.readUInt32BE(0x04);
      size = (size + 3) & ~3;
      if (!off || !size) {
        continue;
      }
      const vstart = virtAddr;
      const poffset = ovOffset + off;
      const section = { vstart, poffset, size };
      sections.push(section);
      virtAddr += size;
    }

    this.overlays.set(ov, sections);
  }

  virtualToPhysicalOvl(ovl: string, virtAddr: number): number {
    const sections = this.overlays.get(ovl) || [];
    for (const s of sections) {
      if (s.vstart <= virtAddr && virtAddr < s.vstart + s.size) {
        return s.poffset + (virtAddr - s.vstart);
      }
    }

    throw new Error(`Invalid virtual address 0x${virtAddr.toString(16)} for overlay ${ovl}`);
  }

  virtualToPhysical(virtAddr: number): number {
    return this.virtualToPhysicalOvl('main', virtAddr);
  }
}
