import { World } from "miniplex";
import { type State, getState, setState } from "../main";

// components with a max, current shape such that they are effectable
type Effectables = {
  health?: Entity["health"];
};

type Effect = {
  delta: number;
  component: keyof Effectables;
};

export type Entity = {
  activeEffects?: Array<Effect>;
  ai?: true;
  appearance?: {
    char: string;
    tint: number;
    tileSet: string;
  };
  blocking?: true;
  consumable?: true;
  container?: {
    name: string;
    description: string;
    contents: Array<string>;
    slots: number;
  };
  dead?: true;
  description?: string;
  effects?: Array<Effect>;
  health?: {
    max: number;
    current: number;
  };
  id: string;
  inFov?: true;
  layer100?: true;
  layer200?: true;
  layer300?: true;
  layer400?: true;
  legendable?: true;
  opaque?: true;
  pathThrough?: true;
  pickUp?: true;
  name: string;
  paused?: true;
  pc?: true;
  position?: { x: number; y: number; z: number };
  revealed?: true;
  tryDrop?: { dropperId: string };
  tryMove?: { x: number; y: number; z: number };
  tryPickUp?: { pickerId: string };
  tryThrow?: { throwerId: string };
  version: number;
};

class GameWorld {
  private _world = new World<Entity>();

  private _entityById = new Map<string, Entity>();

  get world() {
    return this._world;
  }

  get registry() {
    return this._entityById;
  }

  load() {
    const data = localStorage.getItem("savegame");
    if (!data) return;

    // Clear existing entities
    for (const entity of [...this.world.entities]) {
      this.world.remove(entity);
    }

    const { entities, log } = JSON.parse(data);

    setState((state: State) => (state.log = log));

    for (const entityData of entities) {
      this.world.add(entityData);
    }

    console.log("loaded");
  }

  save() {
    // Extract pure data from all entities
    const entities = [...this.world.entities].map((entity) => ({ ...entity }));
    const { log } = getState();

    localStorage.setItem("savegame", JSON.stringify({ entities, log }));

    console.log("saved");
  }
}

export const gameWorld = new GameWorld();

gameWorld.world.onEntityAdded.subscribe((entity: Entity) => {
  let uuid = self.crypto.randomUUID();

  if (!entity.id) {
    entity.id = uuid;
  }

  if (entity.id) {
    gameWorld.registry.set(entity.id, entity);
  }
});

export type Registry = Map<string, Entity>;

// save utils
export const serializeRegistry = (registry: Registry) => {
  const obj: Record<string, Entity> = {};
  for (let [key, value] of registry) {
    obj[key] = value;
  }

  return JSON.stringify(obj);
};

export const deserializeRegistry = (registryData: string) => {
  const obj = JSON.parse(registryData);

  const registry = (obj: Record<string, Entity>) =>
    new Map(Object.entries(obj));

  return registry(obj);
};

export type Zones = Map<string, Set<string>>;

export function serializeZones(zones: Zones): string {
  return JSON.stringify(
    Array.from(zones.entries()).map(([key, set]) => [key, Array.from(set)]),
  );
}

export function deserializeZones(serialized: string): Zones {
  const parsed = JSON.parse(serialized) as [string, string[]][];
  return new Map(parsed.map(([key, arr]) => [key, new Set(arr)]));
}

// saveGameData = {
//   registry: Map<EntityId, EntityData>,
//   zones: Map<MapId, Set<EntityId>>,
//   gameState: {
//     currentMapId: string,
//     playerId: string,
//     version: number,
//     // maybe: questState, timers, etc.
//   }
// }
