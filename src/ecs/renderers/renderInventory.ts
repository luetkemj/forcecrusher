import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";
import { getWearing } from "../../lib/utils";
import { Entity } from "../engine";
import { TokenType } from "../../lib/canvas";
import { compact } from "lodash";
import { colors } from "../../actors/graphics";

export const renderInventory = ({
  views,
  queries,
  registry,
}: RendererContext) => {
  const view = views.inventory;
  const [player] = queries.pcQuery;

  if (view && player) {
    if (getState().gameState === GameState.INVENTORY) {
      const playerInventory = player.container?.contents || [];
      const itemsInInventory = compact(
        playerInventory.map((id) => registry.get(id)),
      );
      const activeIndex = getState().inventoryActiveIndex;

      const wieldingEId = player.weaponSlot?.contents[0] || "";
      const wieldedEntity = registry.get(wieldingEId);
      const armor = getWearing(player);

      const rows = [
        [{ string: "Inventory" }],
        [],
        [
          {
            string: `${player.container?.name} [${player.container?.contents.length}/${player.container?.slots}]`,
          },
        ],
        ...renderItemsInInventory(itemsInInventory, activeIndex),
        [],
        [
          {
            string: `Wielding [${player.weaponSlot?.contents.length}/${player.weaponSlot?.slots}]`,
          },
        ],
        renderEquipped(wieldedEntity),
        [],
        [
          {
            string: `Wearing [${player.armorSlot?.contents.length}/${player.armorSlot?.slots}]`,
          },
        ],
        renderEquipped(armor),
      ];

      view?.clearView();
      view?.updateRows(rows, true);
      view?.show();
    } else {
      view?.hide();
    }
  }
};

const renderEquipped = (wieldedEntity?: Entity) => {
  if (!wieldedEntity) return [];
  return [
    {
      tokens: [
        wieldedEntity && getTokenGlyph(wieldedEntity),
        wieldedEntity && getTokenText(` ${wieldedEntity.name}: `),
        wieldedEntity && getTokenText(`${wieldedEntity.description}`),
      ],
    },
  ];
};

const renderItemsInInventory = (items: Array<Entity>, activeIndex: number) => {
  const rows = [];

  for (const [index, item] of items.entries()) {
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
    if (item) {
      tokenRow.tokens.push(getTokenGlyph(item));
      tokenRow.tokens.push(getTokenText(` ${item.name}: `));
      tokenRow.tokens.push(getTokenText(`${item.description}`));
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

const getTokenGlyph = (entity: Entity) => {
  return {
    type: TokenType.Glyph,
    tileSet: entity.appearance?.tileSet || "kenny",
    char: entity.appearance?.char || "?",
    tint: entity.appearance?.tint || 0x00ff00,
  };
};
