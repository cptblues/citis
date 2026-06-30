import Phaser from "phaser";

import type { HexRotation } from "../../engine/hex";
import type { SelectedTileTypeId } from "../gameEvents";
import { createTerritoryTilePreviewContent } from "../rendering/territoryTileContent";
import type { TerritoryCellView } from "./TerritoryBoardView";

const DEFAULT_PREVIEW_MESSAGE =
  "Sélectionne une proposition et survole un emplacement.";

interface ShowPlacementPreviewOptions {
  cellView: TerritoryCellView;
  tileTypeId: Exclude<SelectedTileTypeId, null>;
  rotation: HexRotation;
  valid: boolean;
  affectedCellIds: readonly string[];
  message: string;
}

export class TerritoryPlacementPreviewView {
  private readonly scene: Phaser.Scene;
  private readonly previewText: Phaser.GameObjects.Text;
  private previewSynergyCellIds = new Set<string>();
  private placementPreviewValid: boolean | null = null;
  private placementGhostView: Phaser.GameObjects.Container | null = null;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.previewText = scene.add
      .text(32, 138, DEFAULT_PREVIEW_MESSAGE, {
        color: "#645483",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        lineSpacing: 5,
      })
      .setDepth(100);
  }

  public getPreviewSynergyCellIds(): ReadonlySet<string> {
    return this.previewSynergyCellIds;
  }

  public getPlacementPreviewValid(): boolean | null {
    return this.placementPreviewValid;
  }

  public clear(): void {
    this.previewSynergyCellIds.clear();
    this.placementGhostView?.destroy(true);
    this.placementGhostView = null;
    this.placementPreviewValid = null;
    this.previewText.setText(DEFAULT_PREVIEW_MESSAGE);
  }

  public showPlacement(options: ShowPlacementPreviewOptions): void {
    this.previewSynergyCellIds = new Set(options.affectedCellIds);
    this.placementPreviewValid = options.valid;
    this.previewText.setText(options.message);

    if (options.tileTypeId !== "river") {
      return;
    }

    const ghost = createTerritoryTilePreviewContent(
      this.scene,
      options.tileTypeId,
      options.rotation,
      options.cellView.centerX,
      options.cellView.centerY,
    );

    if (ghost === null) {
      return;
    }

    ghost.setAlpha(options.valid ? 0.65 : 0.25).setDepth(15);
    this.placementGhostView = ghost;
  }

  public setMessage(message: string): void {
    this.previewText.setText(message);
  }
}
