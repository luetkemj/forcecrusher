import { gameWorld } from "../engine";
import { GameState, State, Turn, getState, setState } from "../../main";
import { toPos, toPosId } from "../../lib/grid";
import { isUndefined, remove } from "lodash";
import { addLog, logFrozenEntity, outOfBounds } from "../../lib/utils";

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

export const userInputSystem = () => {
  // WARN: should these be inside here? Moved for testing purposes but feels bad...
  const pcEntities = gameWorld.world.with("pc", "position");
  const pickUpEntities = gameWorld.world.with("pickUp");

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

    if (key === ">") {
      const { zoneId } = getState();
      const zonePos = toPos(zoneId);
      const targetZonePos = { ...zonePos, z: zonePos.z - 1 };
      const targetZoneId = toPosId(targetZonePos);
      gameWorld.changeZone(targetZoneId);
    }

    if (key === "<") {
      const { zoneId } = getState();
      const zonePos = toPos(zoneId);
      const targetZonePos = { ...zonePos, z: zonePos.z + 1 };
      const targetZoneId = toPosId(targetZonePos);
      gameWorld.changeZone(targetZoneId);
    }

    if (key === "i") {
      setState((state: State) => (state.gameState = GameState.INVENTORY));
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

  if (gameState === GameState.INVENTORY) {
    if (key === "i" || key === "Escape") {
      setState((state: State) => (state.gameState = GameState.GAME));
    }

    if (key === "d") {
      do {
        if (!player.container) {
          addLog(`You can't drop without a container to hold.`);
          break;
        }

        // check if player has inventory
        if (!player.container?.contents.length) {
          addLog("You have nothing to drop");
          break;
        }

        const tryDropEntityId = player.container.contents[0];
        const tryDropEntity = gameWorld.registry.get(tryDropEntityId);
        if (!tryDropEntity) {
          console.log(`id: ${tryDropEntityId} does not exist.`);
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
    }

    if (key === "c") {
      do {
        if (!player.container) {
          addLog(`You have no container to hold consumables`);
          break;
        }

        // check if player has inventory
        if (!player.container?.contents.length) {
          addLog("You have nothing to consume");
          break;
        }

        const consumeableId = player.container.contents[0];
        const consumable = gameWorld.registry.get(consumeableId);
        if (!consumable) {
          console.log(`id: ${consumeableId} does not exist.`);
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
        remove(player.container.contents, (id) => consumeableId === id);

        // delete entity from world
        // do I want to do that.....?
        addLog(`${player.name} consumes ${consumable.name}`);
        gameWorld.world.remove(consumable);
        break;
      } while (true);
    }

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
