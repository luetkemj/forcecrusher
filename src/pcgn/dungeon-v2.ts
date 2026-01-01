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
  circle,
} from "../lib/grid";
import { prefabs, spawn } from "../actors";
import {
  spawnSkeleton,
  spawnRat,
  spawnLavaGolem,
  spawnLivingSponge,
} from "./monsters";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { DungeonTags } from "../ecs/enums";
import { Constants } from "./constants";
import { Entity } from "../ecs/engine";
import { roomPrefabs } from "./terrain/prefabs";

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

type Branch = {
  x: number;
  y: number;
  w: number;
  h: number;
  children?: Branch[] | undefined;
};

const MAX_DEPTH = 10;
const MIN_SIZE = 8;
const SPLIT_MIN = 0.2;
const SPLIT_MAX = 0.8;

const bsp = (
  branch: Branch,
  depth = 0,
  maxDepth = MAX_DEPTH,
  minSize = MIN_SIZE,
  splitMin = SPLIT_MIN,
  splitMax = SPLIT_MAX,
): Branch => {
  // ----- base case -----
  if (depth >= maxDepth || branch.w < minSize * 2 || branch.h < minSize * 2) {
    return branch;
  }

  let children: Branch[];

  if (branch.w >= branch.h) {
    // ----- vertical split -----
    const w1 = Math.round(branch.w * random(splitMin, splitMax));
    const w2 = branch.w - w1;

    children = [
      {
        x: branch.x,
        y: branch.y,
        w: w1,
        h: branch.h,
      },
      {
        x: branch.x + w1,
        y: branch.y,
        w: w2,
        h: branch.h,
      },
    ];
  } else {
    // ----- horizontal split -----
    const h1 = Math.round(branch.h * random(0.3, 0.7));
    const h2 = branch.h - h1;

    children = [
      {
        x: branch.x,
        y: branch.y,
        w: branch.w,
        h: h1,
      },
      {
        x: branch.x,
        y: branch.y + h1,
        w: branch.w,
        h: h2,
      },
    ];
  }

  return {
    ...branch,
    children: children.map((child) => bsp(child, depth + 1, maxDepth, minSize)),
  };
};

const getLeaves = (branch: Branch, leaves: Branch[] = []) => {
  if (!branch.children) {
    leaves.push(branch);
  } else {
    for (const child of branch.children) {
      getLeaves(child, leaves);
    }
  }
  return leaves;
};

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

  const root: Branch = {
    x: 0,
    y: 0,
    w: width,
    h: height,
  };

  const tree = bsp(root);
  const leaves = getLeaves(tree);

  console.log(leaves);

  // const rooms = bsp({ x: pos.x, y: pos.y, w: width, h: height });

  for (const leaf of leaves) {
    const room = rectangle(
      {
        x: leaf.x + 1,
        y: leaf.y + 1,
        width: leaf.w - 2,
        height: leaf.h - 2,
        hasWalls: false,
      },
      {},
    );

    const center = room.center;
    const radius = Math.min(leaf.w / 2, leaf.h / 2);
    const circleRoom = circle(center, Math.round(radius - 1) + 0.5);

    for (const prefab of roomPrefabs) {
      if (!prefab) continue;

      const tmpl = prefab.template.split("\n").join("");

      console.log(tmpl);
      console.log(room.width >= prefab.w && room.height >= prefab.h);
      console.log(room, prefab);

      if (room.width >= prefab.w && room.height >= prefab.h) {
        // for (const [tile, index] of Object.entries(room.tiles)) {
        for (const [index, [key, tile]] of Object.entries(
          Object.entries(room.tiles),
        )) {
          console.log(index);
          console.log(tmpl[index]);
          console.log(tile);
          console.log(key);
          if (tmpl[index] === "#") {
            addTags(tile[1], [DungeonTags.Room, DungeonTags.Wall]);
          } else {
            addTags(tile[1], [DungeonTags.Room, DungeonTags.Floor]);
          }
        }

        dungeon.rooms.push(room);

        // for (const [row, rowIndex] of prefab.splitTemplate) {
        //   const y = leaf.y + rowIndex;
        //
        //   for (const [char, charIndex] of row) {
        //     const x = leaf.x + charIndex;
        //
        //     addTags(tile[1], [DungeonTags.Room, DungeonTags.Floor]);
        //   }
        // }
      } else {
        if (Math.random() < 0.3) {
          dungeon.rooms.push(circleRoom);

          for (const tile of Object.entries(circleRoom.tiles)) {
            addTags(tile[1], [DungeonTags.Room, DungeonTags.Floor]);
          }
        } else {
          // if (Math.random() < 0.75) {
          dungeon.rooms.push(room);

          for (const tile of Object.entries(room.tiles)) {
            addTags(tile[1], [DungeonTags.Room, DungeonTags.Floor]);
          }
        }
      }
    }
  }

  console.log(roomPrefabs);

  console.log({ dungeon, tilesMap });

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
    if (!tile) continue;
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
      const fluidTypes = ["lava", "oil", "water"];
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
    if (!tile) continue;
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

  const floorTiles = [...tilesMap.values()].filter((tile) => {
    if (!tile) return;
    tile.tags?.has(DungeonTags.Floor);
  });

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
        spawn("rock", { position: room.center });
      } else {
        spawn("bottleEmpty", { position: room.center });
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

  // // seed grass
  // // plant grass in room
  // type GrassMap = Record<PosId, Entity>;
  // const grassTiles: GrassMap = {};
  // dungeon.rooms.forEach((_) => {
  //   const { x, y } = sample(sample(dungeon.rooms)?.tiles) || { x: 0, y: 0 };
  //   const seedEntity = spawn("grass", { position: { x, y } });
  //   // grow grass
  //   if (seedEntity.position) {
  //     grassTiles[toPosId(seedEntity.position)] = seedEntity;
  //   }
  // });
  //
  // for (let _ = 0; _ < 10; _++) {
  //   Object.keys(grassTiles).forEach((posId) => {
  //     const pos = toPos(posId);
  //     const neighbors = getNeighbors(
  //       { x: pos.x, y: pos.y },
  //       "all",
  //       {
  //         width: Constants.dungeonWidth,
  //         height: Constants.dungeonHeight,
  //       },
  //       true,
  //     ) as Array<PosId>;
  //
  //     // if not already in the grassMap
  //     for (const neighbor of neighbors) {
  //       if (
  //         !grassTiles[neighbor] &&
  //         !dungeon.tiles[neighbor].tags.has("wall")
  //       ) {
  //         const newGrassPosition = toPos(neighbor);
  //         if (Math.random() < 0.2) {
  //           const newGrass = spawn("grass", { position: newGrassPosition });
  //           if (newGrass.position) {
  //             grassTiles[toPosId(newGrass.position)] = newGrass;
  //           }
  //         }
  //       }
  //     }
  //     // if is dirt from the dungeon
  //   });
  // }
  //
  // all floor tiles
  // check grass neighbors
  // on some random numb grow
  // continute for some amount of ticks

  return dungeon;
};
