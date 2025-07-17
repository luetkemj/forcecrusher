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

type Textures = {
  ascii: Spritesheet;
  text: Spritesheet;
  tile: Texture;
};
const textures = {} as Textures;

export async function setupCanvas(element: HTMLCanvasElement): Promise<void> {
  app = new Application({
    view: element,
    width: window.innerWidth,
    height: cellWidth * grid.height,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    // TODO: allow user resizing
    // resizeTo is a prop that can eventually be used for proper resizing
  });

  await loadSprites();

  // to enable devtools
  // globalThis.__PIXI_APP__ = app;
}

export const loadSprites = async (): Promise<Textures> => {
  textures.ascii = await Assets.load("/forcecrusher/fonts/menlo-bold.json");
  textures.text = await Assets.load("/forcecrusher/fonts/menlo-bold-half.json");
  textures.tile = await Assets.load("/forcecrusher/tile.png");

  return textures;
};

const getAsciiTexture = (char: string): Texture => {
  return textures.ascii.textures[asciiMap[char as keyof typeof asciiMap]];
};

const getFontTexture = (char: string): Texture => {
  return textures.text.textures[fontMap[char as keyof typeof fontMap]];
};

const getTileTexture = (): Texture => {
  return textures.tile;
};

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

    // Push characters before tag
    for (let i = lastIndex; i < tagStart; i++) {
      chars.push(str[i]);
      tints.push(currentTint);
    }

    // Update tint
    if (tag === "reset") {
      currentTint = defaultTint;
    } else if (tag.startsWith("#")) {
      currentTint = parseInt(tag.slice(1), 16);
    } else if (namedColors[tag.toLowerCase()]) {
      currentTint = namedColors[tag.toLowerCase()];
    }

    lastIndex = tagRegex.lastIndex;
  }

  // Push remaining characters
  for (let i = lastIndex; i < str.length; i++) {
    chars.push(str[i]);
    tints.push(currentTint);
  }

  return { chars, tints };
};

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
}

interface GetTextureOptions {
  tileSet: string;
  char: string;
}

interface CreateSpriteOptions {
  char: string;
  width: number;
  height: number;
  layer: number;
  x: number;
  y: number;
  tileSet: string;
  tint: number;
  alpha: number;
}

interface UpdateSprite {
  char?: string;
  layer: number;
  x: number;
  y: number;
  tileSet: string;
  tint: number;
  alpha: number;
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

type Layer = {
  char: string;
  tint: number;
  alpha: number;
  tileSet: string;
  x: number;
  y: number;
};

type LayerMap = { [key: string]: Layer };

export class View {
  x: number = 0;
  y: number = 0;
  halfWidth: Boolean = false;
  width: number;
  height: number;
  layers: Container[] = [];
  sprites: Sprite[][][] = [];
  tileSets: Array<string> = [];
  tints: Array<number> = [];
  alphas: Array<number> = [];
  visible: boolean = true;

  constructor(options: ViewOptions) {
    this.width = options.width;
    this.height = options.height;
    this.tileSets = options.tileSets;
    this.tints = options.tints;
    this.alphas = options.alphas;
    this.halfWidth = this.tileSets.includes("text");
    this.visible = options.visible;

    // create n layers of containers
    _.times(options.layers, () => this.layers.push(new Container()));

    this.layers.forEach((layer) => {
      const posX = this.halfWidth
        ? options.x * (cellWidth / 2)
        : options.x * cellWidth;
      const posY = options.y * cellWidth;

      layer.x = posX;
      layer.y = posY;
      layer.interactiveChildren = false;
      layer.visible = this.visible;

      app.stage.addChild(layer);
    });

    // create n layers of arrays of arrays to store sprites
    _.times(options.layers, () =>
      this.sprites.push(
        Array.from(Array(this.height), () => Array.from(Array(this.width))),
      ),
    );

    // create sprites and store them
    _.times(options.layers, (layer) => {
      _.times(this.height, (y) => {
        _.times(this.width, async (x) => {
          this._createSprite({
            char: "",
            width: cellWidth,
            height: cellWidth,
            layer,
            x,
            y,
            tileSet: options.tileSets[layer],
            tint: options.tints[layer],
            alpha: options.alphas[layer],
          });
        });
      });
    });

    return this;
  }

  _getTexture = (opts: GetTextureOptions): Texture => {
    const { tileSet, char } = opts;
    if (tileSet === "ascii") return getAsciiTexture(char);
    if (tileSet === "text") return getFontTexture(char);
    return getTileTexture();
  };

