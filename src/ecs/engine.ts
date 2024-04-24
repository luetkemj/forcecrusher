import { World } from "miniplex";

export type Entity = {
  appearance?: {
    char: string;
    tint: number;
    tileSet: string;
  };
  blocking?: true,
  health?: {
    max: number,
    current: number,
  },
  opaque?: true,
  name?: string,
  paused?: true;
  pc?: true,
  position?: { x: number; y: number; z: number };
  tryMove?: { x: number; y: number; z: number };
};

export const world = new World<Entity>();

