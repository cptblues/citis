import Phaser from "phaser";
import type { PrototypeUpgradeTypeId } from "../../content/territoryUpgradeDefinitions";
import type { PlacedTerritoryTile } from "../../engine/board";
import { createTerritoryTileContent } from "../rendering/territoryTileContent";
import { createTerritoryUpgradeContent } from "../rendering/territoryUpgradeContent";
import type { TerritoryCellView } from "./TerritoryBoardView";

export class TerritoryContentView {
  private readonly scene: Phaser.Scene;
  private readonly placedTileContentViews = new Map<
    string,
    Phaser.GameObjects.Container
  >();
  private readonly placedUpgradeViews = new Map<
    string,
    Phaser.GameObjects.Container
  >();

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public drawPlacedTile(
    tile: PlacedTerritoryTile,
    cellView: TerritoryCellView,
  ): void {
    if (this.placedTileContentViews.has(tile.id)) {
      return;
    }

    const container = createTerritoryTileContent(
      this.scene,
      tile,
      cellView.centerX,
      cellView.centerY,
    ).setScale(cellView.contentScale);

    this.placedTileContentViews.set(tile.id, container);
  }

  public drawUpgrade(
    tileId: string,
    upgradeTypeId: PrototypeUpgradeTypeId,
    cellView: TerritoryCellView,
  ): void {
    const viewKey = `${tileId}:${upgradeTypeId}`;

    if (this.placedUpgradeViews.has(viewKey)) {
      return;
    }

    const upgradeView = createTerritoryUpgradeContent(
      this.scene,
      upgradeTypeId,
      cellView.centerX,
      cellView.centerY,
    ).setScale(cellView.contentScale);

    this.placedUpgradeViews.set(viewKey, upgradeView);
  }
}
