import { RendererContext } from "../systems/render.system";
import { colorTag } from "../../lib/utils";
import { getWearing, getWielding } from "../../lib/utils";
import { getArmorClass } from "../../lib/combat";
import { getState } from "../gameState";

export const renderHud = ({ views, queries }: RendererContext) => {
  const view = views.hud;
  const [player] = queries.pcQuery;
  if (view && player) {
    let weapon = "unarmed";
    const wielding = getWielding(player);
    let weaponString;
    if (wielding) {
      weapon = wielding.name;
      const tint = wielding.appearance?.tint || 0x00ff00;
      weaponString = `${colorTag(tint)}): ${weapon}`;
    } else {
      weaponString = `): ${weapon}`;
    }

    let armor = "unarmored";
    const wearing = getWearing(player);
    let armorString;
    if (wearing) {
      armor = wearing.name;
      const tint = wearing.appearance?.tint || 0x00ff00;
      armorString = `${colorTag(tint)}]: ${armor}`;
    } else {
      armorString = `]: ${armor}`;
    }

    if (view) {
      const rows = [
        [{ string: `Forcecrusher` }],
        [],
        [{ string: `Zone: ${getState().zoneId}` }],
        [],
        [{ string: `LV: 1` }],
        [{ string: `HP: ${player?.health?.current}/${player?.health?.max}` }],
        [],
        [{ string: `${weaponString}§reset§ (${player.averageDamage})` }],
        [{ string: `${armorString}§reset§ [${getArmorClass(player)}]` }],
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
      view?.updateRows(rows, true);
    }
  }
};
