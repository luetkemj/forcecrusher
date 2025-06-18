import { cloneDeep } from "lodash";
import { gameWorld, type Entity } from "../ecs/engine";
import {
  floorPrefab,
  healthPotionPrefab,
  leatherArmor,
  playerPrefab,
  ratPrefab,
  rockPrefab,
  skeletonPrefab,
  shortswordPrefab,
  clubPrefab,
  daggerPrefab,
  stairsDownPrefab,
  stairsUpPrefab,
  wallPrefab,
} from "./prefabs";

export const prefabs = {
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
  club: clubPrefab,
  dagger: daggerPrefab,

  // NOTE: Armor
  leatherArmor: leatherArmor,

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
