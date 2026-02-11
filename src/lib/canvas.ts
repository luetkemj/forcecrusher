import _ from "lodash";
import {
  Application,
  Assets,
  Container,
  Sprite,
  Spritesheet,
  Texture,
} from "pixi.js";
import { menloBoldAlphaMap as asciiMap } from "../sprite-maps/menlo-bold.map";
import { menloBoldHalfAlphaMap as fontMap } from "../sprite-maps/menlo-bold-half.map";
import { kennyGFXMap } from "../sprite-maps/kenny.map";
import { TileSet } from "../ecs/enums";

/* ============================================================================
 * App / Grid
 * ============================================================================
 */

let app: Application;

const grid = {
  width: 100,
  height: 46,
};

const cellWidth = window.innerWidth / grid.width;

export const pxToPosId = (x: number, y: number) => {
  const posX = Math.trunc(x / cellWidth);
  const posY = Math.trunc(y / cellWidth);
  return `${posX},${posY}`;
};

/* ============================================================================
 * Textures
 * ============================================================================
 */

type Textures = {
  ascii: Spritesheet;
  text: Spritesheet;
  tile: Texture;
  kenny: Spritesheet;
};

const textures = {} as Textures;

export async function setupCanvas(element: HTMLCanvasElement): Promise<void> {
  app = new Application({
    view: element,
    width: window.innerWidth,
    height: cellWidth * grid.height,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  await loadSprites();

  // to enable devtools
  // globalThis.__PIXI_APP__ = app;
}

export const loadSprites = async (): Promise<Textures> => {
  textures.ascii = await Assets.load("/forcecrusher/fonts/menlo-bold.json");
  textures.text = await Assets.load("/forcecrusher/fonts/menlo-bold-half.json");
  textures.tile = await Assets.load("/forcecrusher/tile.png");
  textures.kenny = await Assets.load(
    "/forcecrusher/gfx/kenny-transparent.json",
  );

  return textures;
};

const getAsciiTexture = (char: string): Texture =>
  textures.ascii.textures[asciiMap[char as keyof typeof asciiMap]];

const getFontTexture = (char: string): Texture =>
  textures.text.textures[fontMap[char as keyof typeof fontMap]];

const getTileTexture = (): Texture => textures.tile;

const getKennyTexture = (char: string): Texture => {
  const charNum = kennyGFXMap[char as keyof typeof kennyGFXMap];
  const key = `monochrome-transparent_packed-${charNum}.png`;
  return textures.kenny.textures[key];
};

/* ============================================================================
 * Tile Metrics (cell units)
 * ============================================================================
 */

const TILE_WIDTH: Record<string, number> = {
  text: 0.5,
  ascii: 1,
  kenny: 1,
  tile: 1,
};

/* ============================================================================
 * Color Tags
 * ============================================================================
 */

const namedColors: Record<string, number> = {
  red: 0xff0000,
  green: 0x00ff00,
  purple: 0x6a6fb1,
  blue: 0x0000ff,
  yellow: 0xffff00,
  cyan: 0x00ffff,
  magenta: 0xff00ff,
  white: 0xffffff,
  black: 0x000000,
  gray: 0x888888,
};

const parseTaggedColors = (str: string, defaultTint: number = 0xffffff) => {
  const chars: string[] = [];
  const tints: number[] = [];

  let currentTint = defaultTint;
  const tagRegex = /§(#[0-9a-fA-F]{6}|[a-zA-Z]+|reset)§/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(str))) {
    const tagStart = match.index;
    const tag = match[1];

    for (let i = lastIndex; i < tagStart; i++) {
      chars.push(str[i]);
      tints.push(currentTint);
    }

    if (tag === "reset") {
      currentTint = defaultTint;
    } else if (tag.startsWith("#")) {
      currentTint = parseInt(tag.slice(1), 16);
    } else if (namedColors[tag.toLowerCase()]) {
      currentTint = namedColors[tag.toLowerCase()];
    }

    lastIndex = tagRegex.lastIndex;
  }

  for (let i = lastIndex; i < str.length; i++) {
    chars.push(str[i]);
    tints.push(currentTint);
  }

  return { chars, tints };
};

/* ============================================================================
 * Shared Types
 * ============================================================================
 */

// todo: make these enums
export enum AlignH {
  Left = "left",
  Center = "center",
  Right = "right",
}
export enum AlignV {
  Top = "top",
  Middle = "middle",
  Bottom = "bottom",
}

interface ViewOptions {
  width: number;
  height: number;
  x: number;
  y: number;
  layers: number;
  tileSets: Array<TileSet>;
  tints: Array<number>;
  alphas: Array<number>;
  visible: boolean;
  name: string;
}

export interface UpdateRow {
  string?: string;
  tokens?: Array<RowToken>;
  layer?: number;
  x?: number;
  y?: number;
  tileSet?: TileSet;
  tint?: number;
  alpha?: number;
  colors?: Array<number>;
  alphas?: Array<number>;
  parseTags?: boolean;
  alignH?: AlignH;
}

type LayerMap = {
  [layer: number]: {
    char: string;
    tint: number;
    alpha: number;
    tileSet: TileSet;
    x: number;
    y: number;
  };
};

/* ============================================================================
 * UI Row Tokens
 * ============================================================================
 */
export const TokenType = {
  Text: "text",
  Glyph: "glyph",
} as const;

export type RowToken =
  | {
      type: typeof TokenType.Text;
      value: string;
      tileSet?: TileSet;
      tint?: number;
      alpha?: number;
      parseTags?: boolean;
    }
  | {
      type: typeof TokenType.Glyph;
      char: string;
      tileSet: TileSet;
      width?: number;
      tint?: number;
      alpha?: number;
    };

/* ============================================================================
 * BaseView
 * ============================================================================
 */

abstract class BaseView {
  width: number;
  height: number;
  layers: Container[] = [];
  tileSets: TileSet[];
  tints: number[];
  alphas: number[];
  visible: boolean;
  name: string;

  constructor(opts: ViewOptions) {
    this.width = opts.width;
    this.height = opts.height;
    this.tileSets = opts.tileSets;
    this.tints = opts.tints;
    this.alphas = opts.alphas;
    this.visible = opts.visible;
    this.name = opts.name;

    _.times(opts.layers, () => {
      const layer = new Container();
      layer.x = opts.x * cellWidth;
      layer.y = opts.y * cellWidth;
      layer.visible = this.visible;
      layer.interactiveChildren = false;
      app.stage.addChild(layer);
      this.layers.push(layer);
    });
  }

  protected getTexture(tileSet: TileSet, char: string): Texture {
    if (tileSet === TileSet.Ascii) return getAsciiTexture(char);
    if (tileSet === TileSet.Text) return getFontTexture(char);
    if (tileSet === TileSet.Kenny) return getKennyTexture(char);
    return getTileTexture();
  }

  show() {
    this.visible = true;
    this.layers.forEach((l) => (l.visible = true));
  }

  hide() {
    this.visible = false;
    this.layers.forEach((l) => (l.visible = false));
  }
}

/* ============================================================================
 * MapView — fixed grid, preallocated
 * ============================================================================
 */

export class MapView extends BaseView {
  spriteGrid: Sprite[][][] = [];

  constructor(opts: ViewOptions) {
    super(opts);

    _.times(opts.layers, () => {
      const layerGrid: Sprite[][] = Array.from(
        { length: this.height },
        () => new Array<Sprite>(this.width),
      );
      this.spriteGrid.push(layerGrid);
    });

    _.times(opts.layers, (layer) => {
      _.times(this.height, (y) => {
        _.times(this.width, (x) => {
          const sprite = new Sprite(this.getTexture(opts.tileSets[layer], ""));
          sprite.width = cellWidth;
          sprite.height = cellWidth;
          sprite.x = x * cellWidth;
          sprite.y = y * cellWidth;
          sprite.tint = this.tints[layer];
          sprite.alpha = this.alphas[layer];

          this.spriteGrid[layer][y][x] = sprite;
          this.layers[layer].addChild(sprite);
        });
      });
    });
  }

  updateCell(layerMap: LayerMap) {
    Object.entries(layerMap).forEach(([layerStr, data]) => {
      const layer = Number(layerStr);
      const sprite = this.spriteGrid[layer]?.[data.y]?.[data.x];
      if (!sprite) return;

      sprite.texture = this.getTexture(data.tileSet, data.char);
      sprite.tint = data.tint;
      sprite.alpha = data.alpha;
    });
  }

  clearRow(layer: number, y: number) {
    for (let x = 0; x < this.width; x++) {
      const sprite = this.spriteGrid[layer][y][x];
      sprite.texture = this.getTexture(this.tileSets[layer], "");
      sprite.tint = this.tints[layer];
      sprite.alpha = 0;
    }
  }

  clearView() {
    _.times(this.layers.length, (layer) =>
      _.times(this.height, (y) => this.clearRow(layer, y)),
    );
  }
}

/* ============================================================================
 * UIPanelView — mixed-width, row-based
 * ============================================================================
 */

export class UIPanelView extends BaseView {
  sprites: Sprite[][][] = [];

  constructor(opts: ViewOptions) {
    super(opts);
    _.times(opts.layers, () => {
      this.sprites.push(
        Array.from({ length: this.height }, () => [] as Sprite[]),
      );
    });
  }

  private measureStringWidth(
    str: string,
    tileSet: TileSet,
    parseTags: boolean,
  ): number {
    const glyphWidth = TILE_WIDTH[tileSet] ?? 1;

    if (!parseTags) return str.length * glyphWidth;

    const { chars } = parseTaggedColors(str);
    return chars.length * glyphWidth;
  }

  private measureTokensWidth(layer: number, tokens: RowToken[]): number {
    let width = 0;

    for (const token of tokens) {
      if (token.type === "text") {
        const ts = token.tileSet ?? this.tileSets[layer];
        const glyphWidth = TILE_WIDTH[ts] ?? 1;

        const charCount = token.parseTags
          ? parseTaggedColors(token.value).chars.length
          : token.value.length;

        width += charCount * glyphWidth;
      }

      if (token.type === "glyph") {
        width += token.width ?? TILE_WIDTH[token.tileSet] ?? 1;
      }
    }

    return width;
  }

  private getVerticalStartY(contentHeight: number, align?: AlignV) {
    if (!align || align === "top") return 0;
    if (align === "bottom") return this.height - contentHeight;
    return Math.floor((this.height - contentHeight) / 2);
  }

  private getHorizontalStartX(
    contentWidth: number,
    align: AlignH | undefined,
  ): number {
    if (!align || align === "left") return 0;
    if (align === "right") return this.width - contentWidth;

    return (this.width - contentWidth) / 2; // center
  }

  private drawGlyph(opts: {
    layer: number;
    x: number;
    y: number;
    char: string;
    tileSet: TileSet;
    tint?: number;
    alpha?: number;
    width?: number;
  }) {
    const width = opts.width ?? TILE_WIDTH[opts.tileSet] ?? 1;

    const sprite = new Sprite(this.getTexture(opts.tileSet, opts.char));
    sprite.width = width * cellWidth;
    sprite.height = cellWidth;
    sprite.x = opts.x * cellWidth;
    sprite.y = opts.y * cellWidth;
    sprite.tint = opts.tint ?? this.tints[opts.layer];
    sprite.alpha = opts.alpha ?? this.alphas[opts.layer];

    this.layers[opts.layer].addChild(sprite);
    this.sprites[opts.layer][opts.y].push(sprite);
  }

  clearRow(layer: number, y: number) {
    this.sprites[layer][y].forEach((s: Sprite) => s.destroy());
    this.sprites[layer][y] = [];
  }

  updateRows(
    rows: Array<Array<UpdateRow>>,
    opts?: {
      parseTags?: boolean;
      alignH?: AlignH;
      alignV?: AlignV;
    },
  ) {
    const parseTags = opts?.parseTags ?? true;
    const alignV = opts?.alignV ?? AlignV.Top;
    const contentHeight = rows.length;
    const startY = this.getVerticalStartY(contentHeight, alignV);

    rows.forEach((layers, rowIndex) => {
      const y = startY + rowIndex;

      // skip rows that would render outside the panel
      if (y < 0 || y >= this.height) return;

      layers.forEach((row, layer) => {
        if (!row) return this.clearRow(layer, y);

        if (row.string !== undefined) {
          this.updateRow({
            ...row,
            layer,
            y,
            parseTags,
          });
        } else if (row.tokens) {
          this.updateRowTokens({
            layer,
            y,
            tokens: row.tokens,
            align: row.alignH,
          });
        }
      });
    });
  }

  updateRow(opts: UpdateRow) {
    const {
      string = "",
      layer = 0,
      y = 0,
      x = 0,
      tileSet,
      tint,
      alpha,
      parseTags = false,
      alignH = AlignH.Left,
    } = opts;

    this.clearRow(layer, y);

    const ts = tileSet || this.tileSets[layer];
    const glyphWidth = TILE_WIDTH[ts] ?? 1;
    const contentWidth = this.measureStringWidth(string, ts, parseTags);
    let cursorX = x + this.getHorizontalStartX(contentWidth, alignH);

    const { chars, tints } = parseTags
      ? parseTaggedColors(string, tint ?? this.tints[layer])
      : {
          chars: [...string],
          tints: [...string].map(() => tint ?? this.tints[layer]),
        };

    chars.forEach((char, i) => {
      this.drawGlyph({
        layer,
        x: cursorX,
        y,
        char,
        tileSet: ts,
        tint: tints[i],
        alpha,
        width: glyphWidth,
      });

      cursorX += glyphWidth;
    });
  }

  updateRowTokens(opts: {
    layer?: number;
    y: number;
    x?: number;
    tokens: RowToken[];
    align?: AlignH;
  }) {
    const layer = opts.layer ?? 0;
    const y = opts.y;
    const align = opts.align ?? AlignH.Left;

    this.clearRow(layer, y);

    const contentWidth = this.measureTokensWidth(layer, opts.tokens);
    let cursorX = (opts.x ?? 0) + this.getHorizontalStartX(contentWidth, align);

    for (const token of opts.tokens) {
      if (token.type === "text") {
        const ts = token.tileSet ?? this.tileSets[layer];
        const defaultTint = token.tint ?? this.tints[layer];

        const { chars, tints } = token.parseTags
          ? parseTaggedColors(token.value, defaultTint)
          : {
              chars: [...token.value],
              tints: [...token.value].map(() => defaultTint),
            };

        const glyphWidth = TILE_WIDTH[ts] ?? 1;

        chars.forEach((char, i) => {
          this.drawGlyph({
            layer,
            x: cursorX,
            y,
            char,
            tileSet: ts,
            tint: tints[i],
            alpha: token.alpha,
            width: glyphWidth,
          });

          cursorX += glyphWidth;
        });
      }

      if (token.type === "glyph") {
        const width = token.width ?? TILE_WIDTH[token.tileSet] ?? 1;

        this.drawGlyph({
          layer,
          x: cursorX,
          y,
          char: token.char,
          tileSet: token.tileSet,
          tint: token.tint,
          alpha: token.alpha,
          width,
        });

        cursorX += width;
      }
    }
  }

  clearView() {
    _.times(this.layers.length, (layer) =>
      _.times(this.height, (y) => this.clearRow(layer, y)),
    );
  }
}
