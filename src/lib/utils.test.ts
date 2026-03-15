import { describe, test, expect, afterEach, beforeEach, vi } from "vitest";
import {
  addLog,
  addSenseLog,
  colorEntity,
  colorEntityName,
  colorTag,
  em,
  entityNamePlate,
  getDisposition,
  getFloorBudget,
  getFrozenEntity,
  getModifier,
  getTier,
  getTotalVolume,
  isSamePosition,
  isWielding,
  mixHexWeighted,
  outOfBounds,
  transferFluid,
  weightedRandom,
} from "./utils";
import { getState, setState, State } from "../ecs/gameState";
import { setupTestGameWorld } from "../ecs/systems/test-utils";
import { Disposition, EntityKind, Fluids } from "../ecs/enums";
import { Entity, Fluid, FluidContainer } from "../ecs/engine";

const makeEntity = (partial: Partial<Entity> = {}): Entity => {
  return {
    id: "e-1",
    ...partial,
  } as Entity;
};

describe("addLog", () => {
  let originalLog: string[];
  beforeEach(() => {
    setupTestGameWorld();
    // Save and clear log
    originalLog = [...getState().log];
    setState((state: any) => {
      state.log.length = 0;
    });
  });
  afterEach(() => {
    // Restore log
    setState((state: any) => {
      state.log.length = 0;
      state.log.push(...originalLog);
    });
  });

  test("adds a new log entry", () => {
    addLog("Hello world");
    expect(getState().log[getState().log.length - 1]).toBe("Hello world");
  });

  test("deduplicates and counts repeated logs", () => {
    addLog("foo");
    addLog("foo");
    expect(getState().log[getState().log.length - 1]).toBe("foo (x2)");
    addLog("foo");
    expect(getState().log[getState().log.length - 1]).toBe("foo (x3)");
  });

  test("adds new log after different message", () => {
    addLog("foo");
    addLog("bar");
    expect(getState().log[getState().log.length - 1]).toBe("bar");
  });
});

describe("presentation helpers", () => {
  test("formats color tags with zero padding", () => {
    expect(colorTag(255)).toBe("§#0000ff§");
  });

  test("colors entity name when tint exists", () => {
    const entity = makeEntity({
      name: "Goblin",
      appearance: { tint: 0x00ff00 } as Entity["appearance"],
    });

    expect(colorEntity(entity)).toBe("§#00ff00§Goblin");
  });

  test("returns undefined when entity string path is missing", () => {
    const entity = makeEntity({
      appearance: { tint: 0x00ff00 } as Entity["appearance"],
    });
    expect(colorEntity(entity, "name")).toBeUndefined();
  });

  test("always appends reset tag in colorEntityName", () => {
    const tinted = makeEntity({
      name: "Knight",
      appearance: { tint: 0x123456 } as Entity["appearance"],
    });
    const plain = makeEntity({ name: "Knight" });

    expect(colorEntityName(tinted)).toBe("§#123456§Knight§reset§");
    expect(colorEntityName(plain)).toBe("Knight§reset§");
  });

  test("builds a default nameplate for missing fields", () => {
    expect(entityNamePlate(makeEntity())).toBe("§#00ff00§? noname§reset§");
  });

  test("em wraps text in purple reset tags", () => {
    expect(em("notice")).toBe("§purple§notice§reset§");
  });
});

