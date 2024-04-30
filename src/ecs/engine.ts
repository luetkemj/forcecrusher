import { World } from "miniplex";

export type Entity = {
  ai?: true,
  appearance?: {
    char: string;
    tint: number;
    tileSet: string;
  };
  blocking?: true,
  container?: {
    name: string,
    description: string,
    contents: Array<number>,
    slots: number,
  },
  dead?: true,
  description?: string,
  health?: {
    max: number,
    current: number,
  },
  inFov?: true,
  layer100?: true,
  layer200?: true,
  layer300?: true,
  layer400?: true,
  legendable?: true,
  opaque?: true,
  pathThrough?: true,
  pickUp?: true,
  name?: string,
  paused?: true;
  pc?: true,
  position?: { x: number; y: number; z: number };
  revealed?: true;
  tryDrop?: { dropperId: number };
  tryMove?: { x: number; y: number; z: number };
  tryPickUp?: { pickerId: number };
};

export const world = new World<Entity>();

