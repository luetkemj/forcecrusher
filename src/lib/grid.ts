import _ from "lodash";

export type PosId = string;
export type Pos = { x: number; y: number };

export const toPosId = (pos: Pos): PosId => {
  return `${pos.x},${pos.y}`;
};

export const toPos = (posId: PosId): Pos => {
  const coords = posId.split(",").map((coord) => parseInt(coord, 10));
  return { x: coords[0], y: coords[1] };
};

export const insideCircle = (
  center: Pos,
  radius: number,
  candidate: Pos,
): Boolean => {
  const dx = center.x - candidate.x;
  const dy = center.y - candidate.y;
  const distance_squared = dx * dx + dy * dy;
  return distance_squared <= radius * radius;
};

export const circle = (center: Pos, radius: number) => {
  const diameter = radius % 1 ? radius * 2 : radius * 2 + 1;
  const top = center.y - radius;
  const bottom = center.y + radius;
  const left = center.x - radius;
  const right = center.x + radius;

  const posIds: Array<PosId> = [];

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const cx = Math.ceil(x);
      const cy = Math.ceil(y);
      const candidate = { x: cx, y: cy };
      if (insideCircle(center, radius, candidate)) {
        posIds.push(toPosId(candidate));
      }
    }
  }

  return {
    posIds,
    center: toPosId(center),
    diameter,
    top,
    bottom,
    left,
    right,
  };
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + t * (end - start);
};

export const lerpPoint = (pos0: Pos, pos1: Pos, t: number): Pos => {
  const x = lerp(pos0.x, pos1.x, t);
  const y = lerp(pos0.y, pos1.y, t);
  return { x, y };
};

export const diagonalDistance = (pos0: Pos, pos1: Pos): number => {
  const dx = pos1.x - pos0.x;
  const dy = pos1.y - pos0.y;
  return Math.max(Math.abs(dx), Math.abs(dy));
};

export const roundPoint = (pos: Pos) => {
  const x = Math.round(pos.x);
  const y = Math.round(pos.y);
  return { x, y };
};

export const line = (pos0: Pos, pos1: Pos): Array<Pos> => {
  let positions = [];
  let N = diagonalDistance(pos0, pos1);
  for (let step = 0; step <= N; step++) {
    let t = N === 0 ? 0.0 : step / N;
    positions.push(roundPoint(lerpPoint(pos0, pos1, t)));
  }
  return positions;
};

type Tile = { x: number; y: number; [key: string]: any };
type Tiles = { [key: string]: Tile };
export type Rectangle = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  center: Pos;
  hasWalls: boolean;
  tiles: Tiles;
  width: number;
  height: number;
};

interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  hasWalls: boolean;
}

export const rectangle = (
  rectangleProps: RectangleProps,
  tileProps: any,
): Rectangle => {
  const { x, y, width, height, hasWalls } = rectangleProps;

  const tiles: Tiles = {};

  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  if (hasWalls) {
    for (let yi = y1 + 1; yi < y2 - 1; yi++) {
      for (let xi = x1 + 1; xi < x2 - 1; xi++) {
        tiles[`${xi},${yi}`] = { x: xi, y: yi, ...tileProps };
      }
    }
  } else {
    for (let yi = y1; yi < y2; yi++) {
      for (let xi = x1; xi < x2; xi++) {
        tiles[`${xi},${yi}`] = { x: xi, y: yi, ...tileProps };
      }
    }
  }

  const center = {
    x: Math.round((x1 + x2) / 2),
    y: Math.round((y1 + y2) / 2),
  };

  return { x1, x2, y1, y2, center, hasWalls, tiles, width, height };
};

export const rectsIntersect = (rect1: Rectangle, rect2: Rectangle): boolean => {
  return (
    rect1.x1 <= rect2.x2 &&
    rect1.x2 >= rect2.x1 &&
    rect1.y1 <= rect2.y2 &&
    rect1.y2 >= rect2.y1
  );
};

export const distance = (pos1: Pos, pos2: Pos): number => {
  const x = Math.pow(pos2.x - pos1.x, 2);
  const y = Math.pow(pos2.y - pos1.y, 2);
  return Math.floor(Math.sqrt(x + y));
};

type RectDimensions = {
  width: number;
  height: number;
  mapX: number;
  mapY: number;
};

