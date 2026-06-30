import Phaser from "phaser";

import type { TerritoryUpgradeRendererKey } from "../../content/territoryContentCatalog";
import {
  getTerritoryUpgradeDefinition,
  type PrototypeUpgradeTypeId,
} from "../../content/territoryUpgradeDefinitions";

interface TerritoryUpgradeRendererContext {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
}

type TerritoryUpgradeRenderer = (
  context: TerritoryUpgradeRendererContext,
) => void;

const TERRITORY_UPGRADE_RENDERERS = {
  "forest-trail": renderForestTrail,
  hedges: renderHedges,
  beehives: renderBeehives,
  "solar-panels": renderSolarPanels,
} satisfies Record<TerritoryUpgradeRendererKey, TerritoryUpgradeRenderer>;

export function createTerritoryUpgradeContent(
  scene: Phaser.Scene,
  upgradeTypeId: PrototypeUpgradeTypeId,
  centerX: number,
  centerY: number,
): Phaser.GameObjects.Container {
  const definition = getTerritoryUpgradeDefinition(upgradeTypeId);
  const container = scene.add.container(centerX, centerY);
  const renderer = TERRITORY_UPGRADE_RENDERERS[definition.renderer];

  renderer({
    scene,
    container,
  });

  container.setDepth(12);
  return container;
}

function renderForestTrail({
  scene,
  container,
}: TerritoryUpgradeRendererContext): void {
  const trail = scene.add.graphics();
  trail.lineStyle(6, 0xd8b678, 1);
  trail.beginPath();
  trail.moveTo(-31, 25);
  trail.lineTo(-15, 13);
  trail.lineTo(-4, 18);
  trail.lineTo(11, 4);
  trail.lineTo(28, -3);
  trail.strokePath();

  const firstStone = scene.add.ellipse(-17, 14, 5, 3, 0xf0d59b);
  const secondStone = scene.add.ellipse(7, 7, 5, 3, 0xf0d59b);
  container.add([trail, firstStone, secondStone]);
}

function renderHedges({
  scene,
  container,
}: TerritoryUpgradeRendererContext): void {
  const hedge = scene.add.graphics();
  hedge.lineStyle(7, 0x416a38, 1);
  hedge.beginPath();
  hedge.moveTo(-39, 19);
  hedge.lineTo(-21, 31);
  hedge.lineTo(2, 35);
  hedge.lineTo(27, 25);
  hedge.lineTo(39, 9);
  hedge.strokePath();

  const hedgeHighlights = [
    [-31, 23],
    [-11, 32],
    [12, 32],
    [31, 20],
  ] as const;

  container.add(hedge);

  for (const [x, y] of hedgeHighlights) {
    container.add(scene.add.circle(x, y, 3, 0x6f984e));
  }
}

function renderBeehives({
  scene,
  container,
}: TerritoryUpgradeRendererContext): void {
  const firstHive = createBeehive(scene, -25, 23);
  const secondHive = createBeehive(scene, -8, 27);
  container.add([firstHive, secondHive]);
}

function createBeehive(
  scene: Phaser.Scene,
  x: number,
  y: number,
): Phaser.GameObjects.Container {
  const hive = scene.add.container(x, y);
  const body = scene.add.rectangle(0, 0, 13, 11, 0xe2b84f);
  const roof = scene.add.rectangle(0, -7, 16, 4, 0x8a5934);
  const entrance = scene.add.circle(0, 2, 2, 0x5c412d);
  const base = scene.add.rectangle(0, 8, 17, 3, 0x704a31);
  hive.add([body, roof, entrance, base]);
  return hive;
}

function renderSolarPanels({
  scene,
  container,
}: TerritoryUpgradeRendererContext): void {
  const leftPanel = createSolarPanel(scene, -12, -5);
  const rightPanel = createSolarPanel(scene, 12, -5);
  container.add([leftPanel, rightPanel]);
}

function createSolarPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
): Phaser.GameObjects.Container {
  const panel = scene.add.container(x, y);
  const surface = scene.add.rectangle(0, 0, 20, 13, 0x315a72);
  surface.setStrokeStyle(2, 0xc7d9df);

  const grid = scene.add.graphics();
  grid.lineStyle(1, 0x8fb7c6, 0.9);
  grid.beginPath();
  grid.moveTo(0, -6);
  grid.lineTo(0, 6);
  grid.moveTo(-10, 0);
  grid.lineTo(10, 0);
  grid.strokePath();

  panel.add([surface, grid]);
  panel.setAngle(-10);
  return panel;
}
