import { IGameWorld, ChangeZoneDirections } from "../engine";
import { GameState, State, Turn, getState, setState } from "../gameState";
import { toPos, toPosId, isAtSamePosition } from "../../lib/grid";
import { isUndefined, remove } from "lodash";
import {
  addLog,
  logFrozenEntity,
  outOfBounds,
  unWield,
  wield,
  wear,
  unWear,
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
];

export const createUserInputSystem = (
  world: IGameWorld["world"],
  registry: IGameWorld["registry"],
  saveGameData: IGameWorld["saveGameData"],
  loadGameData: IGameWorld["loadGameData"],
  changeZone: IGameWorld["changeZone"],
) => {
  const pcQuery = world.with("pc", "position");
  const pickUpQuery = world.with("pickUp");
  const stairsUpQuery = world.with("stairsUp", "position");
  const stairsDownQuery = world.with("stairsDown", "position");

  return function system() {
    const { userInput, gameState } = getState();
    if (!userInput)
      return setState((state: State) => {
        state.userInput = null;
      });

    const { key } = userInput;

    const [player] = pcQuery;

    if (gameState === GameState.GAME) {
      if (key === "1") {
        saveGameData();
      }

      if (key === "2") {
        loadGameData();
      }

      // NOTE: Cheats
      if (key === "Escape") {
        window.skulltooth.debug = true;
      }

      if (key === ">") {
        const [stairsDownEntity] = stairsDownQuery;
        if (isAtSamePosition(player.position, stairsDownEntity.position)) {
          const { zoneId } = getState();
          const zonePos = toPos(zoneId);
          const targetZonePos = { ...zonePos, z: zonePos.z - 1 };
          const targetZoneId = toPosId(targetZonePos);
          changeZone(targetZoneId, ChangeZoneDirections.down);
        }
      }

      if (key === "<") {
        const [stairsUpEntity] = stairsUpQuery;
        if (isAtSamePosition(player.position, stairsUpEntity.position)) {
          const { zoneId } = getState();
          const zonePos = toPos(zoneId);
          const targetZonePos = { ...zonePos, z: zonePos.z + 1 };
          const targetZoneId = toPosId(targetZonePos);
          changeZone(targetZoneId, ChangeZoneDirections.up);
        }
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

      if (key === "§") {
        setState((state: State) => (state.gameState = GameState.MAKER_MODE));
      }

      if (key === "H") {
        setState((state: State) => (state.gameState = GameState.LOG_HISTORY));
        let index = getState().log.length - 39;

        if (index <= 0) index = 0;

        setState((state: State) => (state.logActiveIndex = index));
      }

      if (key === "e") {
        setState((state: State) => {
          state.gameState = GameState.INTERACT;
        });
      }

      if (moveKeys.includes(key)) {
        for (const entity of pcQuery) {
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
    }

    if (gameState === GameState.INTERACT) {
      if (key === "e" || key === "Escape") {
        setState((state: State) => {
          state.gameState = GameState.GAME;
        });
      }

      for (const entity of pcQuery) {
        if (entity?.position) {
          const { x, y, z } = entity.position;
          let newPos;
          if (key === "h" || key === "ArrowLeft") {
            newPos = { x: x - 1, y, z };
          }
          if (key === "j" || key === "ArrowDown") {
            newPos = { x, y: y + 1, z };
          }
          if (key === "k" || key === "ArrowUp") {
            newPos = { x, y: y - 1, z };
          }
          if (key === "l" || key === "ArrowRight") {
            newPos = { x: x + 1, y, z };
          }

          if (moveKeys.includes(key)) {
            world.addComponent(entity, "interactDirection", newPos);
            setState(
              (state: State) => (state.gameState = GameState.INTERACT_ACTION),
            );
          }
        }
      }
    }

    if (gameState === GameState.INTERACT_ACTION) {
      if (key === "e" || key === "Escape") {
        setState((state: State) => {
          state.gameState = GameState.GAME;
        });
      }

      const { interactActions, interactTargets } = getState();
      const [target] = interactTargets;
      const [actor] = pcQuery;

      const afterInteractCleanUp = () => {
        setState((state: State) => {
          state.interactActions = "";
          state.interactTargets = [];
          state.gameState = GameState.GAME;
          state.turn = Turn.WORLD;
        });
      };

      // attack
      if (interactActions.includes("§a§")) {
        if (key === "a") {
          world.addComponent(actor, "tryAttack", { targetId: target.id });
          afterInteractCleanUp();
        }
      }
      // close
      if (interactActions.includes("§c§")) {
        if (key === "c") {
          world.addComponent(actor, "tryClose", target);
          afterInteractCleanUp();
        }
      }
      // get
      if (interactActions.includes("§g§")) {
        if (key === "g") {
          world.addComponent(target, "tryPickUp", {
            pickerId: actor.id,
          });

          afterInteractCleanUp();
        }
      }
      // kick
      if (interactActions.includes("§k§")) {
        if (key === "k") {
          world.addComponent(actor, "tryKick", { targetId: target.id });

          afterInteractCleanUp();
        }
      }
      // open
      if (interactActions.includes("§o§")) {
        if (key === "o") {
          world.addComponent(actor, "tryOpen", { id: target.id });
          afterInteractCleanUp();
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
          // get selected item in inventory and add a tryThrow component
          // with a throwerId and targetPosition
          const entityId =
            player.container?.contents[getState().inventoryActiveIndex];
          if (entityId) {
            const entity = registry.get(entityId);

            if (entity) {
              const playerId = player.id;
              if (!isUndefined(playerId)) {
                world.addComponent(entity, "tryThrow", {
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

    // NOTE: History
    if (gameState === GameState.LOG_HISTORY) {
      if (key === "H" || key === "Escape") {
        setState((state: State) => (state.gameState = GameState.GAME));
      }

      if (key === "j" || key === "ArrowDown") {
        const { logActiveIndex, log } = getState();
        const newLogActiveIndex =
          logActiveIndex === log.length - 39
            ? log.length - 39
            : logActiveIndex + 1;
        setState((state: State) => (state.logActiveIndex = newLogActiveIndex));
      }

      if (key === "k" || key === "ArrowUp") {
        const { logActiveIndex } = getState();
        const newLogActiveIndex = logActiveIndex === 0 ? 0 : logActiveIndex - 1;
        setState((state: State) => (state.logActiveIndex = newLogActiveIndex));
      }
    }

    // NOTE: Inventory
    if (gameState === GameState.INVENTORY) {
      if (key === "i" || key === "Escape") {
        setState((state: State) => (state.gameState = GameState.GAME));
      }

      const activeItemEId =
        player.container?.contents[getState().inventoryActiveIndex] || "";
      const activeItemEntity = registry.get(activeItemEId);

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
            (state: State) =>
              (state.inventoryActiveIndex = inventoryLength - 1),
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
      }

      // NOTE: Wield
      if (key === "w") {
        if (activeItemEntity) {
          wield(player, activeItemEntity);
        }
      }

      // NOTE: Wear
      if (key === "W") {
        if (activeItemEntity) {
          wear(player, activeItemEntity);
        }
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

    // NOTE: MAKER MODE
    if (gameState === GameState.MAKER_MODE) {
      if (key === "§") {
        setState((state: State) => (state.gameState = GameState.GAME));
      }
    }

    setState((state: State) => {
      state.userInput = null;
    });
  };
};
