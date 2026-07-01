import Phaser from "phaser";
import { TerritoryPrototypeScene } from "./scenes/TerritoryPrototypeScene";

const FALLBACK_GAME_WIDTH = 960;
const FALLBACK_GAME_HEIGHT = 640;

/**
 * Crée l'instance Phaser attachée au conteneur fourni par React.
 *
 * Le canvas utilise la taille réelle de son parent au lieu d'étirer
 * une surface fixe de 960 × 640.
 */
export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  const width =
    parent.clientWidth > 0 ? parent.clientWidth : FALLBACK_GAME_WIDTH;
  const height =
    parent.clientHeight > 0 ? parent.clientHeight : FALLBACK_GAME_HEIGHT;

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: "#dfe8dd",
    disableContextMenu: true,
    input: {
      mouse: {
        preventDefaultDown: true,
        preventDefaultUp: true,
        preventDefaultMove: true,
        preventDefaultWheel: true,
      },
    },
    scene: [TerritoryPrototypeScene],
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
}
