import { beforeAll, describe, test, expect } from "vitest";
import { getAverageRoll } from "./combat";
import { gameWorld } from "../ecs/engine";

describe("grid", () => {
  beforeAll(() => () => {
    console.log(gameWorld);
  });

  describe("toPosId", () => {
    test("should work", () => {
      expect(getAverageRoll("1d8")).toBe(1);
    });
  });
});
