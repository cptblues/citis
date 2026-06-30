import Phaser from "phaser";

import { prototypeBoardCells } from "../../content/prototypeBoard";
import { TERRITORY_CONNECTION_DEFINITIONS } from "../../content/territoryConnectionDefinitions";
import { TERRITORY_SYNERGY_DEFINITIONS } from "../../content/territorySynergyDefinitions";
import {
  getTerritoryTileDefinition,
  TERRITORY_TILE_DEFINITIONS,
} from "../../content/territoryTileDefinitions";
import { TERRITORY_UPGRADE_DEFINITIONS } from "../../content/territoryUpgradeDefinitions";
import {
  createInitialBoardState,
  getAvailablePlacementCells,
  getPlacedTileAt,
  placeTerritoryTile,
  type BoardCell,
  type BoardState,
} from "../../engine/board";
import type { HexRotation } from "../../engine/hex";
import { previewTerritoryTilePlacement } from "../../engine/placementPreview";
import {
  calculateTerritoryResourceDelta,
  calculateTerritoryResources,
} from "../../engine/resources";
import {
  applyTerritoryUpgrade,
  canApplyTerritoryUpgrade,
} from "../../engine/upgrades";
import {
  SET_IMPROVEMENT_ENABLED_EVENT,
  SET_PLACEMENT_ENABLED_EVENT,
  SET_SELECTED_TILE_ROTATION_EVENT,
  SET_SELECTED_TILE_TYPE_EVENT,
  SET_SELECTED_UPGRADE_TYPE_EVENT,
  TERRITORY_TILE_PLACED_EVENT,
  TERRITORY_UPGRADE_APPLIED_EVENT,
  type SelectedTileTypeId,
  type SelectedUpgradeTypeId,
} from "../gameEvents";
import {
  formatPlacementPreview,
  showResourceDeltaFeedback,
  showSynergyFeedback,
} from "../rendering/territoryFeedback";
import {
  TerritoryBoardView,
  type TerritoryBoardVisualState,
} from "../territory/TerritoryBoardView";
import { TerritoryContentView } from "../territory/TerritoryContentView";
import { TerritoryPlacementPreviewView } from "../territory/TerritoryPlacementPreviewView";

/**
 * Scène active du prototype.
 *
 * La scène orchestre désormais le moteur, les événements React et les vues Phaser.
 * Le dessin du plateau, les contenus de tuiles et la prévisualisation sont délégués
 * aux classes du dossier game/territory.
 */
export class TerritoryPrototypeScene extends Phaser.Scene {
  private boardState: BoardState = createInitialBoardState();
  private availableCellIds = new Set<string>();
  private selectedTileTypeId: SelectedTileTypeId = null;
  private selectedUpgradeTypeId: SelectedUpgradeTypeId = null;
  private selectedTileRotation: HexRotation = 0;
  private placementEnabled = true;
  private improvementEnabled = false;

  private statusText!: Phaser.GameObjects.Text;
  private resourcesText!: Phaser.GameObjects.Text;
  private boardView!: TerritoryBoardView;
  private contentView!: TerritoryContentView;
  private placementPreviewView!: TerritoryPlacementPreviewView;

  public constructor() {
    super({
      key: "TerritoryPrototypeScene",
    });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#dfe8dd");

    this.add.text(32, 28, "Rivière orientable", {
      color: "#18351f",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "28px",
      fontStyle: "bold",
    });

    this.add.text(
      32,
      70,
      "Tourne les segments pour prolonger un cours d’eau continu.",
      {
        color: "#4f5e51",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "18px",
      },
    );

    this.statusText = this.add
      .text(928, 32, "6 emplacements disponibles", {
        color: "#31583a",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
      })
      .setOrigin(1, 0);

    this.resourcesText = this.add
      .text(32, 108, "", {
        color: "#31583a",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
      })
      .setDepth(100);

    this.refreshAvailableCells();

    this.placementPreviewView = new TerritoryPlacementPreviewView(this);
    this.contentView = new TerritoryContentView(this);
    this.boardView = new TerritoryBoardView(
      this,
      prototypeBoardCells,
      () => this.getBoardVisualState(),
      {
        onCellPointerOver: (cell) => this.handleCellPointerOver(cell),
        onCellPointerOut: () => this.clearPlacementPreview(),
        onCellPointerDown: (cell) => this.handleCellPointerDown(cell),
      },
    );

    this.refreshResources();
    this.registerGameEvents();
  }

