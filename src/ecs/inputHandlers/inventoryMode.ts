import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { logFrozenEntity, wield, wear, unWield, unWear } from "../../lib/utils";
import { remove, isUndefined } from "lodash";
import { Keys } from "./KeyMap";

export const handleInventoryModeInput = ({
  key,
  world,
  registry,
  player,
  state,
  setState,
  addLog,
}: InputContext) => {
  if (key === Keys.INVENTORY || key === Keys.CANCEL) {
    setState((state: State) => (state.gameState = GameState.GAME));
  }

  const activeItemEId =
    player.container?.contents[state.inventoryActiveIndex] || "";
  const activeItemEntity = registry.get(activeItemEId);

  // NOTE: inventory navigation
  const inventoryLength = player.container?.contents.length || 0;
  const currentIndex = state.inventoryActiveIndex;

  if ((Keys.SCROLL_DOWN as readonly string[]).includes(key)) {
    if (currentIndex < inventoryLength - 1) {
      setState(
        (state: State) => (state.inventoryActiveIndex = currentIndex + 1),
      );
    } else {
      setState((state: State) => (state.inventoryActiveIndex = 0));
    }
    return true;
  }

  if ((Keys.SCROLL_UP as readonly string[]).includes(key)) {
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
  if (key === Keys.CONSUME) {
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
  if (key === Keys.DROP) {
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

  // Read
  if (key === Keys.READ) {
    do {
      // check if player has inventory
      if (!activeItemEId) {
        console.log("No Active Item");
        break;
      }

      const tryReadEntity = registry.get(activeItemEId);
      if (!tryReadEntity) {
        console.log(`id: ${activeItemEId} does not exist.`);
        logFrozenEntity(player);
        break;
      }

      const playerId = player.id;
      if (isUndefined(playerId)) {
        break;
      }

      world.addComponent(tryReadEntity, "tryRead", {
        readerId: playerId,
      });
      break;
    } while (true);

    // TODO:
    // https://github.com/luetkemj/forcecrusher/issues/105
    // this shouldn't happen here. Needs to be triggered only after you successfully read/use/drop item.
    // should be a system or something
    if (currentIndex === inventoryLength - 1) {
      setState((state: State) => (state.inventoryActiveIndex -= 1));
    }

    return true;
  }

  // NOTE: Wield
  if (key === Keys.WIELD) {
    if (activeItemEntity) {
      wield(player, activeItemEntity);
    }
    return true;
  }

  // NOTE: Wear
  if (key === Keys.WEAR) {
    if (activeItemEntity) {
      wear(player, activeItemEntity);
    }
    return true;
  }

  // NOTE: Remove
  if (key === Keys.REMOVE) {
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
  if (key === Keys.TARGET) {
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
