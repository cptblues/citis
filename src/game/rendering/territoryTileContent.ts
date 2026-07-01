import Phaser from "phaser";

import type { TerritoryTileRendererKey } from "../../content/territoryContentCatalog";
import {
  getTerritoryTileDefinition,
  type TerritoryTileDefinition,
} from "../../content/territoryTileDefinitions";
import type { PlacedTerritoryTile } from "../../engine/board";
import {
  SET_SETTLEMENT_LEVEL_EVENT,
  type SettlementLevelChangedPayload,
} from "../gameEvents";

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

  renderer({ scene, container, tile, definition });
  container.setDepth(10);

  return container;
}

/** Compatibilité avec les anciens appels du prototype. */
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

  const visual = scene.add.container(0, 0);
  container.add(visual);

  let currentLevel: SettlementLevelChangedPayload = {
    id: "village",
    label: definition.label,
    levelIndex: 0,
  };

  const drawCurrentLevel = (): void => {
    visual.removeAll(true);

    if (currentLevel.levelIndex >= 2) {
      drawMetropolitanHeart(scene, visual, currentLevel.label);
      return;
    }

    if (currentLevel.levelIndex >= 1) {
      drawCommunalCenter(scene, visual, currentLevel.label);
      return;
    }

    drawVillage(scene, visual, currentLevel.label);
  };

  const handleSettlementLevelChanged = (
    nextLevel: SettlementLevelChangedPayload,
  ): void => {
    if (nextLevel.id === currentLevel.id) {
      return;
    }

    currentLevel = nextLevel;
    drawCurrentLevel();
    visual.setAlpha(0).setScale(0.72);

    const halo = scene.add.circle(0, 3, 29, 0xf6d98a, 0.5);
    container.addAt(halo, 0);

    scene.tweens.add({
      targets: visual,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 420,
      ease: "Back.Out",
    });
    scene.tweens.add({
      targets: halo,
      alpha: 0,
      scaleX: 1.75,
      scaleY: 1.75,
      duration: 700,
      ease: "Sine.Out",
      onComplete: () => halo.destroy(),
    });
  };

  scene.game.events.on(
    SET_SETTLEMENT_LEVEL_EVENT,
    handleSettlementLevelChanged,
  );
  container.once("destroy", () => {
    scene.game.events.off(
      SET_SETTLEMENT_LEVEL_EVENT,
      handleSettlementLevelChanged,
    );
  });

  drawCurrentLevel();
}

function drawVillage(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  labelText: string,
): void {
  const mainBuilding = scene.add.rectangle(0, 7, 34, 26, 0xf1e1bd);
  const roof = createRoof(scene, 0, -3, 21, 20, 0xb85f45);
  const door = scene.add.rectangle(0, 13, 8, 14, 0x6c4835);
  const leftHouse = scene.add.rectangle(-24, 12, 15, 17, 0xf5e6c8);
  const rightHouse = scene.add.rectangle(24, 12, 15, 17, 0xf5e6c8);
  const label = createTownLabel(scene, labelText, -41);

  container.add([mainBuilding, roof, door, leftHouse, rightHouse, label]);
}

function drawCommunalCenter(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  labelText: string,
): void {
  const plaza = scene.add.ellipse(0, 25, 64, 18, 0xd8cda9, 0.9);
  const mainBuilding = scene.add.rectangle(0, 5, 42, 31, 0xf1dfb8);
  const roof = createRoof(scene, 0, -6, 25, 22, 0xae563f);
  const door = scene.add.rectangle(0, 12, 9, 17, 0x684733);
  const leftHouse = scene.add.rectangle(-30, 13, 18, 21, 0xf5e8cc);
  const rightHouse = scene.add.rectangle(30, 13, 18, 21, 0xf5e8cc);
  const treeTrunk = scene.add.rectangle(-39, 18, 4, 12, 0x70503a);
  const treeCrown = scene.add.circle(-39, 8, 10, 0x4f7d50);
  const fountain = scene.add.circle(0, 25, 5, 0x65a6b9);
  const label = createTownLabel(scene, labelText, -46);

  container.add([
    plaza,
    mainBuilding,
    roof,
    door,
    leftHouse,
    rightHouse,
    treeTrunk,
    treeCrown,
    fountain,
    label,
  ]);
}

function drawMetropolitanHeart(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  labelText: string,
): void {
  const plaza = scene.add.ellipse(0, 26, 72, 20, 0xd6c79d, 0.95);
  const leftWing = scene.add.rectangle(-22, 10, 25, 31, 0xead7ae);
  const rightWing = scene.add.rectangle(22, 10, 25, 31, 0xead7ae);
  const center = scene.add.rectangle(0, 2, 28, 43, 0xf1dfb8);
  const roof = createRoof(scene, 0, -20, 18, 14, 0x9e4c3a);
  const tower = scene.add.rectangle(0, -22, 12, 20, 0xe7d2a7);
  const towerRoof = createRoof(scene, 0, -34, 9, 10, 0x8e4434);
  const clock = scene.add.circle(0, -23, 4, 0xfff4d3);
  const door = scene.add.rectangle(0, 14, 9, 17, 0x624331);
  const leftTree = createTree(scene, -42, 10);
  const rightTree = createTree(scene, 42, 10);
  const fountain = scene.add.circle(0, 27, 6, 0x5d9eb4);
  const label = createTownLabel(scene, labelText, -55);

  container.add([
    plaza,
    leftWing,
    rightWing,
    center,
    roof,
    tower,
    towerRoof,
    clock,
    door,
    ...leftTree,
    ...rightTree,
    fountain,
    label,
  ]);
}

function createRoof(
  scene: Phaser.Scene,
  centerX: number,
  baseY: number,
  halfWidth: number,
  height: number,
  color: number,
): Phaser.GameObjects.Graphics {
  const roof = scene.add.graphics();
  roof.fillStyle(color, 1);
  roof.beginPath();
  roof.moveTo(centerX - halfWidth, baseY);
  roof.lineTo(centerX, baseY - height);
  roof.lineTo(centerX + halfWidth, baseY);
  roof.closePath();
  roof.fillPath();
  return roof;
}

function createTownLabel(
  scene: Phaser.Scene,
  text: string,
  y: number,
): Phaser.GameObjects.Text {
  return scene.add
    .text(0, y, text, {
      color: "#18351f",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "14px",
      fontStyle: "bold",
      stroke: "#fffdf7",
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setVisible(false);
}

function createTree(
  scene: Phaser.Scene,
  x: number,
  y: number,
): Phaser.GameObjects.GameObject[] {
  return [
    scene.add.rectangle(x, y + 9, 4, 13, 0x70503a),
    scene.add.circle(x, y, 10, 0x4f7d50),
  ];
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
  const barnRoof = createRoof(scene, 0, -4, 21, 19, 0x7d4536);
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
