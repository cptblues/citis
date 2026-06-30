import Phaser from "phaser";

import type { PlacedTerritoryTile } from "../../engine/board";

export function createTownContent(
  scene: Phaser.Scene,
  centerX: number,
  centerY: number,
): Phaser.GameObjects.Container {
  const container = scene.add.container(centerX, centerY - 5);

  const mainBuilding = scene.add.rectangle(0, 7, 34, 26, 0xf1e1bd);

  const roof = scene.add.graphics();

  roof.fillStyle(0xb85f45, 1);
  roof.beginPath();
  roof.moveTo(-21, -3);
  roof.lineTo(0, -23);
  roof.lineTo(21, -3);
  roof.closePath();
  roof.fillPath();

  const door = scene.add.rectangle(0, 13, 8, 14, 0x6c4835);

  const leftHouse = scene.add.rectangle(-24, 12, 15, 17, 0xf5e6c8);

  const rightHouse = scene.add.rectangle(24, 12, 15, 17, 0xf5e6c8);

  const label = scene.add
    .text(0, -41, "Bourg", {
      color: "#18351f",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "14px",
      fontStyle: "bold",
      stroke: "#fffdf7",
      strokeThickness: 4,
    })
    .setOrigin(0.5);

  container.add([mainBuilding, roof, door, leftHouse, rightHouse, label]);

  container.setDepth(10);

  return container;
}

export function createTerritoryTileContent(
  scene: Phaser.Scene,
  tile: PlacedTerritoryTile,
  centerX: number,
  centerY: number,
): Phaser.GameObjects.Container | null {
  if (tile.typeId === "town") {
    return null;
  }

  const container = scene.add.container(centerX, centerY);

  if (tile.typeId === "prairie") {
    addPrairieContent(scene, container);
  } else if (tile.typeId === "forest") {
    addForestContent(scene, container);
  } else {
    container.destroy();

    return null;
  }

  container.setDepth(10);

  return container;
}

function addPrairieContent(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
): void {
  const flowerPositions = [
    [-20, -8],
    [-6, 10],
    [10, -13],
    [22, 8],
    [2, 22],
  ] as const;

  for (const [x, y] of flowerPositions) {
    const flower = scene.add.circle(x, y, 3, 0xf4df78);

    const center = scene.add.circle(x, y, 1, 0x9c6d32);

    container.add([flower, center]);
  }
}

function addForestContent(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
): void {
  const treePositions = [
    [-20, 9],
    [0, -8],
    [20, 10],
    [2, 19],
  ] as const;

  for (const [x, y] of treePositions) {
    const trunk = scene.add.rectangle(x, y + 9, 5, 13, 0x715039);

    const crown = scene.add.circle(x, y, 12, 0x315f3c);

    const highlight = scene.add.circle(x - 4, y - 4, 5, 0x4f7d50);

    container.add([trunk, crown, highlight]);
  }
}
