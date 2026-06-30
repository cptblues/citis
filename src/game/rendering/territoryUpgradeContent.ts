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
