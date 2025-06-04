import { gameWorld, ChangeZoneDirections } from "../engine";
import { GameState, State, Turn, getState, setState } from "../../main";
import { toPos, toPosId, isAtSamePosition } from "../../lib/grid";
import { isUndefined, remove } from "lodash";
import {
  addLog,
  logFrozenEntity,
  outOfBounds,
  unWield,
  wield,
} from "../../lib/utils";

const moveKeys = [
  "ArrowLeft",
  "ArrowDown",
  "ArrowUp",
  "ArrowRight",
  "h",
  "j",
  "k",
  "l",
  ">",
];

const pcEntities = gameWorld.world.with("pc", "position");
const pickUpEntities = gameWorld.world.with("pickUp");
const stairsUpEntities = gameWorld.world.with("stairsUp", "position");
const stairsDownEntities = gameWorld.world.with("stairsDown", "position");

export const userInputSystem = () => {
  const { userInput, gameState } = getState();
  if (!userInput)
    return setState((state: State) => {
      state.userInput = null;
    });

  const { key } = userInput;

  const [player] = pcEntities;

  if (gameState === GameState.GAME) {
    if (key === "1") {
      gameWorld.saveGameData();
    }
    if (key === "2") {
      gameWorld.loadGameData();
    }

    // NOTE: Cheats
    if (key === "Escape") {
      window.skulltooth.debug = true;
    }

    if (key === ">") {
      const [stairsDownEntity] = stairsDownEntities;
      if (isAtSamePosition(player.position, stairsDownEntity.position)) {
        const { zoneId } = getState();
        const zonePos = toPos(zoneId);
        const targetZonePos = { ...zonePos, z: zonePos.z - 1 };
        const targetZoneId = toPosId(targetZonePos);
        gameWorld.changeZone(targetZoneId, ChangeZoneDirections.down);
      }
    }

    if (key === "<") {
      const [stairsUpEntity] = stairsUpEntities;
      if (isAtSamePosition(player.position, stairsUpEntity.position)) {
        const { zoneId } = getState();
        const zonePos = toPos(zoneId);
        const targetZonePos = { ...zonePos, z: zonePos.z + 1 };
        const targetZoneId = toPosId(targetZonePos);
        gameWorld.changeZone(targetZoneId, ChangeZoneDirections.up);
      }
    }

    if (key === "w") {
      unWield(player);
    }

    if (key === "i") {
      setState((state: State) => (state.gameState = GameState.INVENTORY));
      setState((state: State) => (state.inventoryActiveIndex = 0));
    }

    if (key === "L") {
      setState((state: State) => (state.gameState = GameState.INSPECT));
      setState(
        (state: State) => (state.cursor = [player.position, player.position]),
      );
    }

    if (moveKeys.includes(key)) {
      for (const entity of pcEntities) {
        if (entity?.position) {
          const { x, y, z } = entity.position;

          if (key === "h" || key === "ArrowLeft") {
            const newPos = { x: x - 1, y, z };
            gameWorld.world.addComponent(entity, "tryMove", newPos);
          }
          if (key === "j" || key === "ArrowDown") {
            const newPos = { x, y: y + 1, z };
            gameWorld.world.addComponent(entity, "tryMove", newPos);
          }
          if (key === "k" || key === "ArrowUp") {
            const newPos = { x, y: y - 1, z };
            gameWorld.world.addComponent(entity, "tryMove", newPos);
          }
          if (key === "l" || key === "ArrowRight") {
            const newPos = { x: x + 1, y, z };
            gameWorld.world.addComponent(entity, "tryMove", newPos);
          }
        }
      }
    }

    if (key === "g") {
      // check if player is standing on a pickup
      // if standing on a pickup - try to pick it up
      let noPickUps = true;
      for (const entity of pickUpEntities) {
        if (player.position && entity.position) {
          if (toPosId(player.position) === toPosId(entity.position)) {
            const { id } = player;
            if (!isUndefined(id)) {
              gameWorld.world.addComponent(entity, "tryPickUp", {
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
  }

  if (gameState === GameState.INSPECT || gameState === GameState.TARGET) {
    if (gameState === GameState.INSPECT) {
      if (key === "L" || key === "Escape") {
        setState((state: State) => (state.gameState = GameState.GAME));
      }
    }
    if (gameState === GameState.TARGET) {
      if (key === "t" || key === "Escape") {
        setState((state: State) => (state.gameState = GameState.INVENTORY));
      }

      if (key === "Enter") {
        // get first item in inventory and add a tryThrow component
        // with a throwerId and targetPosition
        const entityId = player.container?.contents[0];
        if (entityId) {
          const entity = gameWorld.registry.get(entityId);

          if (entity) {
            const playerId = player.id;
            if (!isUndefined(playerId)) {
              gameWorld.world.addComponent(entity, "tryThrow", {
                throwerId: playerId,
              });
            }
          }
        }

        setState((state: State) => {
          state.turn = Turn.WORLD;
          state.gameState = GameState.GAME;
        });
      }
    }

    if (moveKeys.includes(key)) {
      if (player.position) {
        const oldPos = getState().cursor[1];
        const { x, y, z } = oldPos;

        if (key === "h" || key === "ArrowLeft") {
          const newPos = { x: x - 1, y, z };
          if (outOfBounds(newPos)) return;
          setState((state: State) => {
            state.cursor = [oldPos, newPos];
          });
        }
        if (key === "j" || key === "ArrowDown") {
          const newPos = { x, y: y + 1, z };
          if (outOfBounds(newPos)) return;
          setState((state: State) => {
            state.cursor = [oldPos, newPos];
          });
        }
        if (key === "k" || key === "ArrowUp") {
          const newPos = { x, y: y - 1, z };
          if (outOfBounds(newPos)) return;
          setState((state: State) => {
            state.cursor = [oldPos, newPos];
          });
        }
        if (key === "l" || key === "ArrowRight") {
          const newPos = { x: x + 1, y, z };
          if (outOfBounds(newPos)) return;
          setState((state: State) => {
            state.cursor = [oldPos, newPos];
          });
        }
      }
    }
  }

  // NOTE: Inventory
  if (gameState === GameState.INVENTORY) {
    if (key === "i" || key === "Escape") {
      setState((state: State) => (state.gameState = GameState.GAME));
    }

    const activeItemEId =
      player.container?.contents[getState().inventoryActiveIndex] || "";
    const activeItemEntity = gameWorld.registry.get(activeItemEId);

    // NOTE: inventory navigation
    const inventoryLength = player.container?.contents.length || 0;
    const currentIndex = getState().inventoryActiveIndex;

    if (key === "j" || key === "ArrowDown") {
      if (currentIndex < inventoryLength - 1) {
        setState(
          (state: State) => (state.inventoryActiveIndex = currentIndex + 1),
        );
      } else {
        setState((state: State) => (state.inventoryActiveIndex = 0));
      }
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

        const consumable = gameWorld.registry.get(activeItemEId);
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
        gameWorld.world.remove(consumable);
        break;
      } while (true);

      if (currentIndex === inventoryLength - 1) {
        setState((state: State) => (state.inventoryActiveIndex -= 1));
      }
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

        const tryDropEntity = gameWorld.registry.get(activeItemEId);
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

        gameWorld.world.addComponent(tryDropEntity, "tryDrop", {
          dropperId: playerId,
        });
        break;
      } while (true);

      if (currentIndex === inventoryLength - 1) {
        setState((state: State) => (state.inventoryActiveIndex -= 1));
      }
    }

    // NOTE: Equip
    if (key === "e") {
      // if items in inventory - enter target mode
      if (activeItemEntity) {
        wield(player, activeItemEntity);
      }
    }

    // NOTE: Target
    if (key === "t") {
      // if items in inventory - enter target mode
      if (player.container?.contents.length) {
        setState((state: State) => {
          state.gameState = GameState.TARGET;
          state.cursor = [player.position, player.position];
        });
      }
    }
  }

  setState((state: State) => {
    state.userInput = null;
  });
};
