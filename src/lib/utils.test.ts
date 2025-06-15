import { describe, test, expect, afterEach, beforeEach } from "vitest";
import { addLog } from "./utils";
import { getState, setState } from "../ecs/gameState";

describe("addLog", () => {
  let originalLog: string[];
  beforeEach(() => {
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
