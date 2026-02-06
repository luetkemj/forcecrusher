import { RendererContext } from "../systems/render.system";
import { getWearing, getWieldedEntity } from "../../lib/utils";
import { getArmorClass } from "../../lib/combat";
import { getState } from "../gameState";
import { chars, colors } from "../../actors/graphics";
import { TokenType } from "../../lib/canvas";
import { TileSet } from "../enums";

export const renderHud = ({ views, queries }: RendererContext) => {
  const view = views.hud;
  const [player] = queries.pcQuery;
  if (view && player) {
    const wielding = getWieldedEntity(player);

    let wieldingName = "unarmed";
    let wieldingChar: string = chars.weapon;
    let wieldingTint: number = colors.weapon;

    if (wielding) {
      wieldingName = wielding.name;
      wieldingChar = wielding.appearance?.char ?? chars.weapon;
      wieldingTint = wielding.appearance?.tint ?? colors.weapon;
    }

    const wearing = getWearing(player);

    let wearingName = "unarmored";
    let wearingChar: string = chars.armor;
    let wearingTint: number = colors.armor;

    if (wearing) {
      wearingName = wearing.name;
      wearingChar = wearing.appearance?.char ?? chars.armor;
      wearingTint = wearing.appearance?.tint ?? colors.armor;
    }

    if (view) {
      const rows = [
        [{ string: `Forcecrusher` }],
        [],
        [{ string: `Zone: ${getState().zoneId}` }],
        [{ string: `Turn: ${getState().turnNumber}` }],
        [{ string: `Mode: ${getState().gameState}` }],
        [],
        [{ string: `LV: 1` }],
        [{ string: `HP: ${player?.health?.current}/${player?.health?.max}` }],
        [],
        // wielding
        [
          {
            tokens: [
              {
                type: TokenType.Text,
                value: `WP: `,
                tint: colors.text,
              },

              {
                type: TokenType.Glyph,
                tileSet: TileSet.Kenny,
                char: wieldingChar,
                tint: wieldingTint,
              },
              {
                type: TokenType.Text,
                value: ` ${wieldingName}`,
                tint: colors.text,
              },
            ],
          },
        ],
        [
          {
            tokens: [
              {
                type: TokenType.Text,
                value: `AR: `,
                tint: colors.text,
              },

              {
                type: TokenType.Glyph,
                tileSet: TileSet.Kenny,
                char: wearingChar,
                tint: wearingTint,
              },
              {
                type: TokenType.Text,
                value: ` ${wearingName}`,
                tint: colors.text,
              },
            ],
          },
        ],
        [],
        [{ string: `AC: ${getArmorClass(player)}` }],
        [{ string: `DM: ${player.averageDamage}` }],
        [],
        [{ string: `ST: ${player?.strength}` }],
        [{ string: `DX: ${player?.dexterity}` }],
        [{ string: `CN: ${player?.constitution}` }],
        [{ string: `IN: ${player?.intelligence}` }],
        [{ string: `WI: ${player?.wisdom}` }],
        [{ string: `CH: ${player?.charisma}` }],
      ];

      view?.clearView();
      view?.updateRows(rows);
    }
  }
};
