import { World } from "miniplex";
import { type State, getState, setState } from "../main";
import { generateDungeon } from "../pcgn/dungeon";

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
  armorClass?: number;
  blocking?: true;
  charisma?: number;
  consumable?: true;
  constitution?: number;
  container?: {
    name: string;
    description: string;
    contents: Array<string>;
    slots: number;
  };
  dead?: true;
  description?: string;
  dexterity?: number;
  effects?: Array<Effect>;
  health?: {
    max: number;
    current: number;
  };
  id: string;
  inFov?: true;
  intelligence?: number;
  layer100?: true;
  layer200?: true;
  layer300?: true;
  layer400?: true;
  legendable?: true;
  opaque?: true;
  pathThrough?: true;
  pickUp?: true;
  name: string;
  paused?: true; // TODO: is this used anywhere?
  pc?: true;
  position?: { x: number; y: number; z: number };
  revealed?: true;
  stairsDown?: true;
  stairsUp?: true;
  strength?: number;
  tryDrop?: { dropperId: string };
  tryMove?: { x: number; y: number; z: number };
  tryPickUp?: { pickerId: string };
  tryThrow?: { throwerId: string };
  version: number;
  wisdom?: number;
};

export enum ChangeZoneDirections {
  up = "up",
  down = "down",
}

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

  clearEntities(disallowList: Array<string> = []) {
    for (const entity of [...this.world.entities]) {
      if (!disallowList.includes(entity.id)) {
        this.world.remove(entity);
      }
    }
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

  changeZone(zoneId: string, direction: ChangeZoneDirections) {
    // get all ids for player and their inventory - all entities that will change zone
    const { playerId } = getState();
    const playerEntity = this.registry.get(playerId);
    const inventoryIds = playerEntity?.container?.contents || [];
    const migratingEIds = [playerId, ...inventoryIds];

    getStairsEntity(direction);

    // clear all entities in preparation to regenerate them all from new zone
    // first argument is a disallow list - so we are NOT clearing the migratingEIds
    this.clearEntities(migratingEIds);

    if (this.zones.has(zoneId)) {
      // zone found - load zone
      //
      // query for finding non blocking space
      const nonBlockingEntities = gameWorld.world
        .with("position")
        .without("blocking");
      // get zone
      const zone = this.zones.get(zoneId);

      if (!zone) return;
      // add all entities from zoneIds
      for (const eId of zone) {
        const entity = this.registry.get(eId);
        if (!entity) return;
        this.world.add(entity);
      }

      for (const entity of nonBlockingEntities) {
        if (entity) {
          if (!playerEntity) return;

          const stairsEntities = getStairsEntity(direction);
          if (!stairsEntities) return;

          for (const stairsEntity of stairsEntities) {
            playerEntity.position = { ...stairsEntity.position };
          }
          break;
        }
      }
    } else {
      // Zone not found: generate new zone
      generateDungeon();

      const playerEntity = gameWorld.registry.get(playerId);
      if (playerEntity) {
        const stairsEntities = getStairsEntity(direction);
        if (!stairsEntities) return;

        for (const stairsEntity of stairsEntities) {
          playerEntity.position = { ...stairsEntity.position };
        }
      }
    }

    setState((state: State) => (state.zoneId = zoneId));
    this.saveZone(zoneId);
  }

  loadGameData() {
    const data = localStorage.getItem("gameData");
    if (!data) return;

    const { registry, state, zones } = JSON.parse(data);

    // Clear existing data
    this.registry.clear();
    this.zones.clear();
    this.clearEntities();

    // NOTE: this loads ALL entities in to the world - we want all entities in register, but NOT all in world.
    //
    // load registry
    for (const entity of Object.values(registry) as Entity[]) {
      this.world.add(entity);
    }

    // load zones
    for (const [key, value] of zones as [string, Set<string>][]) {
      this.zones.set(key, new Set(value));
    }

    // NOTE: we just loaded all entities into the world in order to fully populate the registry
    // however we only want entities from the current zone loaded into the world
    // so we clear all entities and then reload just the current zone
    // so we have a full registry and a limited world.
    this.clearEntities();
    const zone = this.zones.get(state.zoneId);
    if (zone) {
      for (const eId of zone) {
        const entity = this.registry.get(eId);
        if (entity) {
          this.world.add(entity);
        }
      }
    }
    // load state
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

type Zones = Map<string, Set<string>>;

const prepZonesForSerialization = (zones: Zones) => {
  return Array.from(zones.entries()).map(([key, set]) => [
    key,
    Array.from(set),
  ]);
};

const getStairsEntity = (direction: ChangeZoneDirections) => {
  const stairsUp = gameWorld.world.with("stairsUp", "position");
  const stairsDown = gameWorld.world.with("stairsDown", "position");

  if (direction === "up") {
    return stairsDown;
  }
  if (direction === "down") {
    return stairsUp;
  }
};
