import { World } from "miniplex"

type Entity = {
  position?: { x: number; y: number; z: number };
  tryMove?: { x: number; y: number; z: number };
  appearance?: {
    char: string;
    tint: number;
    tileSet: string;
  }
}

export const createNewWorld = () => {
  const world = new World<Entity>()

  return world
}
