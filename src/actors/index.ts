import { cloneDeep } from "lodash";
import { gameWorld, type Entity } from "../ecs/engine";
import { playerPrefab } from "./prefabs";
import { ratPrefab } from "./prefabs";
import { skeletonPrefab } from "./prefabs";
import { healthPotionPrefab } from "./prefabs";
import { rockPrefab } from "./prefabs";
import { shortswordPrefab } from "./prefabs";
import { stairsDownPrefab } from "./prefabs";
import { stairsUpPrefab } from "./prefabs";
import { wallPrefab } from "./prefabs";
import { floorPrefab } from "./prefabs";

const prefabs = {
  // NOTE: Player
  player: playerPrefab,

  // NOTE: Actors / Creatures
  rat: ratPrefab,
  skeleton: skeletonPrefab,

  // NOTE: Potions
  healthPotion: healthPotionPrefab,

  // NOTE: Items
  rock: rockPrefab,

  // NOTE: Weapons
  shortsword: shortswordPrefab,

  // NOTE: Interactive Structures
  stairsDown: stairsDownPrefab,
  stairsUp: stairsUpPrefab,

  // NOTE: Terrain / Map Features
  wall: wallPrefab,
  floor: floorPrefab,
};

export const spawn = (
  prefab: keyof typeof prefabs,
  components: Partial<Entity> = {},
) => {
  const prefabObj = prefabs[prefab];

  const entity = gameWorld.world.add({
    ...cloneDeep(prefabObj),
    ...cloneDeep(components),
  });

  return entity;
};
