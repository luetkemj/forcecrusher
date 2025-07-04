import { Entity, IGameWorld } from "../engine";
import { InputContext } from "../systems/userInput.system";
import { GameState, State, getState } from "../gameState";
import { isSamePosition, outOfBounds } from "../../lib/utils";
import { isMoveKey, getDirectionFromKey, Keys } from "./KeyMap";
import { prefabs, spawn } from "../../actors";
import { spawnRat, spawnSkeleton } from "../../pcgn/monsters";
import { spawnPlayer } from "../../pcgn/player";
import { camelCase, cloneDeep } from "lodash";

export const handleMakerModeInput = ({
  key,
  setState,
  state,
  player,
  layer100Query,
  layer200Query,
  layer300Query,
  layer400Query,
}: InputContext) => {
  if (key === Keys.TOGGLE_MAKER_MODE || key === Keys.CANCEL) {
    setState((state: State) => (state.gameState = GameState.GAME));

    return true;
  }

  if (key === Keys.TOGGLE_MAKER_MODE_PREFAB_SELECT) {
    setState(
      (state: State) => (state.gameState = GameState.MAKER_MODE_PREFAB_SELECT),
    );

    return true;
  }

  if (isMoveKey(key)) {
    const dir = getDirectionFromKey(key);
    if (dir && player?.position) {
      const oldPos = state.cursor[1];
      const newPos = {
        x: oldPos.x + dir.dx,
        y: oldPos.y + dir.dy,
        z: oldPos.z,
      };
      if (!outOfBounds(newPos)) {
        setState((state: State) => {
          state.cursor = [oldPos, newPos];
        });
      }
    }
    return true;
  }

  // if enter
  if (key === Keys.CONFIRM) {
    const index = getState().makerModePrefabSelectIndex;
    const selectedPrefab = Object.values(prefabs)[index];

    const { layer100, layer200, layer300, layer400 } = selectedPrefab;

    if (layer100) {
      findAndConvertEntity(layer100Query, selectedPrefab);
    }

    if (layer200) {
      findAndConvertEntity(layer200Query, selectedPrefab);
    }

    if (layer300) {
      findAndConvertEntity(layer300Query, selectedPrefab);
    }

    if (layer400) {
      findAndConvertEntity(layer400Query, selectedPrefab);
    }

    return true;
  }
};

function convertEntity(entity: Entity, prefab: Partial<Entity>) {
  const preservedKeys: Array<keyof Entity> = ["id", "position"];
  const preservedData: Partial<Record<keyof Entity, Entity[keyof Entity]>> = {};
  for (const key of preservedKeys) {
    if (key in entity) {
      preservedData[key] = entity[key];
    }
  }

  for (const key in entity) {
    if (!preservedKeys.includes(key as keyof Entity)) {
      delete entity[key as keyof Entity];
    }
  }

  Object.assign(entity, cloneDeep(prefab), preservedData);
}

function findAndConvertEntity(
  query: ReturnType<IGameWorld["world"]["with"]>,
  prefab: Entity,
) {
  const cursorPosition = getState().cursor[1];

  let entityToConvert;
  for (const entity of query) {
    if (isSamePosition(cursorPosition, entity.position)) {
      entityToConvert = entity;
    }
  }

  if (entityToConvert) {
    convertEntity(entityToConvert, prefab);
  } else {
    const { name } =
      Object.values(prefabs)[getState().makerModePrefabSelectIndex];

    if (name === "skeleton") spawnSkeleton(cursorPosition);
    else if (name === "rat") spawnRat(cursorPosition);
    else if (name === "player") spawnPlayer(cursorPosition);
    else {
      const prefabName = camelCase(name);
      spawn(prefabName as keyof typeof prefabs, { position: cursorPosition });
    }
  }
}
