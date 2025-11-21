import { chars } from "../../actors/graphics";
import { type IGameWorld, type Entity } from "../engine";
import { OpenState } from "../enums";

export const createOpenableSystem = ({ world, registry }: IGameWorld) => {
  const openable = world.with("openable", "appearance");

  return function openSystem() {
    for (const actor of openable) {
      switch (actor.openable.state) {
        case OpenState.Ajar:
          actor.appearance.char = chars.doorAjar;
          break;
        case OpenState.Broken:
          actor.appearance.char = chars.doorBroken;
          break;
        case OpenState.Closed:
          actor.appearance.char = chars.doorClosed;
          break;
        case OpenState.Jammed:
          actor.appearance.char = chars.doorJammed;
          break;
        case OpenState.Open:
          actor.appearance.char = chars.doorOpen;
          break;
        case OpenState.Sealed:
          actor.appearance.char = chars.doorSealed;
          break;
      }
    }
  };
};
