import { Entity } from "../ecs/engine";
import { colors, chars } from "./graphics";

const base: Entity = {
  id: "",
  version: 1,
  name: "base",
};

const renderable: Entity = {
  ...base,
  appearance: {
    char: chars.default,
    tint: colors.default,
    tileSet: "ascii",
  },
  position: { x: 0, y: 0, z: 0 },
  name: "renderable",
};

const tile: Entity = {
  ...base,
  layer100: true,
  name: "tile",
};

const being: Entity = {
  ...base,
  health: { max: 1, current: 1 },
  blocking: true,
  layer300: true,
  name: "being",
};

export const playerPrefab: Entity = {
  ...renderable,
  ...being,
  appearance: {
    char: chars.player,
    tint: colors.player,
    tileSet: "ascii",
  },
  health: { max: 1000, current: 1000 },
  legendable: true,
  name: "player",
  pc: true,
  container: {
    name: "Haversack",
    description:
      "A simple medium sized burlap pouch with a single shoulder strap.",
    slots: 10,
    contents: [],
  },
  activeEffects: [
    { delta: -5, component: "health" },
    { delta: -1, component: "health" },
  ],
};

export const wallPrefab: Entity = {
  ...base,
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
  ...base,
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
  ...base,
  ...renderable,
  ...being,
  ai: true,
  appearance: {
    char: chars.rat,
    tint: colors.rat,
    tileSet: "ascii",
  },
  health: { max: 1, current: 1 },
  legendable: true,
  name: "rat",
  description: "A medium-sized, long-tailed rodent",
  pathThrough: true,
};

export const rockPrefab: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.rock,
    tint: colors.rock,
    tileSet: "ascii",
  },
  legendable: true,
  name: "Rock",
  description: "A small rock for throwing",
  layer200: true,
  pickUp: true,
};

export const healthPotionPrefab: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.potion,
    tint: colors.potion,
    tileSet: "ascii",
  },
  consumable: true,
  legendable: true,
  name: "Health Potion",
  description: "A syrupy red liquid in a small glass vile",
  effects: [{ component: "health", delta: 10 }],
  layer200: true,
  pickUp: true,
};
