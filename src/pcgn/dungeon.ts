import { cloneDeep, random, sample, times } from "lodash";
import {
  type Pos,
  type PosId,
  type Rectangle,
  rectangle,
  rectsIntersect,
  toPosId,
} from "../lib/grid";
import { gameWorld } from "../ecs/engine";
import {
  healthPotionPrefab,
  wallPrefab,
  floorPrefab,
  ratPrefab,
  rockPrefab,
  stairsUpPrefab,
  stairsDownPrefab,
} from "../actors";

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

  dungeon.tiles = { ...dungeon.tiles, ...roomTiles, ...passageTiles };

  return dungeon;
};

export const generateDungeon = () => {
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
      gameWorld.world.add({ ...cloneDeep(wallPrefab), position: { x, y, z } });
    }
    if (tile.sprite === "FLOOR") {
      const { x, y, z } = tile;
      gameWorld.world.add({ ...cloneDeep(floorPrefab), position: { x, y, z } });
    }
  }

  dungeon.rooms.forEach((room, index) => {
    const spawn = sample([ratPrefab, rockPrefab, healthPotionPrefab]);
    if (index) {
      gameWorld.world.add({ ...cloneDeep(spawn), position: room.center });
    }
    if (index === 1) {
      const { x, y, z } = sample(room.tiles) || { x: 0, y: 0, z: 0 };
      gameWorld.world.add({
        ...cloneDeep(stairsUpPrefab),
        position: { x, y, z },
      });
    }
    if (index === 2) {
      const { x, y, z } = sample(room.tiles) || { x: 0, y: 0, z: 0 };
      gameWorld.world.add({
        ...cloneDeep(stairsDownPrefab),
        position: { x, y, z },
      });
    }
  });

  return dungeon;
};
