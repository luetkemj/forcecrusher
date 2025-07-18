import { describe, test, expect, beforeEach, vi } from "vitest";
import type { Entity, IGameWorld } from "../engine";
import { DamageType } from "../enums";
import { setupTestGameWorld } from "./test-utils";
import { createAttackSystem } from "./attack.system";

// Mock DiceRoll for deterministic results
vi.mock("@dice-roller/rpg-dice-roller", () => ({
  DiceRoll: vi.fn().mockImplementation(() => {
    return { total: (globalThis as any).__mockedDiceRoll ?? 10 };
  }),
}));

describe("attack.system", () => {
  let gameWorld: IGameWorld;
  let attacker: Entity;
  let armedAttacker: Entity;
  let weapon: Entity;
  let target: Entity;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    attacker = {
      id: "attacker",
      pc: true,
      name: "Attacker",
      version: 1,
      strength: 14,
      attacks: [
        {
          name: "Punch",
          toHit: 0,
          attackType: "melee",
          damageRoll: "1d4",
          damageType: DamageType.Bludgeoning,
          verb: "hits",
          useModifier: true,
        },
      ],
    };
    armedAttacker = {
      id: "armedAttacker",
      pc: true,
      name: "Armed Attacker",
      version: 1,
      strength: 14,
      weaponSlot: {
        name: "weapon",
        contents: ["weapon"],
        slots: 1,
      },
    };
    weapon = {
      id: "weapon",
      name: "sword",
      version: 1,
      attacks: [
        {
          name: "Stab",
          verb: "stabs",
          toHit: 0,
          attackType: "melee",
          damageRoll: "1d6+2",
          damageType: DamageType.Piercing,
          useModifier: true,
        },
      ],
    };
    target = {
      id: "target",
      name: "Target",
      version: 1,
      health: { max: 10, current: 10 },
      damages: [],
      armorClass: 10,
      ai: true,
    };
    gameWorld.world.add(attacker);
    gameWorld.world.add(target);
    gameWorld.world.add(armedAttacker);
    gameWorld.world.add(weapon);
    // Reset dice roll
    (globalThis as any).__mockedDiceRoll = 10;
  });

  test("unarmed attacker hits target and deals damage", () => {
    // Set dice roll to hit
    (globalThis as any).__mockedDiceRoll = 15;
    // Set up attack target
    gameWorld.world.addComponent(attacker, "tryAttack", {
      targetId: target.id,
    });
    createAttackSystem(gameWorld)();
    expect(target.damages?.length).toBeGreaterThan(0);
    const damage = target.damages?.[0];
    expect(damage?.attacker).toBe(attacker.id);
    expect(damage?.target).toBe(target.id);
    expect(damage?.damageAmounts[0].amount).toBeGreaterThanOrEqual(1);
  });

  test("armed attacker hits target and deals damage", () => {
    // Set dice roll to hit
    (globalThis as any).__mockedDiceRoll = 15;
    // Set up attack target
    gameWorld.world.addComponent(armedAttacker, "tryAttack", {
      targetId: target.id,
    });
    createAttackSystem(gameWorld)();
    expect(target.damages?.length).toBeGreaterThan(0);
    const damage = target.damages?.[0];
    expect(damage?.attacker).toBe(armedAttacker.id);
    expect(damage?.target).toBe(target.id);
    expect(damage?.damageAmounts[0].amount).toBeGreaterThanOrEqual(1);
  });

  test("critical hit sets critical flag", () => {
    (globalThis as any).__mockedDiceRoll = 15; // Ensure hit
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.01); // Force crit
    target.damages = []; // Ensure damages is always an array
    gameWorld.world.addComponent(attacker, "tryAttack", {
      targetId: target.id,
    });
    createAttackSystem(gameWorld)();
    // Debug: log damages if test fails
    if (!target.damages || target.damages.length === 0) {
      // eslint-disable-next-line no-console
      console.error("Damages after attack:", target.damages);
    }
    expect(Array.isArray(target.damages)).toBe(true);
    expect(target.damages.length).toBeGreaterThan(0);
    const damage = target.damages[0];
    expect(damage).toBeDefined();
    expect(damage.critical).toBe(true);
    randomSpy.mockRestore();
  });

  test("no attack does nothing", () => {
    attacker.attacks = [];
    gameWorld.world.addComponent(attacker, "tryAttack", {
      targetId: target.id,
    });
    createAttackSystem(gameWorld)();
    expect(target.damages?.length).toBe(0);
  });
});
