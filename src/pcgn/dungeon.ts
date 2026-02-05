import { random, sample, times } from "lodash";
import {
  type Pos,
  type PosId,
  type Rectangle,
  line,
  rectangle,
  rectsIntersect,
  toPosId,
  getNeighbors,
  toPos,
} from "../lib/grid";
import { spawn } from "../actors";
import {
  spawnSkeleton,
  spawnRat,
  spawnLavaGolem,
  spawnLivingSponge,
} from "./monsters";
import { spawnSpellscroll } from "./items";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { DungeonTags } from "../ecs/enums";
import { Constants } from "./constants";
import { Entity } from "../ecs/engine";

type Tile = {
  x: number;
  y: number;
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

  const { x, y } = pos;

  // fill the entire space with dirt so we can dig it out later
  const dungeon: Dungeon = {
    ...rectangle({ x, y, width, height, hasWalls: false }, {}),
    rooms: [],
  };

  // During generation
  const tilesMap = new Map<string, any>(Object.entries(dungeon.tiles));

  const addTags = ({ x, y }: any, tags: Array<string>) => {
    const posId = toPosId({ x, y });
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
      { x: rx, y: ry, width: rw, height: rh, hasWalls: true },
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
  for (let room of dungeon.rooms) {
    const sw = { x: room.x1, y: room.y2 - 1 }; // sw
    const se = { x: room.x2 - 1, y: room.y2 - 1 }; // se
    const nw = { x: room.x1, y: room.y1 };
    const ne = { x: room.x2 - 1, y: room.y1 };

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

export const generateDungeon = () => {
  // zoneId is now just a string, depth logic can be handled elsewhere if needed
  const depth = 0;

  const { dungeon, tilesMap } = buildDungeon({
    pos: { x: 0, y: 0 },
    width: Constants.dungeonWidth,
    height: Constants.dungeonHeight,
    minRoomSize: 8,
    maxRoomSize: 18,
    maxRoomCount: 100,
  });

  const entityMap = new Map();

  for (const [_, tile] of tilesMap) {
    const { x, y } = tile;
    // create dirt
    if (tile.tags.has(DungeonTags.Dirt) && !tile.tags.has(DungeonTags.Floor)) {
      const entity = spawn("wall", { position: { x, y } });
      entityMap.set(toPosId({ x, y }), entity);
    }

    // create floors
    if (
      tile.tags.has(DungeonTags.Floor) ||
      tile.tags.has(DungeonTags.Passage)
    ) {
      const entity = spawn("floor", { position: { x, y } });
      entityMap.set(toPosId({ x, y }), entity);

      // add fluidContainers to every open floor tile
      const fEntity = spawn("fluidContainer", { position: { x, y } });
      // randomly fill containers with fluid to create pools
      const fluidTypes = ["blood", "oil", "water"];
      if (Math.random() < 0.005) {
        if (fEntity.fluidContainer) {
          const volume = random(5, 20);
          fEntity.fluidContainer.fluids[sample(fluidTypes) || "water"].volume =
            volume;
        }
      }
    }
  }

  for (const [_, tile] of tilesMap) {
    const { x, y } = tile;
    // create doors
    if (tile.tags.has(DungeonTags.Perimeter)) {
      // if two of your neighbors are walls you are a door
      const neighbors = getNeighbors(
        { x, y },
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
        spawn("door", { position: { x, y } });
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
    const position = { x: openTile.x, y: openTile.y };
    const percentile = new DiceRoll("d100").total;

    if (percentile <= 5) {
      spawnLavaGolem(position);
    }
    if (percentile > 5 && percentile <= 10) {
      spawnLivingSponge(position);
    }
    if (percentile > 10 && percentile <= 20) {
      spawnSkeleton(position);
    }
    if (percentile > 20) {
      spawnRat(position);
    }
  });

  // increase number of enemies as you get deeper
  dungeon.rooms.forEach((room, index) => {
    const percentile = new DiceRoll("d100").total;
    if (index) {
      if (percentile >= 90) {
        spawn("healthPotion", { position: room.center });
      } else {
        spawnSpellscroll(room.center);
      }
    }
    if (index === 1) {
      const { x, y } = sample(room.tiles) || { x: 0, y: 0 };
      spawn("stairsUp", { position: { x, y } });
    }
    if (index === 2) {
      const { x, y } = sample(room.tiles) || { x: 0, y: 0 };
      spawn("stairsDown", { position: { x, y } });
    }
  });

  // seed grass
  // plant grass in room
  type GrassMap = Record<PosId, Entity>;
  const grassTiles: GrassMap = {};
  dungeon.rooms.forEach((_) => {
    const { x, y } = sample(sample(dungeon.rooms)?.tiles) || { x: 0, y: 0 };
    const seedEntity = spawn("grass", { position: { x, y } });
    // grow grass
    if (seedEntity.position) {
      grassTiles[toPosId(seedEntity.position)] = seedEntity;
    }
  });

  for (let _ = 0; _ < 10; _++) {
    Object.keys(grassTiles).forEach((posId) => {
      const pos = toPos(posId);
      const neighbors = getNeighbors(
        { x: pos.x, y: pos.y },
        "all",
        {
          width: Constants.dungeonWidth,
          height: Constants.dungeonHeight,
        },
        true,
      ) as Array<PosId>;

      // if not already in the grassMap
      for (const neighbor of neighbors) {
        if (
          !grassTiles[neighbor] &&
          !dungeon.tiles[neighbor].tags.has("wall")
        ) {
          const newGrassPosition = toPos(neighbor);
          if (Math.random() < 0.2) {
            const newGrass = spawn("grass", { position: newGrassPosition });
            if (newGrass.position) {
              grassTiles[toPosId(newGrass.position)] = newGrass;
            }
          }
        }
      }
      // if is dirt from the dungeon
    });
  }

  // all floor tiles
  // check grass neighbors
  // on some random numb grow
  // continute for some amount of ticks

  return dungeon;
};
