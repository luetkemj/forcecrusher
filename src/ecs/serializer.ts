import { World } from "miniplex";
import { Inflate, deflate } from "pako";
import { Entity } from "./engine";

interface SerializedWorldData {
  entities: Entity[];
}

class WorldSerializer {
  constructor(public readonly world: World<Entity>) {}

  public toJSON(): SerializedWorldData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { entities } = this.world as any;

    return {
      entities: entities,
    };
  }

  static fromJSON(json: SerializedWorldData): World<Entity> {
    const instance = new WorldSerializer(new World<Entity>(json.entities));
    return instance.world;
  }
}

export function stringifyWorld(world: World<Entity>): string {
  return JSON.stringify(new WorldSerializer(world));
}

/**
 * Serializes the world and chunks the array buffer. Uses pako deflate
 * @param world
 * @param chunkSize
 * @returns array of buffers
 */
export function serializeWorld(
  world: World<Entity>,
  chunkSize: number,
): ArrayBuffer[] {
  const deflated = deflate(JSON.stringify(new WorldSerializer(world)));
  const buffers: ArrayBuffer[] = [];

  for (let i = 0; i < deflated.byteLength; i += chunkSize) {
    const chunk = deflated.slice(i, i + chunkSize);
    buffers.push(chunk);
  }

  return buffers;
}

/**
 * Deserializes the world from chunks. Uses pako inflate from provided chunks
 * @param buffers
 * @param maxEntities
 * @returns world
 */
export function deserializeWorld(
  buffers: ArrayBuffer[] | undefined,
): World<Entity> {
  let world: World<Entity>;

  // Use pako to inflate the chunks
  if (buffers && buffers.length !== 0) {
    const inflate = new Inflate({ to: "string" });

    for (let i = 0; i < buffers.length; i++) {
      const chunk = buffers[i];

      if (i >= buffers.length) {
        inflate.push(chunk, true);
      } else {
        inflate.push(chunk, false);
      }
    }

    if (inflate.err) {
      console.error(inflate.err);
      throw new Error(inflate.msg);
    }

    // Deserialize the world from the inflate buffer
    if (inflate.result) {
      world = WorldSerializer.fromJSON(JSON.parse(inflate.result as string));
    } else {
      throw new Error("Fatal error: Inflate result is null during loading.");
    }
  } else {
    world = new World<Entity>();
  }

  return world;
}
