import { DATA_POOL } from './data';
import { Item, itemByID } from './items';

type WorldCheck = {
  location: string;
  type: string;
  rel: string;
  addr: number;
  item: Item;
};

export type World = {
  checks: {[k in string]: WorldCheck};
};

function loadChecks() {
  const checks: {[k in string]: WorldCheck} = {};

  for (const row of DATA_POOL) {
    const { location, type, rel, addr, item } = row;
    const addr2 = parseInt(addr, 16);
    const item2 = itemByID(item);
    checks[location] = { location, type, rel, addr: addr2, item: item2 };
  }

  return checks;
}

export function createWorld(): World {
  const checks = loadChecks();
  return { checks };
}
