import { each, random, sample, times } from "lodash";
import {
  type Pos,
  type PosId,
  type Rectangle,
  line,
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
  tags: Set<string>;
};

type Tiles = { [key: PosId]: Tile };

function digHorizontalPassage(posA: Pos, posB: Pos) {
  const tiles: Tiles = {};
  const start = Math.min(posA.x, posB.x);
  const end = Math.max(posA.x, posB.x) + 1;
  let x = start;

  while (x < end) {
    const tilePos = { ...posB, x };
    tiles[toPosId(tilePos)] = { ...tilePos, sprite: "FLOOR", tags: new Set() };
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
    tiles[toPosId(tilePos)] = { ...tilePos, sprite: "FLOOR", tags: new Set() };
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

  const addTags = (pos: Pos, tags: Array<string>) => {
    const posid = toPosId(pos);
    const tile = dungeon.tiles[posid];
    if (tile) {
      if (!tile.tags) tile.tags = new Set();
      tile.tags.add(...tags);
    }
  };

  // create room
  let roomTiles: Record<string, Tile> = {};

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
      roomTiles = { ...roomTiles, ...candidate.tiles } as Record<string, Tile>;
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
  for (const tile of Object.values(roomTiles) as Tile[]) {
    const { x, y, z } = tile;
    addTags({ x, y, z }, ["room"]);
  }

  for (const [key, tile] of Object.entries(passageTiles) as [string, Tile][]) {
    if (!tile.tags) tile.tags = new Set();
    tile.tags.add("passage");

    // If the tile also exists in roomTiles, merge tags
    const roomTile = roomTiles[key];
    if (roomTile?.tags) {
      tile.tags = new Set([...roomTile.tags, ...tile.tags]);
    }
  }

  // const addPerimeterTags = (cell: Pos) => {
  //   const posid = `${cell.x},${cell.y},0`;
  //   console.log(posid);
  //   if (dungeon.tiles[posid]) {
  //     if (!dungeon.tiles[posid].tags) {
  //       dungeon.tiles[posid].tags = new Set();
  //     }
  //     dungeon.tiles[posid].tags.add("WALL");
  //     dungeon.tiles[posid].tags.add("PERIMETER");
  //   }
  // };

  each(dungeon.rooms, (room) => {
    const sw = { x: room.x1, y: room.y2 - 1, z: 0 }; // sw
    const se = { x: room.x2 - 1, y: room.y2 - 1, z: 0 }; // se
    const nw = { x: room.x1, y: room.y1, z: 0 };
    const ne = { x: room.x2 - 1, y: room.y1, z: 0 };

    const tags = ["WALL", "PERIMETER"];
    line(nw, ne).forEach((pos) => addTags(pos, tags));
    line(ne, se).forEach((pos) => addTags(pos, tags));
    line(se, sw).forEach((pos) => addTags(pos, tags));
    line(sw, nw).forEach((pos) => addTags(pos, tags));
  });
  //
  // // Merge tiles with tag merging logic
  // for (const [key, tile] of Object.entries({
  //   ...roomTiles,
  //   ...passageTiles,
  // }) as [string, Tile][]) {
  //   dungeon.tiles[key] = {
  //     ...dungeon.tiles[key],
  //     ...tile,
  //     tags: new Set([
  //       ...(dungeon.tiles[key]?.tags ?? []),
  //       ...(tile.tags ?? []),
  //     ]),
  //   };
  // }

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
      tile.tags = new Set();

      const newTile = spawn("wall", { position: { x, y, z } });

      if (tile.tags.has("PERIMETER") && tile.tags.has("room")) {
        console.log("permiter", newTile);
        newTile.appearance.tint = 0x443355;
      }
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

  console.log(dungeon);

  return dungeon;
};
