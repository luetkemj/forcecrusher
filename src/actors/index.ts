import { Entity } from "../ecs/engine";
import { colors, chars } from "./graphics";

const renderable: Entity = {
  appearance: {
    char: chars.default,
    tint: colors.default,
    tileSet: "ascii",
  },
  position: { x: 0, y: 0, z: 0 },
  name: "default",
};

const tile: Entity = {
  layer100: true,
};

const being: Entity = {
  health: { max: 1, current: 1 },
  blocking: true,
  layer300: true,
};

export const playerPrefab: Entity = {
  ...renderable,
  ...being,
  appearance: {
    char: chars.player,
    tint: colors.player,
    tileSet: "ascii",
  },
  health: { max: 10, current: 10 },
  name: "player",
  pc: true,
};

export const wallPrefab: Entity = {
  ...renderable,
  ...tile,
  appearance: {
    char: chars.wall,
    tint: colors.wall,
    tileSet: "ascii",
  },
  blocking: true,
  opaque: true,
  name: "wall",
};

export const floorPrefab: Entity = {
  ...renderable,
  ...tile,
  appearance: {
    char: chars.floor,
    tint: colors.floor,
    tileSet: "ascii",
  },
  name: "floor",
};

export const ratPrefab: Entity = {
  ...renderable,
  ...being,
  ai: true,
  appearance: {
    char: chars.rat,
    tint: colors.rat,
    tileSet: "ascii",
  },
  health: { max: 1, current: 1 },
  name: "rat",
};