export const isOnRectEdge = (
  pos: Pos,
  rectDimensions: RectDimensions,
): boolean => {
  const { width, height, mapX, mapY } = rectDimensions;

  if (pos.x === mapX) return true; // west edge
  if (pos.y === mapY) return true; // north edge
  if (pos.x === mapX + width - 1) return true; // east edge
  if (pos.y === mapY + height - 1) return true; // south edge

  return false;
};

type Point = {
  x: number;
  y: number;
};
type Points = Array<Point>;

export const CARDINAL = [
  { x: 0, y: -1 }, // N
  { x: 1, y: 0 }, // E
  { x: 0, y: 1 }, // S
  { x: -1, y: 0 }, // W
];

export const DIAGONAL = [
  { x: 1, y: -1 }, // NE
  { x: 1, y: 1 }, // SE
  { x: -1, y: 1 }, // SW
  { x: -1, y: -1 }, // NW
];

export const ALL = [...CARDINAL, ...DIAGONAL];

type Dimensions = {
  width: number;
  height: number;
};

export const getNeighbors = (
  pos: Pos,
  dir: string,
  boundary: Dimensions,
  asIds: boolean,
): Array<Pos> | Array<string> => {
  let direction: Points = [];
  if (dir === "cardinal") direction = [...CARDINAL];
  if (dir === "diagonal") direction = [...DIAGONAL];
  if (dir === "all") direction = [...CARDINAL, ...DIAGONAL];

  const neighbors: Array<Pos> = [];

  for (let dir of direction) {
    let candidate: Pos = {
      x: pos.x + dir.x,
      y: pos.y + dir.y,
    };
    if (
      candidate.x >= 0 &&
      candidate.x < boundary.width &&
      candidate.y >= 0 &&
      candidate.y < boundary.height
    ) {
      neighbors.push(candidate);
    }
  }

  if (asIds) return neighbors.map(toPosId);

  return neighbors;
};

export const isAtSamePosition = (pos1: Pos, pos2: Pos): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

export const isNeighbor = (pos1: Pos, pos2: Pos): boolean => {
  const { x: ax, y: ay } = pos1;
  const { x: bx, y: by } = pos2;

  if (
    (ax - bx === 1 && ay - by === 0) ||
    (ax - bx === 0 && ay - by === -1) ||
    (ax - bx === -1 && ay - by === 0) ||
    (ax - bx === 0 && ay - by === 1)
  ) {
    return true;
  }

  return false;
};

export const randomNeighbor = (pos: Pos): Pos => {
  const direction = _.sample(CARDINAL);
  const x = pos.x + direction!.x;
  const y = pos.y + direction!.y;
  return { x, y };
};

type DirMap = { [key: string]: number };

export const getNeighbor = (pos: Pos, dir: string): Pos => {
  const dirMap: DirMap = { N: 0, E: 1, S: 2, W: 3, NE: 4, SE: 5, SW: 6, NW: 7 };
  const direction = ALL[dirMap[dir]];
  return {
    x: pos.x + direction.x,
    y: pos.y + direction.y,
  };
};

type Direction = {
  dir: string;
  x: number;
  y: number;
};

export const getDirection = (posA: Pos, posB: Pos): Direction => {
  const { x: ax, y: ay } = posA;
  const { x: bx, y: by } = posB;

  let dir = "";

  if (ax - bx === -1 && ay - by === -1) dir = "NW";
  if (ax - bx === 1 && ay - by === -1) dir = "NE";
  if (ax - bx === 1 && ay - by === 1) dir = "SE";
  if (ax - bx === -1 && ay - by === 1) dir = "SW";

  if (ax - bx === 1 && ay - by === 0) dir = "E";
  if (ax - bx === 0 && ay - by === -1) dir = "N";
  if (ax - bx === -1 && ay - by === 0) dir = "W";
  if (ax - bx === 0 && ay - by === 1) dir = "S";

  if (ax - bx === 0 && ay - by === 0) dir = "X";

  return { dir, x: ax - bx, y: ay - by };
};

export function moveInDirection(start: Pos, dir: Direction, n: number): Pos {
  return {
    x: start.x + dir.x * n,
    y: start.y + dir.y * n,
  };
}

// is this right? wonder if maybe it should be reversed...
// you go from point a to point b... right?
export const getVelocity = (posA: Pos, posB: Pos): Point => {
  const { x: ax, y: ay } = posA;
  const { x: bx, y: by } = posB;

  const velocity = { x: ax - bx, y: ay - by };

  return velocity;
};
