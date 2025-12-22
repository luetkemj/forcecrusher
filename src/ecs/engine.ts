import { World } from "miniplex";
import {
  DamageType,
  EffectType,
  EntityKind,
  Fluids,
  Material,
  OpenState,
  Sense,
  WeaponClass,
  WeaponType,
} from "./enums";
import { type State, getState, setState } from "./gameState";
import { generateDungeon } from "../pcgn/dungeon";
import { Pos, toPosId } from "../lib/grid";
import { saveGameData as dbSave, loadGameData as dbLoad } from "./saveStore";
import { handleUserInput } from "./inputHandlers/KeyMap";
import { addLog, addToEAPMap, updatePosition } from "../lib/utils";

export interface IGameWorld {
  world: World<Entity>;
  registry: Map<string, Entity>;
  zones: Map<string, Set<string>>;
  clearEntities(disallowList?: Array<string>): void;
  saveZone(zoneId: string): void;
  saveGameData(): Promise<void>;
  changeZone(zoneId: string, direction: ChangeZoneDirections): void;
  loadGameData(): Promise<void>;
}

// components with a max, current shape such that they are effectable
type Effectables = {
  health?: Entity["health"];
};

type Effect = {
  delta: number;
  component: keyof Effectables;
};

export type Attack = {
  name: string;
  toHit: number;
  attackType: "melee" | "ranged";
  damageRoll: string;
  damageType: DamageType;
  useModifier?: true;
  verb: string;
  magical?: true;
  natural?: true;
  knockbackDistance?: number; // TODO: this should be based on target weight and actor strenth/skill
  // TODO: add effects to attacks, like poison
};

type DamageAmount = {
  type: DamageType;
  amount: number;
  mod: number;
};

export type Damage = {
  attacker?: string | null; // Entity ID or null (environment)
  instigator?: string | null; // Who initiated the action (e.g., who kicked the door)
  responder?: string | null; // What was interacted with (e.g., the door)
  attack?: Attack; // Optional, not used for environmental damage
  target: string; // Who takes the damage
  weapon?: string;
  critical?: boolean;
  damageAmounts: Array<DamageAmount>;
  reason?: string; // Optional narrative text
};

export type Memory = {
  id: EntityId;
  position: Pos;
  turn: number;
  perceivedVia: Sense;
  strength?: number; // optional: e.g., for smells
};

export interface DetectedOdor {
  eId: EntityId;
  strength: number;
  posId: string;
}

export interface DetectedSound {
  eId: EntityId;
  strength: number;
  posId: string;
}

export interface Fluid {
  type: Fluids;
  volume: number;
  maxVolume: number;
  minFlow: number;
  viscosity: number;
  tint: number;
  source?: boolean;
}

export interface Mutation {
  name: string;
  next?: string;
  chanceToMutate: number;
  addComponents?: Partial<Entity>;
  removeComponents?: Array<Partial<keyof Entity>>;
}

export interface FluidContainer {
  corked: boolean;
  renderFluidColor?: true;
  fluids: Record<string, Fluid>;
}

export type EntityId = string;

