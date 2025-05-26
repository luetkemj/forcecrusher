import { World } from "miniplex";

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

  get world() {
    return this._world;
  }

  load() {
    const loadData = localStorage.getItem("gameSaveData");

    if (loadData) {
      const data = JSON.parse(loadData);
      this._world = new World<Entity>(data);
      console.log("loaded");
      console.log(this._world.entities);
    }
  }

  save() {
    const saveData = JSON.stringify(this._world.entities);
    localStorage.setItem("gameSaveData", saveData);
    console.log("saved");
  }
}

export const gameWorld = new GameWorld();
