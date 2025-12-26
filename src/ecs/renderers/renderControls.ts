import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";
import { em, colorEntityName } from "../../lib/utils";
import { Keys } from "../inputHandlers/KeyMap";

export const renderControls = ({ views, queries }: RendererContext) => {
  const view = views.controls;
  const [player] = queries.pcQuery;
  if (view && player) {
    {
      let controls = "";
      let context = "";

      if (getState().gameState === GameState.GAME) {
        controls = `(${em("arrows/hjkl")})Move (${em("e")})Interact (${em("g")})Get (${em("H")})History (${em("i")})Inventory (${em("L")})Look (${em("M")})MakerMode`;
      }

      if (getState().gameState === GameState.INSPECT) {
        controls = `(${em("L/escape")})Return to Game (${em("arrows/hjkl")})Move cursor`;
      }

      if (getState().gameState === GameState.TARGET) {
        controls = `(${em("t/escape")})Return to Inventory (${em("arrows/hjkl")})Move cursor (${em("enter")})Throw item`;
      }

      if (getState().gameState === GameState.INVENTORY) {
        controls = `(${em("i/escape")})Return to Game (${em("c")})Consume (${em("d")})Drop (${em("t")})Throw (${em("W")})Wear (${em("w")})Wield (${em("r")})Remove`;
      }

      if (getState().gameState === GameState.LOG_HISTORY) {
        controls = `(${em("H/escape")})Return to Game (${em("arrows/jk")})Scroll history`;
      }

      if (getState().gameState === GameState.INTERACT) {
        context = `Which direction?`;
        controls = `(${em("escape")})Cancel (${em("arrows/hjkl")})Direction`;
      }

      if (getState().gameState === GameState.INTERACT_ACTION) {
        // if more than one interactTarget - pick one
        const { interactTargets, interactActions } = getState();
        const inspectTarget = interactTargets[0];
        if (!inspectTarget) return; // TODO: log? what to do here..

        context = `There is a ${colorEntityName(inspectTarget)} there:`;
        controls = `(${em("escape")})Cancel ${interactActions}`;
      }

      if (getState().gameState === GameState.MAKER_MODE) {
        controls = `(${em("M/escape")})Return to Game (${em("arrows/hjkl")})Move cursor (${em(Keys.TOGGLE_MAKER_MODE_PREFAB_SELECT)})Select Prefab (${em(Keys.CONFIRM)})Place Selected Prefab`;
      }

      if (getState().gameState === GameState.MAKER_MODE_PREFAB_SELECT) {
        controls = `(${em("e/escape")})Exit  (${em("arrows/jk")})Select Prefab`;
      }

      const rows = [
        [{ string: context, parseTags: true }],
        [{ string: controls, parseTags: true }],
      ];

      view?.updateRows(rows);
    }
  }
};
