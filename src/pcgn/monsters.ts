import { cloneDeep } from "lodash";
import { gameWorld } from "../ecs/engine";
import { ratPrefab, skeletonPrefab, shortswordPrefab } from "../actors";
import { type Pos } from "../lib/grid";

export const spawnRat = (position: Pos) => {
  gameWorld.world.add({
    ...cloneDeep(ratPrefab),
    position,
  });
};

export const spawnSkeleton = (position: Pos) => {
  // spawn weapon for skeleton
  const weapon = gameWorld.world.add({
    ...cloneDeep(shortswordPrefab),
  });

  const skeleton = gameWorld.world.add({
    ...cloneDeep(skeletonPrefab),
    position,
  });

  skeleton.weaponSlot?.contents.push(weapon.id);
};
