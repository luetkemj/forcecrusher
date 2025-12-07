import { cloneDeep } from "lodash";
import { gameWorld, type Entity } from "../ecs/engine";
import {
  floorPrefab,
  fluidContainerPrefab,
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
  doorPrefab,
  grassPrefab,
} from "./prefabs";
import { updatePosition } from "../lib/utils";
import { Material } from "../ecs/enums";

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
  door: doorPrefab,

  // NOTE: Terrain / Map Features
  wall: wallPrefab,
  floor: floorPrefab,
  fluidContainer: fluidContainerPrefab,
  grass: grassPrefab,
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

  if (entity.position) {
    updatePosition(gameWorld.world, entity, entity.position);
  }

  // calculate flammability
  const { material, mass } = entity;
  if (material && mass) {
    const flammable = calculateFlammability(material, mass);
    gameWorld.world.addComponent(entity, "flammable", flammable);
  }

  return entity;
};

export function calculateFlammability(material: Material, mass: number) {
  const MATERIAL_FIRE_BASE = {
    wood: {
      ignition: 0.35,
      fuel: 20,
      maxIntensity: 4,
      heatTolerance: 1,
      explosive: false,
    },
    cloth: {
      ignition: 0.7,
      fuel: 5,
      maxIntensity: 2,
      heatTolerance: 0.5,
      explosive: false,
    },
    paper: {
      ignition: 0.9,
      fuel: 3,
      maxIntensity: 2,
      heatTolerance: 0.2,
      explosive: false,
    },
    plant: {
      ignition: 0.5,
      fuel: 7,
      maxIntensity: 3,
      heatTolerance: 0.7,
      explosive: false,
    },
    leather: {
      ignition: 0.2,
      fuel: 10,
      maxIntensity: 2,
      heatTolerance: 1,
      explosive: false,
    },
    flesh: {
      ignition: 0.05,
      fuel: 12,
      maxIntensity: 2,
      heatTolerance: 2,
      explosive: false,
    },
    bone: {
      ignition: 0.01,
      fuel: 3,
      maxIntensity: 1,
      heatTolerance: 4,
      explosive: false,
    },
    metal: {
      ignition: 0,
      fuel: 0,
      maxIntensity: 0,
      heatTolerance: 5,
      explosive: false,
    },
    stone: {
      ignition: 0,
      fuel: 0,
      maxIntensity: 0,
      heatTolerance: 5,
      explosive: false,
    },
    glass: {
      ignition: 0,
      fuel: 0,
      maxIntensity: 0,
      heatTolerance: 3,
      explosive: false,
    },
    oil: {
      ignition: 0.9,
      fuel: 15,
      maxIntensity: 5,
      heatTolerance: 0.1,
      explosive: true,
    },
    lava: {
      ignition: 1,
      fuel: 100,
      maxIntensity: 5,
      heatTolerance: 0.1,
      explosive: false,
    },
  };

  const base = MATERIAL_FIRE_BASE[material];

  if (!base || base.fuel === 0) {
    return {
      ignitionChance: 0,
      fuel: { max: 0, current: 0 },
      maxIntensity: 0,
      heatTolerance: base?.heatTolerance ?? 999,
      explosive: base.explosive,
    };
  }

  const ignitionChance =
    base.ignition * Math.max(0.1, Math.min(2.0, 1 / Math.pow(mass, 0.4)));

  const fuelMax = Math.floor(base.fuel * (mass * 0.8 + 0.4));

  return {
    ignitionChance,
    fuel: { max: fuelMax, current: fuelMax },
    maxIntensity: base.maxIntensity + (mass > 5 ? 1 : 0),
    heatTolerance: base.heatTolerance,
    explosive: base.explosive,
  };
}
