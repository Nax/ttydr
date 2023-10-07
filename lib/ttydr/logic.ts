import { Item, Items } from './items';
import { World } from './world';

export type ItemPlacement = Map<string, Item>;

export function logic(world: World): ItemPlacement {
  const placement = new Map<string, Item>();
  for (const loc in world.checks) {
    placement.set(loc, Items.BADGE_RETURN_POSTAGE);
  }
  return placement;
}