export type Entity = {
  activeEffects?: Array<Effect>;
  ai?: true;
  appearance?: {
    char: string;
    tint: number;
    tileSet: string;
  };
  armorClass?: number;
  armorClassMod?: string;
  armorSlot?: {
    name: string;
    contents: Array<EntityId>;
    slots: number;
  };
  attack?: Attack;
  attacks?: Array<Attack>;
  averageDamage?: number;
  baseArmorClass?: number;
  blocking?: true;
  calculateFlammability?: true;
  charisma?: number;
  consumable?: true;
  constitution?: number;
  container?: {
    name: string;
    description: string;
    contents: Array<EntityId>;
    slots: number;
  };
  damages?: Array<Damage>;
  damageType?: DamageType;
  damageReduction?: { min: number; max: number };
  damageRoll?: string;
  dead?: true;
  description?: string;
  desiccate?: {
    range: number;
    rate: number;
    absorb: boolean;
    allowList: Array<Fluids>;
    denyList: Array<Fluids>;
  };
  dexterity?: number;
  door?: true;
  ears?: {
    sensitivity: number;
    detected: Array<DetectedSound>;
  };
  effectImmunities?: Array<EffectType>;
  effects?: Array<Effect>;
  entityKind?: EntityKind;
  fluidContainer?: FluidContainer;
  flammable?: {
    ignitionChance: number;
    fuel: {
      max: number;
      current: number;
    };
    maxIntensity: number;
    heatTolerance: number;
    explosive: boolean;
    source?: boolean;
  };
  mutable?: {
    current: string;
    mutations: Array<Mutation>;
  };
  mutateTo?: {
    name: string;
  };
  health?: {
    max: number;
    current: number;
  };
  id: EntityId;
  immunities?: Array<DamageType>;
  inFov?: true;
  intelligence?: number;
  interactDirection?: Pos;
  kickable?: {
    breakable?: boolean; // can this be broken by kicking?
    harmfulToKicker?: boolean; // cactus, spike traps, etc.
    immovable?: boolean; // e.g. statues or bolted-down objects
    isTrapped?: { trapId: EntityId };
    knockbackDistance?: number; // e.g. how far to shove it
    maxDamageOnKick?: number; // damage the kicker takes (optional)
    noiseLevel?: number; // 0 = silent, 10 = alerts everything
  };
  knockback?: {
    actorId: EntityId;
    targetId: EntityId;
    distance: number;
  };
  layer100?: true;
  layer125?: true;
  layer150?: true;
  layer200?: true;
  layer225?: true;
  layer250?: true;
  layer300?: true;
  layer325?: true;
  layer350?: true;
  layer400?: true;
  legendable?: true;
  locked?: true;
  material?: Material;
  mass?: number;
  memory?: {
    memories: Map<string, Memory>;
    target?: string;
  };
  nose?: {
    sensitivity: number;
    detected: Array<DetectedOdor>;
  };
  odor?: { strength: number };
  onFire?: {
    intensity: number;
    age: number;
    source?: boolean;
  };
  opaque?: true;
  open?: true;
  openable?: {
    state: OpenState;
    isLocked?: { lockId: EntityId }; // keyId?: string;
    isTrapped?: { trapId: EntityId };
    requiresTool?: string; // tool name?
    isOneWay?: true;
    isAutoClosing?: true;
    isSilent?: true;
    hasBeenOpened?: true;
  };
  pathThrough?: true;
  pickUp?: true;
  name: string;
  excludeFromSim?: true;
  pc?: true;
  position?: Pos;
  resistances?: Array<DamageType>;
  revealed?: true;
  sound?: { strength: number };
  stairsDown?: true;
  stairsUp?: true;
  strength?: number;
  tryAttack?: {
    targetId: EntityId;
    attack?: Attack;
    immovableTarget?: boolean;
  };
  tryClose?: Entity;
  tryDrop?: { dropperId: EntityId };
  tryFill?: { targetId: EntityId };
  tryKick?: { targetId: EntityId };
  tryMove?: Pos;
  tryOpen?: { id: EntityId };
  tryPickUp?: { pickerId: EntityId };
  tryThrow?: { throwerId: EntityId };
  version: number;
  vision?: { range: number; visible: Array<EntityId> };
  vulnerabilities?: Array<DamageType>;
  weaponClass?: WeaponClass;
  weaponSlot?: {
    name: string;
    contents: Array<string>;
    slots: number;
  };
  weaponType?: WeaponType;
  wisdom?: number;
};

export enum ChangeZoneDirections {
  up = "up",
  down = "down",
}

class GameWorld {
  constructor() {
    this.saveGameData = this.saveGameData.bind(this);
    this.loadGameData = this.loadGameData.bind(this);
    this.saveZone = this.saveZone.bind(this);
    this.changeZone = this.changeZone.bind(this);
    // bind other methods if needed
  }
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

  async saveGameData() {
    addLog("saving game...");
    const { log, zoneId, playerId, version, turnNumber } = getState();
    this.saveZone(zoneId);

    const saveData = {
      registry: prepRegistryForSerialization(this.registry),
      zones: prepZonesForSerialization(this.zones),
      state: { log, zoneId, playerId, version, turnNumber },
    };

    await dbSave(saveData);

    // manually emit user input to trigger game loop after save is complete
    handleUserInput("exitSaveMode");
    addLog("game saved successfully?");
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
    // clear the EAP cache
    setState((state: State) => (state.eapMap = new Map()));

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
            updatePosition(this.world, playerEntity, stairsEntity.position);
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
          updatePosition(this.world, playerEntity, stairsEntity.position);
        }
      }
    }

    setState((state: State) => (state.zoneId = zoneId));
    this.saveZone(zoneId);
  }

  async loadGameData() {
    addLog("loading game...");

    const data = await dbLoad();
    if (!data) return;

    const { registry, state, zones } = data;

    // Clear existing data
    this.registry.clear();
    this.zones.clear();
    this.clearEntities();
    setState((state: State) => {
      state.eapMap = new Map();
    });

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
        if (entity) this.world.add(entity);
      }
    }

    // load state
    const { log, zoneId, playerId, version, turnNumber } = state;
    setState((state: State) => {
      state.log = log;
      state.zoneId = zoneId;
      state.playerId = playerId;
      state.version = version;
      state.turnNumber = turnNumber;
    });

    // manually emit user input to trigger game loop after save is complete
    handleUserInput("exitLoadMode");
    addLog("game loaded successfully");
  }
}

export const gameWorld = new GameWorld();

gameWorld.world.onEntityAdded.subscribe((entity: Entity) => {
  let uuid = self.crypto.randomUUID();

  // add an id if entity doesn't already have one
  if (!entity.id) {
    entity.id = uuid;
  }

  // set entity into game registry
  if (entity.id) {
    gameWorld.registry.set(entity.id, entity);
  }

  // set entity position into EAP cache
  if (entity.position) {
    addToEAPMap(toPosId(entity.position), entity.id);
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
