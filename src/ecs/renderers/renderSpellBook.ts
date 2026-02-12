import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";
import { Entity, Spell } from "../engine";
import { TokenType } from "../../lib/canvas";
import { colors } from "../../actors/graphics";
import { TileSet } from "../enums";

export const renderSpellBook = ({ views, queries }: RendererContext) => {
  const view = views.spellbook;
  const [player] = queries.pcQuery;

  if (view && player) {
    if (getState().gameState === GameState.SPELLBOOK) {
      const knownSpells = player.knownSpells || [];

      const activeIndex = getState().spellbookActiveIndex;

      const rows = [
        [{ string: "Spellbook" }],
        [],
        ...renderKnownSpells(knownSpells, activeIndex),
        [],
      ];

      view?.clearView();
      view?.updateRows(rows, { parseTags: true });
      view?.show();
    } else {
      view?.hide();
    }
  }
};

const renderKnownSpells = (spells: Spell[], activeIndex: number) => {
  const rows = [];

  for (const [index, spell] of spells.entries()) {
    const tokenRow: {
      tokens: (
        | ReturnType<typeof getTokenText>
        | ReturnType<typeof getTokenGlyph>
      )[];
    } = { tokens: [] };
    if (activeIndex === index) {
      tokenRow.tokens.push(getTokenText("* "));
    } else {
      tokenRow.tokens.push(getTokenText("  "));
    }
    if (spell) {
      tokenRow.tokens.push(getTokenGlyph(spell));
      tokenRow.tokens.push(getTokenText(` ${spell.displayName}: `));
      tokenRow.tokens.push(getTokenText(`${spell.description}`));
    }

    rows.push([tokenRow]);
  }

  return rows;
};

const getTokenText = (string: string) => {
  return {
    type: TokenType.Text,
    value: string,
    tint: colors.text,
  };
};

const getTokenGlyph = (entity: Entity | Spell) => {
  return {
    type: TokenType.Glyph,
    tileSet: entity.appearance?.tileSet || TileSet.Kenny,
    char: entity.appearance?.char || "?",
    tint: entity.appearance?.tint || 0x00ff00,
  };
};