describe("state and basic math helpers", () => {
  beforeEach(() => {
    setupTestGameWorld();
    setState((state: State) => {
      state.views.map = { width: 10, height: 5 } as State["views"]["map"];
    });
  });

  test("updates a sense log by key", () => {
    addSenseLog("You hear dripping", "hearing");
    expect(getState().senses.hearing).toBe("You hear dripping");
  });

  test("detects bounds correctly", () => {
    expect(outOfBounds({ x: -1, y: 1 })).toBe(true);
    expect(outOfBounds({ x: 9, y: 4 })).toBe(false);
    expect(outOfBounds({ x: 10, y: 4 })).toBe(true);
  });

  test("compares positions", () => {
    expect(isSamePosition({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
    expect(isSamePosition({ x: 1, y: 2 }, { x: 2, y: 1 })).toBe(false);
  });

  test("calculates D&D style modifier", () => {
    expect(getModifier(10)).toBe(0);
    expect(getModifier(18)).toBe(4);
    expect(getModifier(7)).toBe(-2);
  });

  test("checks if entity is wielding", () => {
    expect(
      isWielding(
        makeEntity({ weaponSlot: { name: "w", slots: 1, contents: ["w1"] } }),
      ),
    ).toBe(true);
    expect(
      isWielding(
        makeEntity({ weaponSlot: { name: "w", slots: 1, contents: [] } }),
      ),
    ).toBe(false);
  });
});

describe("entity and relationship helpers", () => {
  test("returns disposition by entity kind", () => {
    const actor = makeEntity({ entityKind: EntityKind.Undead });
    const target = makeEntity({ entityKind: EntityKind.Humanoid });
    expect(getDisposition(actor, target)).toBe(Disposition.Hostile);
  });

  test("defaults disposition to neutral when kind missing", () => {
    const actor = makeEntity({ entityKind: EntityKind.Player });
    const target = makeEntity();
    expect(getDisposition(actor, target)).toBe(Disposition.Neutral);
  });

  test("freezes entity memory map into plain object", () => {
    const entity = makeEntity({
      memory: {
        memories: new Map([["10,10", { id: "a" }]]),
      } as Entity["memory"],
    });

    const frozen = getFrozenEntity(entity);

    expect(frozen).toEqual({
      id: "e-1",
      memory: {
        memories: {
          "10,10": { id: "a" },
        },
      },
    });

    (entity.memory?.memories as Map<string, unknown>).set("11,11", { id: "b" });
    expect(frozen.memory.memories["11,11"]).toBeUndefined();
  });
});

describe("color and fluid math", () => {
  const makeFluid = (type: Fluids, volume: number): Fluid => ({
    type,
    volume,
    minFlow: 1,
    viscosity: 1,
    tint: 0,
  });

  test("mixes hex colors with and without weights", () => {
    expect(mixHexWeighted([], [])).toBe(0x000000);
    expect(mixHexWeighted([0xff0000, 0x00ff00], [1, 1])).toBe(0x7f7f00);
    expect(mixHexWeighted([0xffffff, 0x000000])).toBe(0x7f7f7f);
  });

  test("computes total fluid volume", () => {
    const container = {
      fluids: {
        water: makeFluid(Fluids.Water, 2),
        oil: makeFluid(Fluids.Oil, 5),
      },
    };

    expect(getTotalVolume(container)).toBe(7);
  });

  test("transferFluid obeys allow and deny lists", () => {
    const container: FluidContainer = {
      corked: false,
      maxVolume: 10,
      fluids: { water: makeFluid(Fluids.Water, 0) },
    };
    const containerFluid = container.fluids.water;
    const sourceFluid = makeFluid(Fluids.Water, 5);

    expect(
      transferFluid(container, containerFluid, sourceFluid, [Fluids.Oil], []),
    ).toBe(false);
    expect(
      transferFluid(container, containerFluid, sourceFluid, [], [Fluids.Water]),
    ).toBe(false);
  });

  test("transferFluid uses rate when possible", () => {
    const container: FluidContainer = {
      corked: false,
      maxVolume: 10,
      fluids: { water: makeFluid(Fluids.Water, 2) },
    };
    const sourceFluid = makeFluid(Fluids.Water, 8);

    const ok = transferFluid(
      container,
      container.fluids.water,
      sourceFluid,
      [],
      [],
      3,
    );
    expect(ok).toBe(true);
    expect(container.fluids.water.volume).toBe(5);
    expect(sourceFluid.volume).toBe(5);
  });

  test("transferFluid moves all or partial fluid depending on space", () => {
    const containerAll: FluidContainer = {
      corked: false,
      maxVolume: 10,
      fluids: { oil: makeFluid(Fluids.Oil, 2) },
    };
    const sourceAll = makeFluid(Fluids.Oil, 4);
    expect(
      transferFluid(containerAll, containerAll.fluids.oil, sourceAll, [], []),
    ).toBe(true);
    expect(containerAll.fluids.oil.volume).toBe(6);
    expect(sourceAll.volume).toBe(0);

    const containerPartial: FluidContainer = {
      corked: false,
      maxVolume: 5,
      fluids: { blood: makeFluid(Fluids.Blood, 4) },
    };
    const sourcePartial = makeFluid(Fluids.Blood, 4);
    expect(
      transferFluid(
        containerPartial,
        containerPartial.fluids.blood,
        sourcePartial,
        [],
        [],
      ),
    ).toBe(true);
    expect(containerPartial.fluids.blood.volume).toBe(5);
    expect(sourcePartial.volume).toBe(3);
  });
});

describe("random selection and scaling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("weightedRandom picks early item for low roll", () => {
    const items = [
      { key: "a", weight: 1 },
      { key: "b", weight: 3 },
    ];
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(weightedRandom(items)).toEqual(items[0]);
  });

  test("weightedRandom picks later item for high roll", () => {
    const items = [
      { key: "a", weight: 1 },
      { key: "b", weight: 3 },
    ];
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    expect(weightedRandom(items)).toEqual(items[1]);
  });

  test("calculates floor budget and tier", () => {
    expect(getFloorBudget(5, 3, 1.2)).toBe(15);
    expect(getTier(0)).toBe(0);
    expect(getTier(5)).toBe(1);
    expect(getTier(8, 4)).toBe(2);
  });
});
