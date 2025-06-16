import { describe, test, expect, beforeEach } from "vitest";
import type { Entity, IGameWorld, Attack, Damage } from "../engine";
import { DamageType } from "../enums";
import { setupTestGameWorld } from "./test-utils";
import { createDamageSystem } from "./damage.system";
import { getState } from "../gameState";

describe("damage.system", () => {
  let gameWorld: IGameWorld;
  let attacker: Entity;
  let target: Entity;
  let attack: Attack;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    attacker = {
      id: "attacker",
      name: "Attacker",
      version: 1,
      pc: true,
    };
    attack = {
      name: "Punch",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4",
      damageType: DamageType.Bludgeoning,
      verb: "hits",
      magical: false,
      useModifier: true,
    };
    target = {
      id: "target",
      name: "Target",
      version: 1,
      health: { max: 10, current: 10 },
      damages: [],
    };
    gameWorld.world.add(attacker);
    gameWorld.world.add(target);
  });

  function addDamageToTarget(damage: Partial<Damage>) {
    target.damages = [
      {
        attacker: attacker.id,
        attack,
        target: target.id,
        critical: false,
        damageAmounts: [{ type: DamageType.Bludgeoning, amount: 4, mod: 0 }],
        ...damage,
      },
    ];
  }

  test("applies normal damage", () => {
    addDamageToTarget({});
    createDamageSystem(gameWorld.world, gameWorld.registry)();
    expect(target.health?.current).toBe(6);
    expect(target.damages?.length).toBe(0);
    const { log } = getState();
    expect(log[log.length - 1]).toContain("for 4hp!");
  });

  test("applies vulnerability (double damage)", () => {
    target.vulnerabilities = [DamageType.Bludgeoning];
    addDamageToTarget({});
    createDamageSystem(gameWorld.world, gameWorld.registry)();
    expect(target.health?.current).toBe(2);
    const { log } = getState();
    expect(log[log.length - 1]).toContain("Vulnerable!");
    expect(log[log.length - 1]).toContain("8hp!");
  });

  test("applies resistance (half damage)", () => {
    target.resistances = [DamageType.Bludgeoning];
    addDamageToTarget({});
    createDamageSystem(gameWorld.world, gameWorld.registry)();
    expect(target.health?.current).toBe(8);
    const { log } = getState();
    expect(log[log.length - 1]).toContain("Resistant!");
    expect(log[log.length - 1]).toContain("2hp!");
  });

  test("applies immunity (zero damage)", () => {
    target.immunities = [DamageType.Bludgeoning];
    addDamageToTarget({});
    createDamageSystem(gameWorld.world, gameWorld.registry)();
    expect(target.health?.current).toBe(10);
    const { log } = getState();
    expect(log[log.length - 1]).toContain("Immune!");
    expect(log[log.length - 1]).toContain("for 0hp!");
  });

  test("applies critical hit (double damage)", () => {
    target.vulnerabilities = [DamageType.Bludgeoning];
    addDamageToTarget({ critical: true });
    createDamageSystem(gameWorld.world, gameWorld.registry)();
    expect(target.health?.current).toBe(-6);
    const { log } = getState();
    expect(log[log.length - 1]).toContain("Critical!");
    expect(log[log.length - 1]).toContain("Vulnerable!");
    expect(log[log.length - 1]).toContain("16hp!");
  });

  test("applies critical hit (double damage) after vulnerability, resistance, and immunities", () => {
    addDamageToTarget({ critical: true });
    createDamageSystem(gameWorld.world, gameWorld.registry)();
    expect(target.health?.current).toBe(2);
    const { log } = getState();
    expect(log[log.length - 1]).toContain("Critical!");
    expect(log[log.length - 1]).toContain("for 8hp!");
  });

  test("applies damage modifier", () => {
    addDamageToTarget({
      damageAmounts: [{ type: DamageType.Bludgeoning, amount: 4, mod: 2 }],
    });
    createDamageSystem(gameWorld.world, gameWorld.registry)();
    expect(target.health?.current).toBe(4);
    const { log } = getState();
    expect(log[log.length - 1]).toContain("Attacker");
    expect(log[log.length - 1]).toContain("for 6hp!");
  });
});
