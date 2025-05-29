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

  private _zones = new Map<string, Set<string>>();

  get world() {
    return this._world;
  }

  get registry() {
    return this._entityById;
  }

  get zones() {
    return this._zones;
  }

  saveZone(zoneId: string) {
    // create zone if doesn't exist
    if (!this.zones.has(zoneId)) {
      this.zones.set(zoneId, new Set());
    }
    // wipe old data
    this.zones.get(zoneId)?.clear();
    // add new data
    for (const entity of gameWorld.world.entities) {
      this.zones.get(zoneId)?.add(entity.id);
    }
  }

  saveGameData() {
    const { log, zoneId, playerId, version } = getState();

    this.saveZone(zoneId);

    const saveData = {
      registry: prepRegistryForSerialization(this.registry),
      zones: prepZonesForSerialization(this.zones),
      state: { log, zoneId, playerId, version },
    };

    localStorage.setItem("gameData", JSON.stringify(saveData));
  }

  loadGameData() {
    const data = localStorage.getItem("gameData");
    if (!data) return;

    const { registry, state, zones } = JSON.parse(data);

    // Clear existing data
    this.registry.clear();
    this.zones.clear();
    for (const entity of [...this.world.entities]) {
      this.world.remove(entity);
    }

    // TODO: this loads ALL entities in to the world - we want all entities in register, but NOT all in world.
    // Loading the zone itself should clear all the entities and only create those for the zone in another step
    // create new entities - registry will be filled automatically
    for (const entity of Object.values(registry) as Entity[]) {
      this.world.add(entity);
    }

    // populate zones
    for (const [key, value] of zones as [string, Set<string>][]) {
      this.zones.set(key, new Set(value));
    }

    // TODO: function to clear all entities in world but those we care about (player and inventory)
    // And then load everything else into state. (mind doubling entities - if an inventory item or player exists in both)
    // load current zone
    //

    // update state
    const { log, zoneId, playerId, version } = state;
    setState((state: State) => {
      state.log = log;
      state.zoneId = zoneId;
      state.playerId = playerId;
      state.version = version;
    });
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

type Registry = Map<string, Entity>;

// save utils
const prepRegistryForSerialization = (registry: Registry) => {
  const obj: Record<string, Entity> = {};
  for (let [key, value] of registry) {
    obj[key] = value;
  }
  return obj;
};

export const serializeRegistry = (registry: Registry) => {
  return JSON.stringify(prepRegistryForSerialization(registry));
};

export const deserializeRegistry = (registryData: string) => {
  const obj = JSON.parse(registryData);

  const registry = (obj: Record<string, Entity>) =>
    new Map(Object.entries(obj));

  return registry(obj);
};

type Zones = Map<string, Set<string>>;

const prepZonesForSerialization = (zones: Zones) => {
  return Array.from(zones.entries()).map(([key, set]) => [
    key,
    Array.from(set),
  ]);
};
export function serializeZones(zones: Zones): string {
  return JSON.stringify(prepZonesForSerialization(zones));
}

export function deserializeZones(serialized: string): Zones {
  const parsed = JSON.parse(serialized) as [string, string[]][];
  return new Map(parsed.map(([key, arr]) => [key, new Set(arr)]));
}

type SaveState = {
  log: Array<string>;
  zoneId: string;
  playerId: string;
  version: number;
};

export function serializeState(state: SaveState): string {
  return JSON.stringify(state);
}

export function deserializeState(serialized: string): SaveState {
  return JSON.parse(serialized);
}

// saveGameData = {
//   registry: Map<EntityId, EntityData>,
//   zones: Map<MapId, Set<EntityId>>,
//   state: {
//     log: array<string>
//     currentMapId: string,
//     playerId: string,
//     version: number,
//     // maybe: questState, timers, etc.
//   }
// }
