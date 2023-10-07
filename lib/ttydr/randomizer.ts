import { AddressMap } from './address-map';
import { ItemPlacement } from './logic';
import { Patchfile } from './patchfile';
import { World } from './world';
import { DATA_ITEMS } from './data';

export function randomize(addrMap: AddressMap, patch: Patchfile, world: World, items: ItemPlacement) {
  for (const [loc, item] of items.entries()) {
    const check = world.checks[loc];
    const ovl = check.rel;
    let off = 0;
    switch (check.type) {
    case 'item':
      off = 8;
      break;
    case 'block':
      off = 20;
      break;
    }
    const addr = check.addr + off;
    const paddr = addrMap.virtualToPhysicalOvl(ovl, addr);
    const data = Buffer.alloc(4);
    const itemId = DATA_ITEMS[item.id] as number;
    data.writeUInt32BE(itemId, 0);
    patch.addPatch(paddr, data);
  }
}
