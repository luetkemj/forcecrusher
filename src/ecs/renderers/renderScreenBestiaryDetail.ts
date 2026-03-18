import { chars, colors } from "../../actors/graphics";
import { AlignH, AlignV, TokenType } from "../../lib/canvas";
import { TileSet } from "../enums";
import { GameState, getState } from "../gameState";
import { RendererContext } from "../systems/render.system";
import { Entity } from "../engine";
import { bestiary } from "../../actors";

export const renderScreenBestiaryDetail = ({ views }: RendererContext) => {
  const { activeIndex } = getState().screenBestiary;
  const prefab = bestiary[activeIndex];

  const view = views.screenBestiaryDetail;
  if (getState().gameState === GameState.SCREEN_BESTIARY) {
    const rows = [
      [{ string: "" }],
      [{ string: "" }],
      namePlate(prefab),
      [{ string: "" }],
      description(prefab),
      [{ string: "" }],
      ...coreStats(prefab),
      [{ string: "" }],
      ...senses(prefab),
      [{ string: "" }],
      flammable(prefab),
      ...attacks(prefab),
      immunities(prefab),
      resistances(prefab),
      vulnerabilities(prefab),
    ];

    view?.clearView();
    view?.updateRows(rows, { parseTags: true, alignV: AlignV.Top });
    view?.show();
  } else {
    view?.hide();
  }
};

const namePlate = (prefab: Entity) => {
  return [
    {
      tokens: [
        {
          type: TokenType.Glyph,
          tileSet: TileSet.Kenny,
          char: prefab.appearance?.char || chars.default,
          tint: prefab.appearance?.tint || colors.default,
        },

        {
          type: TokenType.Text,
          value: ` ${prefab.name} | ${prefab.entityKind}, ${prefab.material} & ${prefab.vitalFluid}`,
          tint: colors.text,
          parseTags: true,
        },
      ],
      alignH: AlignH.Left,
    },
  ];
};

const description = (prefab: Entity) => {
  return [
    {
      tokens: [
        {
          type: TokenType.Text,
          value: `${prefab.description}`,
          tint: colors.text,
          parseTags: true,
        },
      ],
      alignH: AlignH.Left,
    },
  ];
};

const attacks = (prefab: Entity) => {
  if (!prefab.attacks) return [];
  return prefab.attacks.map((attack) => [
    {
      tokens: [
        {
          type: TokenType.Text,
          value: `${attack.name}: [${attack.attackType}] (${attack.damageRoll}) {${attack.damageType}}`,
          tint: colors.text,
          parseTags: true,
        },
      ],
      alignH: AlignH.Left,
    },
  ]);
};

// this won't exist until after it's spawned
const flammable = (prefab: Entity) => {
  if (!prefab.flammable) return [];
  const { flammable } = prefab;
  return [
    {
      tokens: [
        {
          type: TokenType.Text,
          value: `Flammable. Fuel: ${flammable.fuel.max} | ${flammable.source ? "Source | " : ""}${flammable.explosive ? "Explosive | " : ""}`,
          tint: colors.text,
          parseTags: true,
        },
      ],
      alignH: AlignH.Left,
    },
  ];
};

const coreStats = (prefab: Entity) => {
  const { strength, dexterity, constitution, intelligence, wisdom, charisma } =
    prefab;
  const stats = [
    `ST: ${strength}`,
    `DX: ${dexterity}`,
    `CN: ${constitution}`,
    `IN: ${intelligence}`,
    `WI: ${wisdom}`,
    `CH: ${charisma}`,
  ];
  return stats.map((stat) => [
    {
      tokens: [
        {
          type: TokenType.Text,
          value: stat,
          tint: colors.text,
          parseTags: true,
        },
      ],
      alignH: AlignH.Left,
    },
  ]);
};

const senses = (prefab: Entity) => {
  const vi = prefab.vision?.range;
  const au = prefab.ears?.sensitivity;
  const sm = prefab.nose?.sensitivity;
  const senses = [`VI: ${vi}`, `AU: ${au}`, `SM: ${sm}`, `TS: na`, `TO: na`];

  return senses.map((sense) => [
    {
      tokens: [
        {
          type: TokenType.Text,
          value: sense,
          tint: colors.text,
          parseTags: true,
        },
      ],
      alignH: AlignH.Left,
    },
  ]);
};

const immunities = (prefab: Entity) => {
  const immunities = prefab.immunities?.length ? prefab.immunities : ["None"];
  return [
    {
      tokens: [
        {
          type: TokenType.Text,
          value: `Immunities: ${immunities.join(", ")}`,
          tint: colors.text,
          parseTags: true,
        },
      ],
      alignH: AlignH.Left,
    },
  ];
};

const resistances = (prefab: Entity) => {
  const resistances = prefab.resistances?.length
    ? prefab.resistances
    : ["None"];
  return [
    {
      tokens: [
        {
          type: TokenType.Text,
          value: `Resistances: ${resistances.join(", ")}`,
          tint: colors.text,
          parseTags: true,
        },
      ],
      alignH: AlignH.Left,
    },
  ];
};

const vulnerabilities = (prefab: Entity) => {
  const vulnerabilities = prefab.vulnerabilities?.length
    ? prefab.vulnerabilities
    : ["None"];
  return [
    {
      tokens: [
        {
          type: TokenType.Text,
          value: `Vulnerabilities: ${vulnerabilities.join(", ")}`,
          tint: colors.text,
          parseTags: true,
        },
      ],
      alignH: AlignH.Left,
    },
  ];
};
