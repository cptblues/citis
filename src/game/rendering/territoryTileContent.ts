import Phaser from "phaser";

import type { TerritoryTileRendererKey } from "../../content/territoryContentCatalog";
import {
  getTerritoryTileDefinition,
  type TerritoryTileDefinition,
} from "../../content/territoryTileDefinitions";
import type { PlacedTerritoryTile } from "../../engine/board";

interface TerritoryTileRendererContext {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  tile: PlacedTerritoryTile;
  definition: TerritoryTileDefinition;
}

type TerritoryTileRenderer = (context: TerritoryTileRendererContext) => void;

const TERRITORY_TILE_RENDERERS = {
  town: renderTown,
  prairie: renderPrairie,
  forest: renderForest,
  river: renderRiver,
  field: renderField,
  orchard: renderOrchard,
  farm: renderFarm,
} satisfies Record<TerritoryTileRendererKey, TerritoryTileRenderer>;

export function createTerritoryTileContent(
  scene: Phaser.Scene,
  tile: PlacedTerritoryTile,
  centerX: number,
  centerY: number,
): Phaser.GameObjects.Container {
  const definition = getTerritoryTileDefinition(tile.typeId);
  const container = scene.add.container(centerX, centerY);
  const renderer = TERRITORY_TILE_RENDERERS[definition.renderer];

  renderer({
    scene,
    container,
    tile,
    definition,
  });

  container.setDepth(10);
  return container;
}

/**
 * Compatibilité avec les anciens appels du prototype.
 */
export function createTownContent(
  scene: Phaser.Scene,
  centerX: number,
  centerY: number,
): Phaser.GameObjects.Container {
  return createTerritoryTileContent(
    scene,
    {
      id: "territory:town:0:0",
      typeId: "town",
      q: 0,
      r: 0,
      rotation: 0,
      upgradeIds: [],
    },
    centerX,
    centerY,
  );
}

function renderTown({
  scene,
  container,
  definition,
}: TerritoryTileRendererContext): void {
  container.y -= 5;

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
    .text(0, -41, definition.label, {
      color: "#18351f",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "14px",
      fontStyle: "bold",
      stroke: "#fffdf7",
      strokeThickness: 4,
    })
    .setOrigin(0.5);

  container.add([mainBuilding, roof, door, leftHouse, rightHouse, label]);
}

function renderPrairie({
  scene,
  container,
}: TerritoryTileRendererContext): void {
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

function renderForest({
  scene,
  container,
}: TerritoryTileRendererContext): void {
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

function renderRiver({
  scene,
  container,
  tile,
}: TerritoryTileRendererContext): void {
  const river = scene.add.graphics();
  river.lineStyle(18, 0x459bb6, 1);
  drawRiverPath(river);

  const reflection = scene.add.graphics();
  reflection.lineStyle(4, 0xbde8ef, 0.85);
  drawRiverPath(reflection);

  container.add([river, reflection]);
  container.setAngle(-tile.rotation * 60);
}

function drawRiverPath(graphics: Phaser.GameObjects.Graphics): void {
  graphics.beginPath();
  graphics.moveTo(55, 0);
  graphics.lineTo(32, -3);
  graphics.lineTo(12, 2);
  graphics.lineTo(-5, -7);
  graphics.lineTo(-16, -25);
  graphics.lineTo(-28, -48);
  graphics.strokePath();
}

function renderField({ scene, container }: TerritoryTileRendererContext): void {
  const rows = scene.add.graphics();
  rows.lineStyle(5, 0xa7833f, 1);

  for (const offset of [-24, -8, 8, 24]) {
    rows.beginPath();
    rows.moveTo(offset - 12, 28);
    rows.lineTo(offset + 12, -28);
    rows.strokePath();
  }

  const cropPositions = [
    [-25, 12],
    [-14, -10],
    [-4, 18],
    [7, -13],
    [18, 12],
    [28, -9],
  ] as const;

  container.add(rows);

  for (const [x, y] of cropPositions) {
    const stem = scene.add.rectangle(x, y + 3, 2, 9, 0x6f7b32);
    const grain = scene.add.ellipse(x, y - 3, 5, 9, 0xe8d78b);
    container.add([stem, grain]);
  }
}

function renderOrchard({
  scene,
  container,
}: TerritoryTileRendererContext): void {
  const treePositions = [
    [-22, -10],
    [0, -16],
    [22, -8],
    [-12, 18],
    [15, 17],
  ] as const;

  for (const [x, y] of treePositions) {
    const trunk = scene.add.rectangle(x, y + 8, 4, 12, 0x75503a);
    const crown = scene.add.circle(x, y, 10, 0x587b3c);
    const highlight = scene.add.circle(x - 3, y - 3, 4, 0x789c50);
    const fruit = scene.add.circle(x + 4, y + 1, 2, 0xd8704f);
    container.add([trunk, crown, highlight, fruit]);
  }
}

function renderFarm({ scene, container }: TerritoryTileRendererContext): void {
  container.y -= 2;

  const barn = scene.add.rectangle(0, 9, 34, 29, 0xc8674e);
  const barnRoof = scene.add.graphics();
  barnRoof.fillStyle(0x7d4536, 1);
  barnRoof.beginPath();
  barnRoof.moveTo(-21, -4);
  barnRoof.lineTo(0, -23);
  barnRoof.lineTo(21, -4);
  barnRoof.closePath();
  barnRoof.fillPath();

  const barnDoor = scene.add.rectangle(0, 13, 13, 20, 0x7a4d37);
  const doorCross = scene.add.graphics();
  doorCross.lineStyle(2, 0xd9ad7b, 1);
  doorCross.beginPath();
  doorCross.moveTo(-6, 4);
  doorCross.lineTo(6, 22);
  doorCross.moveTo(6, 4);
  doorCross.lineTo(-6, 22);
  doorCross.strokePath();

  const silo = scene.add.ellipse(27, 9, 14, 31, 0xd9d0b5);
  const siloRoof = scene.add.ellipse(27, -7, 14, 7, 0x8d8a7d);
  const hay = scene.add.ellipse(-27, 20, 16, 9, 0xe0bd62);

  container.add([barn, barnRoof, barnDoor, doorCross, silo, siloRoof, hay]);
}

export function createTerritoryTilePreviewContent(
  scene: Phaser.Scene,
  tileTypeId: PlacedTerritoryTile["typeId"],
  rotation: PlacedTerritoryTile["rotation"],
  centerX: number,
  centerY: number,
): Phaser.GameObjects.Container {
  return createTerritoryTileContent(
    scene,
    {
      id: "territory-preview",
      typeId: tileTypeId,
      q: 0,
      r: 0,
      rotation,
      upgradeIds: [],
    },
    centerX,
    centerY,
  );
}
