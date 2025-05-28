import { describe, test, expect } from "vitest";
import { serializeRegistry, parseRegistry, type Entity } from "./engine";

describe("serializeRegistry", () => {
  test("should work", () => {
    const registry = new Map<string, Entity>();
    const e1 = { id: "123", version: 1, name: "e1" };
    const e2 = { id: "456", version: 1, name: "e2" };
    const e3 = { id: "789", version: 1, name: "e3" };

    registry.set(e1.id, e1);
    registry.set(e2.id, e1);
    registry.set(e3.id, e1);

    expect(serializeRegistry(registry)).toBe(
      `{"123":{"id":"123","version":1,"name":"e1"},"456":{"id":"123","version":1,"name":"e1"},"789":{"id":"123","version":1,"name":"e1"}}`,
    );
  });
});

describe("parseRegistry", () => {
  test("should work", () => {
    const obj = {
      "123": { id: "123", version: 1, name: "e1" },
      "456": { id: "123", version: 1, name: "e1" },
      "789": { id: "123", version: 1, name: "e1" },
    };
    const registry = new Map(Object.entries(obj));
    expect(
      parseRegistry(
        `{"123":{"id":"123","version":1,"name":"e1"},"456":{"id":"123","version":1,"name":"e1"},"789":{"id":"123","version":1,"name":"e1"}}`,
      ),
    ).toEqual(registry);
  });
});
