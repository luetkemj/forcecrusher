import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";
import { entityNamePlate, getWearing } from "../../lib/utils";

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
      const itemsInInventory = playerInventory.map((id) => registry.get(id));
      const activeIndex = getState().inventoryActiveIndex;

      const wieldingEId = player.weaponSlot?.contents[0] || "";
      const wieldedEntity = registry.get(wieldingEId);
      const armor = getWearing(player);

      const rows = [
        [{}, { string: "Inventory" }],
        [],
        [
          {},
          {
            string: `${player.container?.name} [${player.container?.contents.length}/${player.container?.slots}]`,
          },
        ],
        ...itemsInInventory.map((item, index) => [
          {},
          {
            string: `${activeIndex === index ? "*" : " "} ${entityNamePlate(item)} ${item?.description}`,
          },
        ]),
        [],
        [
          {},
          {
            string: `Wielding [${player.weaponSlot?.contents.length}/${player.weaponSlot?.slots}]`,
          },
        ],
        [
          {},
          {
            string: `  ${entityNamePlate(wieldedEntity)} ${wieldedEntity?.description}`,
          },
        ],
        [],
        [
          {},
          {
            string: `Wearing [${player.armorSlot?.contents.length}/${player.armorSlot?.slots}]`,
          },
        ],
        [
          {},
          {
            string: `  ${armor && entityNamePlate(armor)} ${armor && armor?.description}`,
          },
        ],
      ];

      view?.clearView();
      view?.updateRows(rows, true);
      view?.show();
    } else {
      view?.hide();
    }
  }
};
