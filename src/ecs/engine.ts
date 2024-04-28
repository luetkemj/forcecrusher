import { World } from "miniplex";

export type Entity = {
  ai?: true,
  appearance?: {
    char: string;
    tint: number;
    tileSet: string;
  };
  blocking?: true,
  dead?: true,
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
  name?: string,
  paused?: true;
  pc?: true,
  position?: { x: number; y: number; z: number };
  revealed?: true;
  tryMove?: { x: number; y: number; z: number };
};

export const world = new World<Entity>();

