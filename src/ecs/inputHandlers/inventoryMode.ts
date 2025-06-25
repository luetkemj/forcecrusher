import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { logFrozenEntity, wield, wear, unWield, unWear } from "../../lib/utils";
import { remove, isUndefined } from "lodash";

export const handleInventoryModeInput = ({
  key,
  world,
  registry,
  player,
  state,
  setState,
  addLog,
}: InputContext) => {
  if (key === "i" || key === "Escape") {
    setState((state: State) => (state.gameState = GameState.GAME));
  }

  const activeItemEId =
    player.container?.contents[state.inventoryActiveIndex] || "";
  const activeItemEntity = registry.get(activeItemEId);

  // NOTE: inventory navigation
  const inventoryLength = player.container?.contents.length || 0;
  const currentIndex = state.inventoryActiveIndex;

  if (key === "j" || key === "ArrowDown") {
    if (currentIndex < inventoryLength - 1) {
      setState(
        (state: State) => (state.inventoryActiveIndex = currentIndex + 1),
      );
    } else {
      setState((state: State) => (state.inventoryActiveIndex = 0));
    }
    return true;
  }

  if (key === "k" || key === "ArrowUp") {
    if (currentIndex > 0) {
      setState(
        (state: State) => (state.inventoryActiveIndex = currentIndex - 1),
      );
    } else {
      setState(
        (state: State) => (state.inventoryActiveIndex = inventoryLength - 1),
      );
    }
    return true;
  }

  // NOTE: Consume
  if (key === "c") {
    do {
      if (!player.container) {
        addLog(`You have no container to hold consumables`);
        break;
      }

      // check if player has inventory
      if (!activeItemEId) {
        addLog("You have nothing to consume");
        break;
      }

      const consumable = registry.get(activeItemEId);
      if (!consumable) {
        console.log(`id: ${activeItemEId} does not exist.`);
        logFrozenEntity(player);
        break;
      }

      if (!consumable.consumable) {
        addLog(`${player.name} cannot consume ${consumable.name}`);
        break;
      }

      if (consumable.effects) {
        player.activeEffects!.push(...consumable.effects);
      }

      // remove consumable from inventory
      remove(player.container.contents, (id) => activeItemEId === id);

      // NOTE:
      // delete entity from world
      // do I want to do that.....?
      addLog(`${player.name} consumes ${consumable.name}`);
      world.remove(consumable);
      break;
    } while (true);

    if (currentIndex === inventoryLength - 1) {
      setState((state: State) => (state.inventoryActiveIndex -= 1));
    }

    return true;
  }

  // NOTE: Drop
  if (key === "d") {
    do {
      if (!player.container) {
        addLog(`You can't drop without a container to hold.`);
        break;
      }

      // check if player has inventory
      if (!activeItemEId) {
        addLog("You have nothing to drop");
        break;
      }

      const tryDropEntity = registry.get(activeItemEId);
      if (!tryDropEntity) {
        console.log(`id: ${activeItemEId} does not exist.`);
        logFrozenEntity(player);
        break;
      }

      // add tryDrop to first item in inventory
      const playerId = player.id;
      if (isUndefined(playerId)) {
        break;
      }

      world.addComponent(tryDropEntity, "tryDrop", {
        dropperId: playerId,
      });
      break;
    } while (true);

    if (currentIndex === inventoryLength - 1) {
      setState((state: State) => (state.inventoryActiveIndex -= 1));
    }

    return true;
  }

  // NOTE: Wield
  if (key === "w") {
    if (activeItemEntity) {
      wield(player, activeItemEntity);
    }
    return true;
  }

  // NOTE: Wear
  if (key === "W") {
    if (activeItemEntity) {
      wear(player, activeItemEntity);
    }
    return true;
  }

  // NOTE: Remove
  if (key === "r") {
    if (activeItemEId) {
      if (player.armorSlot?.contents[0] === activeItemEId) {
        unWear(player);
      }

      if (player.weaponSlot?.contents[0] === activeItemEId) {
        unWield(player);
      }
    }
    return true;
  }

  // NOTE: Target
  if (key === "t") {
    // if items in inventory - enter target mode
    if (player.container?.contents.length) {
      setState((state: State) => {
        state.gameState = GameState.TARGET;
        const pos = player.position;
        if (pos) {
          state.cursor = [pos, pos];
        }
      });
    }
    return true;
  }
};
