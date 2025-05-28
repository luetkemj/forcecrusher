import { describe, test, expect, beforeEach } from "vitest";
import {
  serializeRegistry,
  deserializeRegistry,
  serializeZones,
  deserializeZones,
  serializeState,
  deserializeState,
  type Entity,
} from "./engine";

describe("registry utils", () => {
  let registry: any;
  let serializedRegistry: any;

  beforeEach(() => {
    registry = new Map<string, Entity>();

    const e1 = { id: "123", version: 1, name: "e1" };
    const e2 = { id: "456", version: 1, name: "e2" };
    const e3 = { id: "789", version: 1, name: "e3" };

    registry.set(e1.id, e1);
    registry.set(e2.id, e1);
    registry.set(e3.id, e1);

    serializedRegistry = `{"123":{"id":"123","version":1,"name":"e1"},"456":{"id":"123","version":1,"name":"e1"},"789":{"id":"123","version":1,"name":"e1"}}`;
  });

  describe("serializeRegistry", () => {
    test("should work", () => {
      expect(serializeRegistry(registry)).toBe(serializedRegistry);
    });
  });

  describe("deserializeRegistry", () => {
    test("should work", () => {
      const obj = {
        "123": { id: "123", version: 1, name: "e1" },
        "456": { id: "123", version: 1, name: "e1" },
        "789": { id: "123", version: 1, name: "e1" },
      };
      const registry = new Map(Object.entries(obj));
      expect(deserializeRegistry(serializedRegistry)).toEqual(registry);
    });
  });
});

describe("zone utils", () => {
  let zones: any;
  let serializedZones: any;

  beforeEach(() => {
    zones = new Map<string, Set<string>>();

    const z1 = { id: "1", ids: new Set(["1", "2", "3"]) };
    const z2 = { id: "2", ids: new Set(["4", "5", "6"]) };
    const z3 = { id: "3", ids: new Set(["7", "8", "9"]) };

    zones.set(z1.id, z1.ids);
    zones.set(z2.id, z2.ids);
    zones.set(z3.id, z3.ids);

    serializedZones = `[["1",["1","2","3"]],["2",["4","5","6"]],["3",["7","8","9"]]]`;
  });

  describe("serializeZones", () => {
    test("should work", () => {
      expect(serializeZones(zones)).toBe(serializedZones);
    });
  });

  describe("deserializeZones", () => {
    test("should work", () => {
      expect(deserializeZones(serializedZones)).toEqual(zones);
    });
  });
});

describe("state utils", () => {
  let state: any;
  let serializedState: any;

  beforeEach(() => {
    state = {
      log: ["one", "two", "three"],
      zoneId: "0,0,0",
      playerId: "123abc",
      version: 1,
    };
    serializedState = `{"log":["one","two","three"],"zoneId":"0,0,0","playerId":"123abc","version":1}`;
  });

  describe("serializeState", () => {
    test("should work", () => {
      expect(serializeState(state)).toBe(serializedState);
    });
  });

  describe("deserializeState", () => {
    test("should work", () => {
      expect(deserializeState(serializedState)).toEqual(state);
    });
  });
});
