import { world } from "../engine";
import { GameState, State, getState, setState } from "../../main";
import { toPosId } from "../../lib/grid";
import { isUndefined } from "lodash";
import { addLog, logFrozenEntity } from "../../lib/utils";

const moveKeys = [
  "ArrowLeft",
  "ArrowDown",
  "ArrowUp",
  "ArrowRight",
  "h",
  "j",
  "k",
  "l",
];

const pcEntities = world.with("pc");
const pickUpEntities = world.with("pickUp");

export const userInputSystem = () => {
  const { userInput, gameState } = getState();
  if (!userInput)
    return setState((state: State) => {
      state.userInput = null;
    });

  const { key } = userInput;

  const [player] = pcEntities;

  if (gameState === GameState.GAME) {
    if (key === "i") {
      setState((state: State) => (state.gameState = GameState.INVENTORY));
    }

    if (moveKeys.includes(key)) {
      for (const entity of pcEntities) {
        if (entity?.position) {
          const { x, y, z } = entity.position;

          if (key === "h" || key === "ArrowLeft") {
            const newPos = { x: x - 1, y, z };
            world.addComponent(entity, "tryMove", newPos);
          }
          if (key === "j" || key === "ArrowDown") {
            const newPos = { x, y: y + 1, z };
            world.addComponent(entity, "tryMove", newPos);
          }
          if (key === "k" || key === "ArrowUp") {
            const newPos = { x, y: y - 1, z };
            world.addComponent(entity, "tryMove", newPos);
          }
          if (key === "l" || key === "ArrowRight") {
            const newPos = { x: x + 1, y, z };
            world.addComponent(entity, "tryMove", newPos);
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
            const playerId = world.id(player);
            if (!isUndefined(playerId)) {
              world.addComponent(entity, "tryPickUp", { pickerId: playerId });
              noPickUps = false;
            }
          }
        }
      }

      if (noPickUps) {
        addLog("There is nothing to pickup");
      }
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
        const tryDropEntity = world.entity(tryDropEntityId);
        if (!tryDropEntity) {
          console.log(`id: ${tryDropEntityId} does not exist.`);
          logFrozenEntity(player);
          break;
        }

        // add tryDrop to first item in inventory
        const playerId = world.id(player);
        if (isUndefined(playerId)) {
          break;
        }

        world.addComponent(tryDropEntity, "tryDrop", {
          dropperId: playerId,
        });
        break;
      } while (true);
    }
  }

  if (gameState === GameState.INVENTORY) {
    if (key === "i" || key === "Escape") {
      setState((state: State) => (state.gameState = GameState.GAME));
    }
  }

  setState((state: State) => {
    state.userInput = null;
  });
};
