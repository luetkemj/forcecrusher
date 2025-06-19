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
import { DungeonTags } from "../ecs/enums";

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

export const buildDungeon = (
  props: DungeonProps,
): {
  dungeon: Dungeon;
  tilesMap: Map<string, any>;
} => {
  const {
    pos,
    width,
    height,
    minRoomSize = 6,
    maxRoomSize = 12,
    maxRoomCount = 30,
  } = props;

  const { x, y, z } = pos;

  // fill the entire space with dirt so we can dig it out later
  const dungeon: Dungeon = {
    ...rectangle({ x, y, z, width, height, hasWalls: false }, {}),
    rooms: [],
  };

  console.log(JSON.parse(JSON.stringify(dungeon)));
  // During generation
  const tilesMap = new Map<string, any>(Object.entries(dungeon.tiles));

  const addTags = ({ x, y, z }: any, tags: Array<string>) => {
    const posId = toPosId({ x, y, z });
    const tile = tilesMap.get(posId);

    if (tile) {
      if (!tile.tags) {
        tile.tags = new Set();
      }

      tags.forEach((tag) => tile.tags.add(tag));
    }

    tilesMap.set(posId, tile);
  };

  // start with all tiles as Dirt
  for (const [_, tile] of tilesMap) {
    addTags(tile, [DungeonTags.Dirt]);
  }

  // After generation
  // dungeon.tiles = Object.fromEntries(tilesMap);

  // create room

  times(maxRoomCount, () => {
    let rw = random(minRoomSize, maxRoomSize);
    let rh = random(minRoomSize, maxRoomSize);
    let rx = random(x, width + x - rw - 1);
    let ry = random(y, height + y - rh - 1);

    // create a candidate room
    const candidate = rectangle(
      { x: rx, y: ry, z, width: rw, height: rh, hasWalls: true },
      {},
    );

    // test if candidate is overlapping with any existing rooms
    if (!dungeon.rooms.some((room) => rectsIntersect(room, candidate))) {
      dungeon.rooms.push(candidate);
      // roomTiles = { ...roomTiles, ...candidate.tiles };
      // update tilesMap
      for (const tile of Object.entries(candidate.tiles)) {
        addTags(tile[1], [DungeonTags.Room, DungeonTags.Floor]);
      }
    }
  });

  let prevRoom = null;
  let passageTiles: Tiles = {};

  for (let room of dungeon.rooms) {
    if (prevRoom) {
      passageTiles = {
        ...digHorizontalPassage(room.center, prevRoom.center),
        ...digVerticalPassage(room.center, prevRoom.center),
      };
    }

    for (const tile of Object.entries(passageTiles)) {
      addTags(tile[1], [DungeonTags.Passage, DungeonTags.Floor]);
    }

    prevRoom = room;
  }

  return { dungeon, tilesMap };
};

export const generateDungeon = (zoneId: string) => {
  const { z } = toPos(zoneId);

  const depth = Math.abs(z);

  const { dungeon, tilesMap } = buildDungeon({
    pos: { x: 0, y: 0, z: 0 },
    width: 74,
    height: 39,
    minRoomSize: 8,
    maxRoomSize: 18,
    maxRoomCount: 100,
  });

  for (const [_, tile] of tilesMap) {
    const { x, y, z } = tile;
    // create dirt
    if (tile.tags.has(DungeonTags.Dirt) && !tile.tags.has(DungeonTags.Floor)) {
      spawn("wall", { position: { x, y, z } });
    }

    // create floors
    if (
      tile.tags.has(DungeonTags.Floor) ||
      tile.tags.has(DungeonTags.Passage)
    ) {
      spawn("floor", { position: { x, y, z } });
    }
  }

  const floorTiles = [...tilesMap.values()].filter((tile) =>
    tile.tags?.has("floor"),
  );

  // randomly place enemies on open tiles
  times(10 + depth, () => {
    const openTile = sample(floorTiles);
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
