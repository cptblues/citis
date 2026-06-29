import Phaser from "phaser";

import { TerritoryPrototypeScene } from "./scenes/TerritoryPrototypeScene";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 640;

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#dfe8dd",
    scene: [TerritoryPrototypeScene],
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
}
