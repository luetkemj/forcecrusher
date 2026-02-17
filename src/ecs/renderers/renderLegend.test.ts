import { describe, test, expect } from "vitest";
import { getHearts } from "./renderLegend";

describe("renderLegend", () => {
  describe("getHearts", () => {
    test("no health", () => {
      const hearts = getHearts(30, 0, 10);

      expect(hearts).toEqual([
        {
          fullHearts: 0,
          halfHearts: 0,
          emptyHearts: 6,
        },
      ]);
    });

    test("negative health", () => {
      const hearts = getHearts(30, -10, 10);

      expect(hearts).toEqual([
        {
          fullHearts: 0,
          halfHearts: 0,
          emptyHearts: 6,
        },
      ]);
    });

    test("over health", () => {
      const hearts = getHearts(30, 40, 10);

      expect(hearts).toEqual([
        {
          fullHearts: 6,
          halfHearts: 0,
          emptyHearts: 0,
        },
      ]);
    });

    test("with some damage", () => {
      const hearts = getHearts(30, 23, 10);

      expect(hearts).toEqual([
        {
          fullHearts: 4,
          halfHearts: 1,
          emptyHearts: 1,
        },
      ]);
    });

    test("with floating damage", () => {
      const hearts = getHearts(30, 23.122892837882, 10);

      expect(hearts).toEqual([
        {
          fullHearts: 4,
          halfHearts: 1,
          emptyHearts: 1,
        },
      ]);
    });

    test("with minimial health big damage", () => {
      const hearts = getHearts(1, -10, 10);

      expect(hearts).toEqual([
        {
          fullHearts: 0,
          halfHearts: 0,
          emptyHearts: 1,
        },
      ]);
    });

    test("with multiple rows", () => {
      const hearts = getHearts(15, 7, 1);

      expect(hearts).toEqual([
        {
          fullHearts: 1,
          halfHearts: 0,
          emptyHearts: 0,
        },
        {
          fullHearts: 0,
          halfHearts: 1,
          emptyHearts: 0,
        },
        {
          fullHearts: 0,
          halfHearts: 0,
          emptyHearts: 1,
        },
      ]);
    });
  });
});
