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
  const charNum = [kennyGFXMap[char as keyof typeof kennyGFXMap]];
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

interface ViewOptions {
  width: number;
  height: number;
  x: number;
  y: number;
  layers: number;
  tileSets: Array<string>;
  tints: Array<number>;
  alphas: Array<number>;
  visible: boolean;
  name: string;
}

export interface UpdateRow {
  string?: string;
  layer?: number;
  x?: number;
  y?: number;
  tileSet?: string;
  tint?: number;
  alpha?: number;
  colors?: Array<number>;
  alphas?: Array<number>;
  parseTags?: boolean;
}

type LayerMap = {
  [layer: number]: {
    char: string;
    tint: number;
    alpha: number;
    tileSet: string;
    x: number;
    y: number;
  };
};

/* ============================================================================
 * BaseView (shared plumbing)
 * ============================================================================
 */

abstract class BaseView {
  width: number;
  height: number;
  layers: Container[] = [];
  tileSets: string[];
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

  protected getTexture(tileSet: string, char: string): Texture {
    if (tileSet === "ascii") return getAsciiTexture(char);
    if (tileSet === "text") return getFontTexture(char);
    if (tileSet === "kenny") return getKennyTexture(char);
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
 * MapView — fixed grid, preallocated (unchanged semantics)
 * ============================================================================
 */

export class MapView extends BaseView {
  sprites: Sprite[][][] = [];

  constructor(opts: ViewOptions) {
    super(opts);

    _.times(opts.layers, () => {
      this.sprites.push(
        Array.from({ length: this.height }, () =>
          Array.from({ length: this.width }),
        ),
      );
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

          this.sprites[layer][y][x] = sprite;
          this.layers[layer].addChild(sprite);
        });
      });
    });
  }

  updateCell(layerMap: LayerMap) {
    Object.entries(layerMap).forEach(([layerStr, data]) => {
      const layer = Number(layerStr);
      const sprite = this.sprites[layer]?.[data.y]?.[data.x];
      if (!sprite) return;

      sprite.texture = this.getTexture(data.tileSet, data.char);
      sprite.tint = data.tint;
      sprite.alpha = data.alpha;
    });
  }

  clearRow(layer: number, y: number) {
    for (let x = 0; x < this.width; x++) {
      const sprite = this.sprites[layer][y][x];
      sprite.texture = this.getTexture(this.tileSets[layer], "");
      sprite.tint = this.tints[layer];
      sprite.alpha = this.alphas[layer];
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
  sprites: Sprite[][] = [];

  constructor(opts: ViewOptions) {
    super(opts);
    _.times(opts.layers, () => {
      this.sprites.push(Array.from({ length: this.height }, () => []));
    });
  }

  clearRow(layer: number, y: number) {
    this.sprites[layer][y].forEach((s) => s.destroy());
    this.sprites[layer][y] = [];
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
    } = opts;

    this.clearRow(layer, y);

    const ts = tileSet || this.tileSets[layer];
    const glyphWidth = TILE_WIDTH[ts] ?? 1;
    let cursorX = x;

    const { chars, tints } = parseTags
      ? parseTaggedColors(string, tint ?? this.tints[layer])
      : {
          chars: [...string],
          tints: [...string].map(() => tint ?? this.tints[layer]),
        };

    chars.forEach((char, i) => {
      const sprite = new Sprite(this.getTexture(ts, char));

      sprite.width = glyphWidth * cellWidth;
      sprite.height = cellWidth;
      sprite.x = cursorX * cellWidth;
      sprite.y = y * cellWidth;
      sprite.tint = tints[i];
      sprite.alpha = alpha ?? this.alphas[layer];

      this.layers[layer].addChild(sprite);
      this.sprites[layer][y].push(sprite);

      cursorX += glyphWidth;
    });
  }

  clearView() {
    _.times(this.layers.length, (layer) =>
      _.times(this.height, (y) => this.clearRow(layer, y)),
    );
  }
}
