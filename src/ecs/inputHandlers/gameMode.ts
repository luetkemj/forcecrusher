import { isUndefined } from "lodash";
import { ChangeZoneDirections } from "../engine";
import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { toPosId, isAtSamePosition, toZone, toZoneId } from "../../lib/grid";
import { isMoveKey, getDirectionFromKey, Keys } from "./KeyMap";

export const handleGameModeInput = ({
  key,
  world,
  player,
  state,
  gameState,
  setState,
  saveGameData,
  loadGameData,
  changeZone,
  addLog,
}: InputContext) => {
  // these should be provided in context?
  const pickUpQuery = world.with("pickUp");
  const stairsUpQuery = world.with("stairsUp", "position");
  const stairsDownQuery = world.with("stairsDown", "position");

  if (gameState === GameState.GAME) {
    if (key === Keys.SAVE) {
      saveGameData();

      return true;
    }

    if (key === Keys.LOAD) {
      loadGameData();

      return true;
    }

    // NOTE: Cheats
    if (key === Keys.TOGGLE_DEBUG) {
      window.skulltooth.debug = !window.skulltooth.debug;

      return true;
    }

    if (key === Keys.TOGGLE_SEE_ALL) {
      setState((state: State) => (state.cheats.seeAll = !state.cheats.seeAll));

      return true;
    }

    // stairs needs to be it's own system
    if (key === Keys.STAIRS_DOWN) {
      if (!player.position) return;
      const [stairsDownEntity] = stairsDownQuery;
      if (isAtSamePosition(player.position, stairsDownEntity.position)) {
        const { zoneId } = state;
        const zonePos = toZone(zoneId);
        const targetZonePos = { ...zonePos, z: zonePos.z - 1 };
        const targetZoneId = toZoneId(targetZonePos);
        changeZone(targetZoneId, ChangeZoneDirections.down);
      }

      return true;
    }

    if (key === Keys.STAIRS_UP) {
      if (!player.position) return;
      const [stairsUpEntity] = stairsUpQuery;
      if (isAtSamePosition(player.position, stairsUpEntity.position)) {
        const { zoneId } = state;
        const zonePos = toZone(zoneId);
        const targetZonePos = { ...zonePos, z: zonePos.z + 1 };
        const targetZoneId = toZoneId(targetZonePos);
        changeZone(targetZoneId, ChangeZoneDirections.up);
      }

      return true;
    }

    if (key === Keys.INVENTORY) {
      setState((state: State) => (state.gameState = GameState.INVENTORY));
      setState((state: State) => (state.inventoryActiveIndex = 0));

      return true;
    }

    if (key === Keys.INSPECT) {
      setState((state: State) => (state.gameState = GameState.INSPECT));
      const pos = player.position;
      if (pos) {
        setState((state: State) => (state.cursor = [pos, pos]));
      }

      return true;
    }

    if (key === Keys.TOGGLE_MAKER_MODE) {
      setState((state: State) => (state.gameState = GameState.MAKER_MODE));

      return true;
    }

    if (key === Keys.SHOW_LOG) {
      setState((state: State) => (state.gameState = GameState.LOG_HISTORY));
      let index = state.log.length - 39;

      if (index <= 0) index = 0;

      setState((state: State) => (state.logActiveIndex = index));

      return true;
    }

    if (key === Keys.INTERACT) {
      setState((state: State) => {
        state.gameState = GameState.INTERACT;
      });

      return true;
    }

    if (isMoveKey(key)) {
      const dir = getDirectionFromKey(key);
      if (dir && player?.position) {
        const newPos = {
          x: player.position.x + dir.dx,
          y: player.position.y + dir.dy,
        };
        world.addComponent(player, "tryMove", newPos);
      }
      return true;
    }

    // does this really have to go here?
    if (key === Keys.PICK_UP) {
      // check if player is standing on a pickup
      // if standing on a pickup - try to pick it up
      let noPickUps = true;
      for (const entity of pickUpQuery) {
        if (player.position && entity.position) {
          if (toPosId(player.position) === toPosId(entity.position)) {
            const { id } = player;
            if (!isUndefined(id)) {
              world.addComponent(entity, "tryPickUp", {
                pickerId: id,
              });
              noPickUps = false;
            }
          }
        }
      }

      if (noPickUps) {
        addLog("There is nothing to pickup");
      }
    }

    return true;
  }
};
