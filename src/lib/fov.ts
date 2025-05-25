import { With, Query } from "miniplex";
import { Entity } from "../ecs/engine";
import { type Pos, toPosId } from "./grid";

type Transform = {
  xx: number;
  xy: number;
  yx: number;
  yy: number;
};

const octantTransforms = [
  { xx: 1, xy: 0, yx: 0, yy: 1 },
  { xx: 1, xy: 0, yx: 0, yy: -1 },
  { xx: -1, xy: 0, yx: 0, yy: 1 },
  { xx: -1, xy: 0, yx: 0, yy: -1 },
  { xx: 0, xy: 1, yx: 1, yy: 0 },
  { xx: 0, xy: 1, yx: -1, yy: 0 },
  { xx: 0, xy: -1, yx: 1, yy: 0 },
  { xx: 0, xy: -1, yx: -1, yy: 0 },
];

export default function createFOV(
  opaqueEntities: Query<With<Entity, "opaque" | "position">>,
  width: number,
  height: number,
  pos: Pos,
  radius: number,
) {
  const { x: originX, y: originY, z: originZ } = pos;

  const visible: Set<string> = new Set();

  const blockingLocations = new Set();

  for (const entity of opaqueEntities) {
    if (entity.position.z === originZ) {
      blockingLocations.add(toPosId(entity.position));
    }
  }

  const isOpaque = (x: number, y: number) => {
    const locId = `${x},${y},${originZ}`;
    return !!blockingLocations.has(locId);
  };
  const reveal = (x: number, y: number) => {
    return visible.add(`${x},${y},${originZ}`);
  };

  function castShadows(
    originX: number,
    originY: number,
    row: number,
    start: number,
    end: number,
    transform: Transform,
    radius: number,
  ) {
    let newStart = 0;
    if (start < end) return;

    let blocked = false;

    for (let distance = row; distance < radius && !blocked; distance++) {
      const deltaY = -distance;
      for (let deltaX = -distance; deltaX <= 0; deltaX++) {
        const currentX =
          originX + deltaX * transform.xx + deltaY * transform.xy;
        const currentY =
          originY + deltaX * transform.yx + deltaY * transform.yy;

        const leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
        const rightSlope = (deltaX + 0.5) / (deltaY - 0.5);

        if (
          !(
            currentX >= 0 &&
            currentY >= 0 &&
            currentX < width &&
            currentY < height
          ) ||
          start < rightSlope
        ) {
          continue;
        } else if (end > leftSlope) {
          break;
        }

        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= radius) {
          reveal(currentX, currentY);
        }

        if (blocked) {
          if (isOpaque(currentX, currentY)) {
            newStart = rightSlope;
            continue;
          } else {
            blocked = false;
            start = newStart;
          }
        } else {
          if (isOpaque(currentX, currentY) && distance < radius) {
            blocked = true;
            castShadows(
              originX,
              originY,
              distance + 1,
              start,
              leftSlope,
              transform,
              radius,
            );
            newStart = rightSlope;
          }
        }
      }
    }
  }

  reveal(originX, originY);
  for (const octant of octantTransforms) {
    castShadows(originX, originY, 1, 1, 0, octant, radius);
  }

  return {
    fov: visible,
  };
}
