import { random, sample, times } from "lodash";
import {
  type Pos,
  type PosId,
  type Rectangle,
  line,
  rectangle,
  rectsIntersect,
  toPosId,
  toPos,
  getNeighbors,
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

  // Create passage ways
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

  // get perimeter walls for each room
  // const addPerimeterTags = (cell) => {
  //   const posid = `${cell.x},${cell.y}`;
  //   if (dungeon.dTiles[posid]) {
  //     dungeon.dTiles[posid].tags.push("WALL");
  //     dungeon.dTiles[posid].tags.push("PERIMETER");
  //   }
  // };
  for (let room of dungeon.rooms) {
    const sw = { x: room.x1, y: room.y2 - 1, z: 0 }; // sw
    const se = { x: room.x2 - 1, y: room.y2 - 1, z: 0 }; // se
    const nw = { x: room.x1, y: room.y1, z: 0 };
    const ne = { x: room.x2 - 1, y: room.y1, z: 0 };

    const perimeterPositions = [
      ...line(nw, ne),
      ...line(ne, se),
      ...line(se, sw),
      ...line(sw, nw),
    ];

    perimeterPositions.forEach((position) =>
      addTags(position, [DungeonTags.Perimeter, DungeonTags.Wall]),
    );
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

  const entityMap = new Map();

  for (const [_, tile] of tilesMap) {
    const { x, y, z } = tile;
    // create dirt
    if (tile.tags.has(DungeonTags.Dirt) && !tile.tags.has(DungeonTags.Floor)) {
      const entity = spawn("wall", { position: { x, y, z } });
      entityMap.set(toPosId({ x, y, z }), entity);
    }

    // create floors
    if (
      tile.tags.has(DungeonTags.Floor) ||
      tile.tags.has(DungeonTags.Passage)
    ) {
      const entity = spawn("floor", { position: { x, y, z } });
      entityMap.set(toPosId({ x, y, z }), entity);
    }
  }

  for (const [_, tile] of tilesMap) {
    const { x, y, z } = tile;
    // create doors
    if (tile.tags.has(DungeonTags.Perimeter)) {
      const posId = toPosId({ x, y, z });
      const entity = entityMap.get(posId);
      // entity.appearance.tint = 0x00ff00;
      // if two of your neighbors are walls you are a door
      const neighbors = getNeighbors(
        { x, y, z },
        "cardinal",
        { width: dungeon.width, height: dungeon.height },
        true,
      );

      let wallCount = 0;
      for (const neighbor of neighbors) {
        if (entityMap.get(neighbor).name === "wall") {
          wallCount += 1;
        }
      }

      if (tile.tags.has(DungeonTags.Floor) && wallCount === 2) {
        entity.appearance.tint = 0x00ff00;
        spawn("door", { position: { x, y, z } });
      }
    }
  }

  const floorTiles = [...tilesMap.values()].filter((tile) =>
    tile.tags?.has(DungeonTags.Floor),
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
