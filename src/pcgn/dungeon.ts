import { random, sample, times } from "lodash";
import {
  type Pos,
  type PosId,
  type Rectangle,
  rectangle,
  rectsIntersect,
  toPosId,
  toPos,
} from "../lib/grid";
import { spawn } from "../actors";
import { spawnSkeleton, spawnRat } from "./monsters";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

type Tile = {
  x: number;
  y: number;
  z: number;
  sprite: string;
};

type Tiles = { [key: PosId]: Tile };

function digHorizontalPassage(posA: Pos, posB: Pos) {
  const tiles: Tiles = {};
  const start = Math.min(posA.x, posB.x);
  const end = Math.max(posA.x, posB.x) + 1;
  let x = start;

  while (x < end) {
    const tilePos = { ...posB, x };
    tiles[toPosId(tilePos)] = { ...tilePos, sprite: "FLOOR" };
    x++;
  }

  return tiles;
}

function digVerticalPassage(posA: Pos, posB: Pos): Tiles {
  const tiles: Tiles = {};
  const start = Math.min(posA.y, posB.y);
  const end = Math.max(posA.y, posB.y) + 1;
  let y = start;

  while (y < end) {
    const tilePos = { ...posA, y };
    tiles[toPosId(tilePos)] = { ...tilePos, sprite: "FLOOR" };
    y++;
  }

  return tiles;
}

type DungeonProps = {
  pos: Pos;
  width: number;
  height: number;
  minRoomSize: number;
  maxRoomSize: number;
  maxRoomCount: number;
};

type Dungeon = Rectangle & { rooms: Array<Rectangle> };

export const buildDungeon = (props: DungeonProps): Dungeon => {
  const {
    pos,
    width,
    height,
    minRoomSize = 6,
    maxRoomSize = 12,
    maxRoomCount = 30,
  } = props;

  const { x, y, z } = pos;

  // fill the entire space with walls so we can dig it out later
  const dungeon: Dungeon = {
    ...rectangle(
      { x, y, z, width, height, hasWalls: false },
      {
        sprite: "WALL",
      },
    ),
    rooms: [],
  };

  // create room

  let roomTiles = {};

  times(maxRoomCount, () => {
    let rw = random(minRoomSize, maxRoomSize);
    let rh = random(minRoomSize, maxRoomSize);
    let rx = random(x, width + x - rw - 1);
    let ry = random(y, height + y - rh - 1);

    // create a candidate room
    const candidate = rectangle(
      { x: rx, y: ry, z, width: rw, height: rh, hasWalls: true },
      { sprite: "FLOOR" },
    );

    // test if candidate is overlapping with any existing rooms
    if (!dungeon.rooms.some((room) => rectsIntersect(room, candidate))) {
      dungeon.rooms.push(candidate);
      roomTiles = { ...roomTiles, ...candidate.tiles };
    }
  });

  let prevRoom = null;
  let passageTiles = {};

  for (let room of dungeon.rooms) {
    if (prevRoom) {
      passageTiles = {
        ...passageTiles,
        ...digHorizontalPassage(room.center, prevRoom.center),
        ...digVerticalPassage(room.center, prevRoom.center),
      };
    }

    prevRoom = room;
  }

  // First apply tags
  for (const [key, tile] of Object.entries(roomTiles)) {
    if (!tile.tags) tile.tags = new Set();
    tile.tags.add("room");
  }

  for (const [key, tile] of Object.entries(passageTiles)) {
    if (!tile.tags) tile.tags = new Set();
    tile.tags.add("passage");

    // If the tile also exists in roomTiles, merge tags
    if (roomTiles[key]) {
      tile.tags = new Set([...roomTiles[key].tags, ...tile.tags]);
    }
  }

  // Merge tiles with tag merging logic
  for (const [key, tile] of Object.entries({ ...roomTiles, ...passageTiles })) {
    dungeon.tiles[key] = {
      ...dungeon.tiles[key],
      ...tile,
      tags: new Set([
        ...(dungeon.tiles[key]?.tags ?? []),
        ...(tile.tags ?? []),
      ]),
    };
  }

  return dungeon;
};

export const generateDungeon = (zoneId: string) => {
  const { z } = toPos(zoneId);

  const depth = Math.abs(z);

  const dungeon = buildDungeon({
    pos: { x: 0, y: 0, z: 0 },
    width: 74,
    height: 39,
    minRoomSize: 8,
    maxRoomSize: 18,
    maxRoomCount: 100,
  });

  const tiles = Object.values(dungeon.tiles);

  for (const tile of tiles) {
    if (tile.sprite === "WALL") {
      const { x, y, z } = tile;
      const newTile = spawn("wall", { position: { x, y, z } });
    }
    if (tile.sprite === "FLOOR") {
      const { x, y, z } = tile;
      const newTile = spawn("floor", { position: { x, y, z } });
      if (newTile.appearance) {
        if (tile.tags.has("room")) {
          newTile.appearance.tint = 0x00ff00;
        }
        if (tile.tags.has("passage")) {
          newTile.appearance.tint = 0xffff00;
        }
        if (tile.tags.has("passage") && tile.tags.has("room")) {
          newTile.appearance.tint = 0x00ffff;
        }
      }
    }
  }

  // get all open tiles (floor)
  const openTiles = Object.values(dungeon.tiles).filter(
    (tile) => tile.sprite === "FLOOR",
  );
  // randomly place enemies on open tiles
  times(10 + depth, () => {
    const openTile = sample(openTiles);
    if (!openTile) return;
    const position = { x: openTile.x, y: openTile.y, z: openTile.z };
    const percentile = new DiceRoll("d100").total;

    if (percentile < 30) {
      spawnSkeleton(position);
    } else {
      spawnRat(position);
    }
  });

  // increase number of enemies as you get deeper

  dungeon.rooms.forEach((room, index) => {
    const percentile = new DiceRoll("d100").total;
    if (index) {
      if (percentile >= 50) {
        spawn("rock", { position: room.center });
      } else {
        spawn("healthPotion", { position: room.center });
      }
    }
    if (index === 1) {
      const { x, y, z } = sample(room.tiles) || { x: 0, y: 0, z: 0 };
      spawn("stairsUp", { position: { x, y, z } });
    }
    if (index === 2) {
      const { x, y, z } = sample(room.tiles) || { x: 0, y: 0, z: 0 };
      spawn("stairsDown", { position: { x, y, z } });
    }
  });

  return dungeon;
};
