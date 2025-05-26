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
    contents: Array<number>;
    slots: number;
  };
  dead?: true;
  description?: string;
  effects?: Array<Effect>;
  health?: {
    max: number;
    current: number;
  };
  id?: string;
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
  tryDrop?: { dropperId: number };
  tryMove?: { x: number; y: number; z: number };
  tryPickUp?: { pickerId: number };
  tryThrow?: { throwerId: number };
};

class GameWorld {
  private _world = new World<Entity>();

  private _entityById = new Map<string, Entity>();

  get world() {
    return this._world;
  }

  get entityById() {
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
  gameWorld.world.addComponent(entity, "id", uuid);

  if (entity.id) {
    gameWorld.entityById.set(entity.id, entity);
  }
});

gameWorld.world.onEntityRemoved.subscribe((entity: Entity) => {
  if (entity.id) {
    gameWorld.entityById.delete(entity.id);
  }
});
