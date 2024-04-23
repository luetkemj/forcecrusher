import { getState } from "../main";
import { Pos, PosId, toPosId } from "../lib/grid";
import { World } from "miniplex";

type Entity = {
  position?: { x: number; y: number; z: number };
  tryMove?: { x: number; y: number; z: number };
  appearance?: {
    char: string;
    tint: number;
    tileSet: string;
  };
};

// yes these should be in state. but I am busy and have to stop now.
type Worlds = { [key: PosId]: World };
type Queries = { [key: PosId]: { [key: string]: Function } };

const worlds:Worlds = {};
const queries:Queries = {};

export const getOrCreateWorld = (zone: Pos) => {
  // check if zone is the same as that stored in state...
  // should the worlds and queries be stored in state too?
  const worldPosId = toPosId(zone);
  if (worlds[worldPosId]) {
    // need to check if we need to reIndex (store current zone somewhere)
    return worlds[worldPosId];
  }

  // create world that doesn't exist
  worlds[worldPosId] = new World<Entity>()
  queries[worldPosId] = {
    renderable: () => worlds[worldPosId].with('position', 'appearance')
  }

  indexQueries(zone);

  console.log(worlds)
  console.log(queries)
};

const indexQueries = (zone: Pos) => {
  const worldPosId = toPosId(zone);
  const worldQueries = queries[worldPosId]
  const keys = Object.keys(worldQueries)
  console.log(keys)
  console.log(worldQueries)
  keys.forEach(key => {
    worldQueries[key]();
  })
}

// each query must be reIndexed with the correct world on world change.
// or maybe they just all exist on an object keyed by world PosIds...

// worlds: {
//   wPosId: World
//   ...
// }
//
// queries: {
//   wPosId: { appearanceQuery: Query, ... }
//   ...
// }

// export const queries = {
//   moving: world.with("position", "velocity"),
//   health: world.with("health"),
//   poisoned: queries.health.with("poisoned")
// }

// create new world, checks for existing world at pos
// if one exists, load it
// if not, create it
//
// but there are functions that will set the world and set the corresponding queries to that world such that systems can reuse the correct world and query based on location.
// saving and loading consists of storing each world ever created. I suppose that could get to be a lot...
// but that's the nature of games right?
// export const createNewWorld = () => {
//   const world = new World<Entity>();
//
//   return world;
// };
//
// export const getWorld = (): World => {
//   const worldPosId = toPosId(getState().worldPos);
//   return getState().worlds[worldPosId];
// };