  private registerGameEvents(): void {
    this.game.events.on(
      SET_SELECTED_TILE_TYPE_EVENT,
      this.handleSelectedTileTypeChanged,
      this,
    );
    this.game.events.on(
      SET_PLACEMENT_ENABLED_EVENT,
      this.handlePlacementEnabledChanged,
      this,
    );
    this.game.events.on(
      SET_SELECTED_UPGRADE_TYPE_EVENT,
      this.handleSelectedUpgradeTypeChanged,
      this,
    );
    this.game.events.on(
      SET_IMPROVEMENT_ENABLED_EVENT,
      this.handleImprovementEnabledChanged,
      this,
    );
    this.game.events.on(
      SET_SELECTED_TILE_ROTATION_EVENT,
      this.handleSelectedTileRotationChanged,
      this,
    );

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.handleSceneShutdown,
      this,
    );
  }

  private getBoardVisualState(): TerritoryBoardVisualState {
    return {
      boardState: this.boardState,
      availableCellIds: this.availableCellIds,
      placementEnabled: this.placementEnabled,
      selectedTileTypeId: this.selectedTileTypeId,
      improvementEnabled: this.improvementEnabled,
      selectedUpgradeTypeId: this.selectedUpgradeTypeId,
      previewSynergyCellIds:
        this.placementPreviewView.getPreviewSynergyCellIds(),
      placementPreviewValid:
        this.placementPreviewView.getPlacementPreviewValid(),
    };
  }

  private refreshAvailableCells(): void {
    this.availableCellIds = new Set(
      getAvailablePlacementCells(prototypeBoardCells, this.boardState).map(
        (cell) => cell.id,
      ),
    );
  }

  private handleCellPointerOver(cell: BoardCell): void {
    if (this.selectedUpgradeTypeId !== null) {
      this.refreshUpgradePreview(cell);
      return;
    }

    this.refreshPlacementPreview(cell);
  }

  private handleCellPointerDown(cell: BoardCell): void {
    if (this.selectedUpgradeTypeId !== null) {
      this.tryApplySelectedUpgrade(cell);
      return;
    }

    this.tryPlaceSelectedTile(cell);
  }

  private tryPlaceSelectedTile(cell: BoardCell): void {
    if (!this.availableCellIds.has(cell.id)) {
      return;
    }

    if (!this.placementEnabled) {
      this.statusText.setText("Termine le tour avant de poser une autre tuile");
      return;
    }

    if (this.selectedTileTypeId === null) {
      this.statusText.setText("Choisis d’abord une proposition");
      return;
    }

    const previousTileCount = this.boardState.placedTiles.length;
    const selectedTileTypeId = this.selectedTileTypeId;
    const selectedTileRotation = this.selectedTileRotation;
    const placementPreview = previewTerritoryTilePlacement(
      prototypeBoardCells,
      this.boardState,
      cell.id,
      selectedTileTypeId,
      TERRITORY_TILE_DEFINITIONS,
      TERRITORY_SYNERGY_DEFINITIONS,
      TERRITORY_UPGRADE_DEFINITIONS,
      selectedTileRotation,
      TERRITORY_CONNECTION_DEFINITIONS,
    );

    if (!placementPreview.valid) {
      return;
    }

    this.boardState = placeTerritoryTile(
      prototypeBoardCells,
      this.boardState,
      cell.id,
      selectedTileTypeId,
      selectedTileRotation,
      TERRITORY_CONNECTION_DEFINITIONS,
    );
    this.selectedTileRotation = 0;

    if (this.boardState.placedTiles.length === previousTileCount) {
      return;
    }

    const placedTile = getPlacedTileAt(this.boardState, cell);
    if (placedTile === undefined) {
      return;
    }

    const cellView = this.boardView.getCellView(cell.id);
    if (cellView !== undefined) {
      this.contentView.drawPlacedTile(placedTile, cellView);
      showResourceDeltaFeedback(
        this,
        cellView.centerX,
        cellView.centerY,
        placementPreview.resourceDelta,
      );

      showSynergyFeedback(
        this,
        cellView.centerX,
        cellView.centerY,
        placementPreview.createdSynergies.map((synergy) => synergy.label),
        this.boardView.getGraphicsForCellIds(placementPreview.affectedCellIds),
      );
    }

    this.clearPlacementPreview();
    this.placementEnabled = false;
    this.selectedTileTypeId = null;
    this.refreshAvailableCells();
    this.refreshResources();

    this.game.events.emit(TERRITORY_TILE_PLACED_EVENT, {
      cellId: cell.id,
      tileTypeId: selectedTileTypeId,
      rotation: selectedTileRotation,
    });

    const definition = getTerritoryTileDefinition(placedTile.typeId);
    const synergySummary = placementPreview.createdSynergies
      .map((synergy) => synergy.label)
      .join(", ");

    this.statusText.setText(
      synergySummary.length > 0
        ? `${definition.label} posée · ${synergySummary} ! · améliore une tuile ou termine le tour`
        : `${definition.label} posée · améliore une tuile ou termine le tour`,
    );
  }

  private refreshPlacementPreview(cell: BoardCell): void {
    this.clearPlacementPreview();

    if (
      !this.placementEnabled ||
      this.selectedTileTypeId === null ||
      !this.availableCellIds.has(cell.id)
    ) {
      return;
    }

    const preview = previewTerritoryTilePlacement(
      prototypeBoardCells,
      this.boardState,
      cell.id,
      this.selectedTileTypeId,
      TERRITORY_TILE_DEFINITIONS,
      TERRITORY_SYNERGY_DEFINITIONS,
      TERRITORY_UPGRADE_DEFINITIONS,
      this.selectedTileRotation,
      TERRITORY_CONNECTION_DEFINITIONS,
    );
    const cellView = this.boardView.getCellView(cell.id);

    if (cellView === undefined) {
      return;
    }

    const message = preview.valid
      ? formatPlacementPreview(preview)
      : this.selectedTileTypeId === "river"
        ? "Connexion invalide · tourne la Rivière pour prolonger le cours d’eau."
        : "Placement impossible.";

    this.placementPreviewView.showPlacement({
      cellView,
      tileTypeId: this.selectedTileTypeId,
      rotation: this.selectedTileRotation,
      valid: preview.valid,
      affectedCellIds: preview.valid ? preview.affectedCellIds : [],
      message,
    });
  }

  private clearPlacementPreview(): void {
    this.placementPreviewView.clear();
  }

  private handleSelectedTileTypeChanged(tileTypeId: SelectedTileTypeId): void {
    this.selectedTileTypeId = tileTypeId;
    this.clearPlacementPreview();

    if (!this.placementEnabled) {
      this.selectedTileTypeId = null;
      return;
    }

    if (tileTypeId === null) {
      this.statusText.setText(
        `${this.availableCellIds.size} emplacements disponibles`,
      );
    } else {
      const definition = getTerritoryTileDefinition(tileTypeId);
      this.statusText.setText(`${definition.label} sélectionnée`);
    }

    this.boardView.redrawAll();
  }

  private handlePlacementEnabledChanged(placementEnabled: boolean): void {
    this.placementEnabled = placementEnabled;
    this.clearPlacementPreview();

    if (placementEnabled) {
      this.statusText.setText(
        `Nouveau tour · ${this.availableCellIds.size} emplacements disponibles`,
      );
    } else {
      this.selectedTileTypeId = null;
      this.statusText.setText(
        "Tuile posée · améliore une tuile ou termine le tour",
      );
    }

    this.boardView.redrawAll();
  }

  private handleSelectedUpgradeTypeChanged(
    upgradeTypeId: SelectedUpgradeTypeId,
  ): void {
    if (!this.improvementEnabled) {
      this.selectedUpgradeTypeId = null;
      return;
    }

    this.selectedUpgradeTypeId = upgradeTypeId;
    this.selectedTileTypeId = null;
    this.clearPlacementPreview();
    this.boardView.redrawAll();

    if (upgradeTypeId !== null) {
      this.statusText.setText("Sélectionne une Forêt à améliorer");
    }
  }

  private handleImprovementEnabledChanged(improvementEnabled: boolean): void {
    this.improvementEnabled = improvementEnabled;

    if (!improvementEnabled) {
      this.selectedUpgradeTypeId = null;
    }

    this.clearPlacementPreview();
    this.boardView.redrawAll();
  }

  private refreshUpgradePreview(cell: BoardCell): void {
    const upgradeTypeId = this.selectedUpgradeTypeId;
    if (upgradeTypeId === null || !this.improvementEnabled) {
      return;
    }

    const tile = getPlacedTileAt(this.boardState, cell);
    const definition = TERRITORY_UPGRADE_DEFINITIONS[upgradeTypeId];

    if (
      tile === undefined ||
      !canApplyTerritoryUpgrade(
        this.boardState,
        tile.id,
        upgradeTypeId,
        TERRITORY_UPGRADE_DEFINITIONS,
      )
    ) {
      this.placementPreviewView.setMessage(
        `${definition.label} : nécessite une Forêt disponible`,
      );
      return;
    }

    this.placementPreviewView.setMessage(`${definition.label} : +2 Bonheur`);
  }

  private tryApplySelectedUpgrade(cell: BoardCell): void {
    const upgradeTypeId = this.selectedUpgradeTypeId;
    if (upgradeTypeId === null || !this.improvementEnabled) {
      return;
    }

    const tile = getPlacedTileAt(this.boardState, cell);
    if (tile === undefined) {
      return;
    }

    const previousResources = calculateTerritoryResources(
      this.boardState,
      TERRITORY_TILE_DEFINITIONS,
      TERRITORY_SYNERGY_DEFINITIONS,
      TERRITORY_UPGRADE_DEFINITIONS,
    );
    const nextState = applyTerritoryUpgrade(
      this.boardState,
      tile.id,
      upgradeTypeId,
      TERRITORY_UPGRADE_DEFINITIONS,
    );

    if (nextState === this.boardState) {
      this.statusText.setText(
        "Cette amélioration ne peut pas être installée ici",
      );
      return;
    }

    this.boardState = nextState;

    const nextResources = calculateTerritoryResources(
      this.boardState,
      TERRITORY_TILE_DEFINITIONS,
      TERRITORY_SYNERGY_DEFINITIONS,
      TERRITORY_UPGRADE_DEFINITIONS,
    );
    const delta = calculateTerritoryResourceDelta(
      previousResources,
      nextResources,
    );
    const cellView = this.boardView.getCellView(cell.id);

    if (cellView !== undefined) {
      this.contentView.drawUpgrade(tile.id, upgradeTypeId, cellView);
      showResourceDeltaFeedback(
        this,
        cellView.centerX,
        cellView.centerY,
        delta,
      );
    }

    this.improvementEnabled = false;
    this.selectedUpgradeTypeId = null;
    this.refreshResources();
    this.boardView.redrawAll();

    const definition = TERRITORY_UPGRADE_DEFINITIONS[upgradeTypeId];
    this.statusText.setText(`${definition.label} installé · termine le tour`);
    this.placementPreviewView.setMessage(
      `${definition.label} améliore désormais cette Forêt.`,
    );

    this.game.events.emit(TERRITORY_UPGRADE_APPLIED_EVENT, {
      tileId: tile.id,
      upgradeTypeId,
    });
  }

  private handleSelectedTileRotationChanged(rotation: HexRotation): void {
    this.selectedTileRotation = rotation;

    const hoveredCell = this.boardView.getHoveredCell();
    if (hoveredCell === null) {
      this.clearPlacementPreview();
    } else {
      this.refreshPlacementPreview(hoveredCell);
    }

    this.boardView.redrawAll();
  }

  private refreshResources(): void {
    const resources = calculateTerritoryResources(
      this.boardState,
      TERRITORY_TILE_DEFINITIONS,
      TERRITORY_SYNERGY_DEFINITIONS,
      TERRITORY_UPGRADE_DEFINITIONS,
    );

    this.resourcesText.setText(
      [
        `Nourriture : ${resources.food}`,
        `Énergie : ${resources.energy}`,
        `Nature : ${resources.nature}`,
        `Bonheur : ${resources.happiness}`,
      ].join(" · "),
    );
  }

  private handleSceneShutdown(): void {
    this.game.events.off(
      SET_SELECTED_TILE_TYPE_EVENT,
      this.handleSelectedTileTypeChanged,
      this,
    );
    this.game.events.off(
      SET_PLACEMENT_ENABLED_EVENT,
      this.handlePlacementEnabledChanged,
      this,
    );
    this.game.events.off(
      SET_SELECTED_UPGRADE_TYPE_EVENT,
      this.handleSelectedUpgradeTypeChanged,
      this,
    );
    this.game.events.off(
      SET_IMPROVEMENT_ENABLED_EVENT,
      this.handleImprovementEnabledChanged,
      this,
    );
    this.game.events.off(
      SET_SELECTED_TILE_ROTATION_EVENT,
      this.handleSelectedTileRotationChanged,
      this,
    );
  }
}
