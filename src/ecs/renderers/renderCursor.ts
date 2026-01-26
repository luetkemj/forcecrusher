import { RendererContext } from "../systems/render.system";
import { getState, GameState, setState, State } from "../gameState";
import { chars } from "../../actors/graphics";
import { SpellShape } from "../enums";
import { circle, line, toPos, toPosId } from "../../lib/grid";
import { isPosBlocked } from "../../lib/utils";
import { tail } from "lodash";

export const renderCursor = ({ views, queries }: RendererContext) => {
  const view = views.targeting;
  if (view) {
    const [pos0, pos1] = getState().cursor;
    const cursorProps = {
      char: "",
      tint: 0xff0077,
      tileSet: "tile",
      alpha: 0,
      x: pos0.x,
      y: pos0.y,
    };
    if (
      getState().gameState === GameState.CAST_SPELL ||
      getState().gameState === GameState.INSPECT ||
      getState().gameState === GameState.TARGET ||
      getState().gameState.startsWith(GameState.MAKER_MODE)
    ) {
      view.clearView();
      view.show();

      if (getState().gameState === GameState.CAST_SPELL) {
        const [player] = queries.pcQuery;
        if (!player?.position) return;

        const spell = player.knownSpells?.[getState().spellbookActiveIndex];

        if (spell && spell.appearance) {
          cursorProps.char = spell.appearance.char;
          cursorProps.tint = spell.appearance.tint;

          let aoe = [toPosId(pos1)];

          if (spell.shape.name === SpellShape.Circle) {
            aoe = circle(pos1, spell.shape.radius || 1).posIds;
          }

          if (spell.shape.name === SpellShape.Cone) {
          }

          if (spell.shape.name === SpellShape.Line) {
            const path = tail(
              line(player.position, pos1).map((pos) => toPosId(pos)),
            );
            const ray = [];
            let blocked = false;

            for (const posId of path) {
              if (blocked) break;

              const blocker = isPosBlocked(posId);

              if (!blocker) {
                ray.push(posId);
              } else {
                if (blocker.ai) {
                  ray.push(posId);
                }
                blocked = true;
              }
            }

            aoe = ray;
          }

          if (spell.shape.name === SpellShape.Point) {
            aoe = [toPosId(pos1)];
          }

          if (spell.shape.name === SpellShape.Rectangle) {
          }

          setState((state: State) => (state.spellAoe = aoe));

          for (const posId of aoe) {
            const pos = toPos(posId);
            view.updateCell({
              0: {
                ...cursorProps,
                alpha: 0.25,
                x: pos.x,
                y: pos.y,
              },
              1: {
                ...cursorProps,
                alpha: 1,
                x: pos.x,
                y: pos.y,
                tileSet: spell.appearance.tileSet,
              },
            });
          }

          view.updateCell({
            0: {
              ...cursorProps,
              char: chars.cursor,
              alpha: 1,
              x: pos1.x,
              y: pos1.y,
              tileSet: "kenny",
            },
          });
        }
      }

      if (getState().gameState === GameState.INSPECT) {
        view.updateCell({
          0: {
            ...cursorProps,
            char: chars.cursor,
            alpha: 1,
            x: pos1.x,
            y: pos1.y,
            tileSet: "kenny",
          },
        });
      }

      // TODO: check for the item that is being thrown and show that as a ghost inside the cursor
      if (getState().gameState === GameState.TARGET) {
        view.updateCell({
          0: {
            ...cursorProps,
            char: chars.cursor,
            alpha: 1,
            x: pos1.x,
            y: pos1.y,
            tileSet: "kenny",
          },
        });
      }

      // TODO: check for the item that is being MADE and show that as a ghost inside the cursor
      if (getState().gameState === GameState.MAKER_MODE) {
        view.updateCell({
          0: {
            ...cursorProps,
            char: chars.cursor,
            alpha: 1,
            x: pos1.x,
            y: pos1.y,
            tileSet: "kenny",
          },
        });
      }
    } else {
      view.hide();
    }
  }
};