  _createSprite = (opts: CreateSpriteOptions) => {
    const {
      char,
      width,
      height,
      layer,
      x,
      y,
      tileSet,
      tint = 0xffffff,
      alpha = 1,
    } = opts;

    const texture = this._getTexture({ tileSet, char });
    let sprite = new Sprite(texture);
    sprite.width = this.halfWidth ? width / 2 : width;
    sprite.height = height;
    sprite.x = this.halfWidth ? x * (width / 2) : x * width;
    sprite.y = y * height;
    sprite.tint = tint;
    sprite.alpha = alpha;

    this.sprites[layer][y][x] = sprite;
    this.layers[layer].addChild(sprite);
  };

  updateCell = (layerMap: LayerMap) => {
    Object.keys(layerMap).forEach((layer) => {
      const { char, tint, alpha, tileSet, x, y } = layerMap[layer];

      this.updateSprite({
        char,
        tint,
        alpha,
        tileSet,
        x,
        y,
        layer: parseInt(layer),
      });
    });

    return this;
  };

  updateSprite = async (opts: UpdateSprite) => {
    const { char = "", layer, x, y, tileSet = "text", tint, alpha } = opts;
    // if location is not on canvas, return
    if (y >= this.height || x >= this.width) {
      return this;
    }
    const sprite = this.sprites[layer][y][x];
    if (!sprite) return;

    sprite.texture = this._getTexture({ tileSet, char });
    if (tint) sprite.tint = tint;
    if (typeof alpha !== "undefined") sprite.alpha = alpha;

    return this;
  };

  updateRows = (opts: Array<Array<UpdateRow>>, parseTags = false) => {
    opts.forEach((rows, rowIndex) => {
      rows.forEach((rowLayer, layerIndex) => {
        // clear row before writing to it
        this.clearRow(layerIndex, rowIndex);
        this.updateRow({
          ...rowLayer,
          layer: layerIndex,
          y: rowIndex,
          parseTags,
        });
      });
    });

    return this;
  };

  updateRowBg = (opts: UpdateRow) => {
    const { string = "", layer = 0, x, y, tileSet, tint, alpha } = opts;
    [...string].forEach((char, index) =>
      this.updateSprite({
        char,
        layer: layer || 0,
        x: x || 0 + index,
        y: y || 0,
        tileSet: tileSet || this.tileSets[layer],
        tint: tint || this.tints[layer],
        alpha: alpha || this.alphas[layer],
      }),
    );

    const ts = tileSet || this.tileSets[layer];
    if (ts === "tile")
      _.times(this.width, (index) => {
        this.updateSprite({
          layer,
          x: x || 0 + index,
          y: y || 0,
          tileSet: tileSet || this.tileSets[layer],
          tint: tint || this.tints[layer],
          alpha: alpha || this.alphas[layer],
        });
      });

    return this;
  };

  updateRow = (opts: UpdateRow) => {
    const {
      string = "",
      layer = 0,
      x = 0,
      y = 0,
      tileSet,
      tint,
      alpha,
      colors,
      alphas,
      parseTags = false,
    } = opts;

    const ts = tileSet || this.tileSets[layer];
    let chars: string[] = [];
    let tints: number[] = [];

    if (parseTags) {
      const result = parseTaggedColors(string, tint ?? this.tints[layer]);
      chars = result.chars;
      tints = result.tints;
    } else {
      chars = [...string];
      tints = colors ?? chars.map(() => tint ?? this.tints[layer]);
    }

    chars.forEach((char, index) => {
      this.updateSprite({
        char,
        layer,
        x: x + index,
        y,
        tileSet: ts,
        tint: tints[index],
        alpha: alphas?.[index] ?? alpha ?? this.alphas[layer],
      });
    });

    return this;
  };

  clearRow = (layer: number, row: number) => {
    const eraser = new Array(this.width + 1).join(" ");

    const tileSet = this.tileSets[layer];
    const tileSetsToClear = new Set([
      tileSet,
      "tile", // common for visuals like odor
      "text", // common for UI text
      "ascii", // common for classic roguelike glyphs
    ]);

    for (const ts of tileSetsToClear) {
      this.updateRow({
        string: eraser,
        layer,
        y: row,
        tileSet: ts,
        tint: 0x000000,
        alpha: 0,
      });
    }
  };

  clearView = () => {
    let layerIndex: number = 0;
    this.layers.forEach(() => {
      /* tslint:disable:no-unused-variable */
      _.times(this.height, (rowIndex) => {
        this.clearRow(layerIndex, rowIndex);
      });

      layerIndex += 1;
    });
  };

  show = () => {
    this.visible = true;
    this.layers.forEach((layer) => (layer.visible = this.visible));
  };

  hide = () => {
    this.visible = false;
    this.layers.forEach((layer) => (layer.visible = this.visible));
  };
}
