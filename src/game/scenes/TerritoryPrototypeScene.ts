import Phaser from "phaser";

import { prototypeBoardCells } from "../../content/prototypeBoard";
import {
  createInitialBoardState,
  getAvailablePlacementCells,
  getPlacedTileAt,
  type BoardCell,
  type BoardState,
  placeTerritoryTile,
  type PlacedTerritoryTile,
} from "../../engine/board";
import {
  axialToPixel,
  getHexCorners,
  type HexPoint,
  type HexRotation,
} from "../../engine/hex";
import {
  getTerritoryTileDefinition,
  TERRITORY_TILE_DEFINITIONS,
} from "../../content/territoryTileDefinitions";
import {
  SET_SELECTED_TILE_TYPE_EVENT,
  type SelectedTileTypeId,
  SET_PLACEMENT_ENABLED_EVENT,
  TERRITORY_TILE_PLACED_EVENT,
  SET_IMPROVEMENT_ENABLED_EVENT,
  SET_SELECTED_UPGRADE_TYPE_EVENT,
  TERRITORY_UPGRADE_APPLIED_EVENT,
  type SelectedUpgradeTypeId,
  SET_SELECTED_TILE_ROTATION_EVENT,
} from "../gameEvents";

import {
  calculateTerritoryResources,
  calculateTerritoryResourceDelta,
} from "../../engine/resources";

import { TERRITORY_SYNERGY_DEFINITIONS } from "../../content/territorySynergyDefinitions";

import { previewTerritoryTilePlacement } from "../../engine/placementPreview";

import {
  createTerritoryTileContent,
  createTownContent,
  createTerritoryTilePreviewContent,
} from "../rendering/territoryTileContent";

import {
  formatPlacementPreview,
  showResourceDeltaFeedback,
  showSynergyFeedback,
} from "../rendering/territoryFeedback";

import { TERRITORY_UPGRADE_DEFINITIONS } from "../../content/territoryUpgradeDefinitions";

import {
  applyTerritoryUpgrade,
  canApplyTerritoryUpgrade,
} from "../../engine/upgrades";

import { createTerritoryUpgradeContent } from "../rendering/territoryUpgradeContent";

import { TERRITORY_CONNECTION_DEFINITIONS } from "../../content/territoryConnectionDefinitions";

const MAP_CENTER_X = 480;
const MAP_CENTER_Y = 350;
const HEX_SIZE = 62;

const EMPTY_FILL_COLOR = 0xffffff;
const EMPTY_STROKE_COLOR = 0x9ba79c;

const AVAILABLE_FILL_COLOR = 0xdcebd2;
const AVAILABLE_HOVER_COLOR = 0xc5e2b7;
const AVAILABLE_STROKE_COLOR = 0x4f8058;

const SYNERGY_PREVIEW_STROKE_COLOR = 0x765da8;
const SYNERGY_PREVIEW_STROKE_WIDTH = 6;

// const TOWN_FILL_COLOR = 0xf2d492;
// const TOWN_STROKE_COLOR = 0x18351f;

interface CellView {
  cell: BoardCell;
  graphics: Phaser.GameObjects.Graphics;
  corners: HexPoint[];
  centerX: number;
  centerY: number;
}

/**
 * Scène active du prototype: placement de tuiles de territoire tour par tour.
 */
export class TerritoryPrototypeScene extends Phaser.Scene {
  private boardState: BoardState = createInitialBoardState();

  private hoveredCellId: string | null = null;

  private availableCellIds = new Set<string>();

  private statusText!: Phaser.GameObjects.Text;

  private readonly cellViews = new Map<string, CellView>();

  private selectedTileTypeId: SelectedTileTypeId = null;

  private readonly placedTileContentViews = new Map<
    string,
    Phaser.GameObjects.Container
  >();

  private placementEnabled = true;

  private resourcesText!: Phaser.GameObjects.Text;

  private placementPreviewText!: Phaser.GameObjects.Text;

  private previewSynergyCellIds = new Set<string>();

  private selectedUpgradeTypeId: SelectedUpgradeTypeId = null;

  private improvementEnabled = false;

  private readonly placedUpgradeViews = new Map<
    string,
    Phaser.GameObjects.Container
  >();

  private selectedTileRotation: HexRotation = 0;

  private placementGhostView: Phaser.GameObjects.Container | null = null;

  private placementPreviewValid: boolean | null = null;

  /**
   * Déclare la clé de scène utilisée par la configuration Phaser.
   */
  public constructor() {
    super({
      key: "TerritoryPrototypeScene",
    });
  }

  /**
   * Prépare l'interface Phaser, les ponts d'événements React et le plateau.
   */
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

    this.placementPreviewText = this.add
      .text(32, 138, "Sélectionne une proposition et survole un emplacement.", {
        color: "#645483",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        lineSpacing: 5,
      })
      .setDepth(100);

    this.refreshResources();

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

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.handleSceneShutdown,
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

    this.drawBoard();
  }

  /**
   * Recalcule les cases libres adjacentes au territoire déjà posé.
   */
  private refreshAvailableCells(): void {
    this.availableCellIds = new Set(
      getAvailablePlacementCells(prototypeBoardCells, this.boardState).map(
        (cell) => cell.id,
      ),
    );
  }

  /**
   * Instancie les vues de chaque case du plateau puis dessine le bourg.
   */
  private drawBoard(): void {
    this.refreshAvailableCells();

    for (const cell of prototypeBoardCells) {
      const relativePosition = axialToPixel(cell, HEX_SIZE);

      const centerX = MAP_CENTER_X + relativePosition.x;

      const centerY = MAP_CENTER_Y + relativePosition.y;

      const corners = getHexCorners(centerX, centerY, HEX_SIZE - 2);

      this.createCellView(cell, corners, centerX, centerY);
    }

    this.drawTown();
  }

  /**
   * Crée l'objet graphique interactif d'une case et ses réactions souris.
   */
  private createCellView(
    cell: BoardCell,
    corners: HexPoint[],
    centerX: number,
    centerY: number,
  ): void {
    const graphics = this.add.graphics();

    this.cellViews.set(cell.id, {
      cell,
      graphics,
      corners,
      centerX,
      centerY,
    });

    graphics.setInteractive(
      new Phaser.Geom.Polygon(corners),
      Phaser.Geom.Polygon.Contains,
    );

    graphics.on("pointerover", () => {
      this.hoveredCellId = cell.id;
      if (this.selectedUpgradeTypeId !== null) {
        this.refreshUpgradePreview(cell);
      } else {
        this.refreshPlacementPreview(cell);
      }
      this.redrawAllCells();
    });

    graphics.on("pointerout", () => {
      if (this.hoveredCellId === cell.id) {
        this.hoveredCellId = null;
      }
      this.clearPlacementPreview();
      this.redrawAllCells();
    });

    graphics.on("pointerdown", () => {
      if (this.selectedUpgradeTypeId !== null) {
        this.tryApplySelectedUpgrade(cell);
        return;
      }

      if (!this.availableCellIds.has(cell.id)) {
        return;
      }

      if (!this.placementEnabled) {
        this.statusText.setText(
          "Termine le tour avant de poser une autre tuile",
        );

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

      const resourceDelta = placementPreview.resourceDelta;

      if (this.boardState.placedTiles.length === previousTileCount) {
        return;
      }

      const placedTile = getPlacedTileAt(this.boardState, cell);

      if (placedTile === undefined) {
        return;
      }

      this.drawPlacedTileContent(placedTile);

      this.refreshResources();

      const placementCellView = this.cellViews.get(cell.id);

      if (placementCellView !== undefined) {
        showResourceDeltaFeedback(
          this,
          placementCellView.centerX,
          placementCellView.centerY,
          resourceDelta,
        );
      }

      if (placementCellView !== undefined) {
        const affectedGraphics = placementPreview.affectedCellIds
          .map((affectedCellId) => this.cellViews.get(affectedCellId)?.graphics)
          .filter(
            (graphics): graphics is Phaser.GameObjects.Graphics =>
              graphics !== undefined,
          );

        showSynergyFeedback(
          this,
          placementCellView.centerX,
          placementCellView.centerY,
          placementPreview.createdSynergies.map((synergy) => synergy.label),
          affectedGraphics,
        );
      }

      this.clearPlacementPreview();

      this.placementEnabled = false;
      this.selectedTileTypeId = null;

      this.game.events.emit(TERRITORY_TILE_PLACED_EVENT, {
        cellId: cell.id,
        tileTypeId: selectedTileTypeId,
        rotation: selectedTileRotation,
      });

      this.refreshAvailableCells();
      this.redrawAllCells();

      const definition = getTerritoryTileDefinition(placedTile.typeId);

      const synergySummary = placementPreview.createdSynergies
        .map((synergy) => synergy.label)
        .join(", ");

      this.statusText.setText(
        synergySummary.length > 0
          ? `${definition.label} posée · ${synergySummary} ! · améliore une tuile ou termine le tour`
          : `${definition.label} posée · améliore une tuile ou termine le tour`,
      );
    });

    this.redrawCell(cell.id);

    this.add
      .text(centerX, centerY + 38, `q${cell.q} r${cell.r}`, {
        color: "#526056",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "10px",
      })
      .setOrigin(0.5)
      .setDepth(20);
  }

  /**
   * Rafraîchit l'état visuel de toutes les cases connues de la scène.
   */
  private redrawAllCells(): void {
    for (const cellId of this.cellViews.keys()) {
      this.redrawCell(cellId);
    }
  }

  /**
   * Applique les couleurs d'une case selon occupation, disponibilité et survol.
   */
  private redrawCell(cellId: string): void {
    const cellView = this.cellViews.get(cellId);

    if (cellView === undefined) {
      return;
    }

    const placedTile = getPlacedTileAt(this.boardState, cellView.cell);

    const isAvailable = this.availableCellIds.has(cellId);

    const isHovered = this.hoveredCellId === cellId;

    let fillColor = EMPTY_FILL_COLOR;
    let fillAlpha = 0.12;
    let strokeColor = EMPTY_STROKE_COLOR;
    let strokeWidth = 1;

    if (placedTile !== undefined) {
      const definition = getTerritoryTileDefinition(placedTile.typeId);

      fillColor = definition.fillColor;
      fillAlpha = 1;
      strokeColor = definition.strokeColor;
      strokeWidth = 3;
    } else if (isAvailable) {
      if (this.placementEnabled && this.selectedTileTypeId !== null) {
        const selectedDefinition = getTerritoryTileDefinition(
          this.selectedTileTypeId,
        );

        fillColor = isHovered
          ? selectedDefinition.hoverColor
          : selectedDefinition.fillColor;

        fillAlpha = isHovered ? 0.7 : 0.28;
        strokeColor = selectedDefinition.strokeColor;
      } else {
        fillColor = isHovered ? AVAILABLE_HOVER_COLOR : AVAILABLE_FILL_COLOR;

        fillAlpha = 0.8;
        strokeColor = AVAILABLE_STROKE_COLOR;
      }

      strokeWidth = isHovered ? 5 : 3;
    }

    if (this.previewSynergyCellIds.has(cellId)) {
      strokeColor = SYNERGY_PREVIEW_STROKE_COLOR;

      strokeWidth = SYNERGY_PREVIEW_STROKE_WIDTH;
    }

    if (
      placedTile !== undefined &&
      this.improvementEnabled &&
      this.selectedUpgradeTypeId !== null &&
      canApplyTerritoryUpgrade(
        this.boardState,
        placedTile.id,
        this.selectedUpgradeTypeId,
        TERRITORY_UPGRADE_DEFINITIONS,
      )
    ) {
      strokeColor = 0xd08b45;
      strokeWidth = isHovered ? 7 : 5;
    }

    if (
      isHovered &&
      this.selectedTileTypeId === "river" &&
      this.placementPreviewValid === false
    ) {
      strokeColor = 0xb54f4f;
      strokeWidth = 6;
    }

    cellView.graphics.clear();

    cellView.graphics.fillStyle(fillColor, fillAlpha);

    cellView.graphics.lineStyle(
      strokeWidth,
      strokeColor,
      placedTile === undefined && !isAvailable ? 0.35 : 1,
    );

    cellView.graphics.fillPoints(cellView.corners, true);

    cellView.graphics.strokePoints(cellView.corners, true);
  }

  /**
   * Dessine le contenu décoratif fixe de la tuile de départ.
   */
  private drawTown(): void {
    const townCell = this.cellViews.get("cell:0:0");

    if (townCell === undefined) {
      return;
    }

    createTownContent(this, townCell.centerX, townCell.centerY);
  }

  /**
   * Synchronise la sélection React avec l'état interne de la scène.
   */
  private handleSelectedTileTypeChanged(tileTypeId: SelectedTileTypeId): void {
    this.selectedTileTypeId = tileTypeId;
    this.hoveredCellId = null;
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

    this.redrawAllCells();
  }

  /**
   * Nettoie les abonnements globaux lorsque Phaser arrête la scène.
   */
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

  /**
   * Ajoute le décor spécifique d'une tuile de territoire déjà validée.
   */
  private drawPlacedTileContent(tile: PlacedTerritoryTile): void {
    if (tile.typeId === "town" || this.placedTileContentViews.has(tile.id)) {
      return;
    }

    const cellView = this.cellViews.get(`cell:${tile.q}:${tile.r}`);

    if (cellView === undefined) {
      return;
    }

    const container = createTerritoryTileContent(
      this,
      tile,
      cellView.centerX,
      cellView.centerY,
    );

    if (container === null) {
      return;
    }

    this.placedTileContentViews.set(tile.id, container);
  }

  /**
   * Active ou suspend le placement selon l'état du tour contrôlé par React.
   */
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

    this.redrawAllCells();
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
      ].join("   ·   "),
    );
  }

  private clearPlacementPreview(): void {
    this.previewSynergyCellIds.clear();
    this.placementGhostView?.destroy(true);
    this.placementGhostView = null;
    this.placementPreviewValid = null;

    this.placementPreviewText.setText(
      "Sélectionne une proposition et survole un emplacement.",
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

    this.placementPreviewValid = preview.valid;

    this.showPlacementGhost(cell, preview.valid);

    if (!preview.valid) {
      this.placementPreviewText.setText(
        this.selectedTileTypeId === "river"
          ? "Connexion invalide · tourne la Rivière pour prolonger le cours d’eau."
          : "Placement impossible.",
      );

      return;
    }

    this.previewSynergyCellIds = new Set(preview.affectedCellIds);

    this.placementPreviewText.setText(formatPlacementPreview(preview));
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
    this.redrawAllCells();

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
    this.redrawAllCells();
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
      this.placementPreviewText.setText(
        `${definition.label} : nécessite une Forêt disponible`,
      );

      return;
    }

    this.placementPreviewText.setText(`${definition.label} : +2 Bonheur`);
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

    const cellView = this.cellViews.get(cell.id);

    if (cellView !== undefined) {
      const viewKey = `${tile.id}:${upgradeTypeId}`;

      const upgradeView = createTerritoryUpgradeContent(
        this,
        upgradeTypeId,
        cellView.centerX,
        cellView.centerY,
      );

      this.placedUpgradeViews.set(viewKey, upgradeView);

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
    this.redrawAllCells();

    const definition = TERRITORY_UPGRADE_DEFINITIONS[upgradeTypeId];

    this.statusText.setText(`${definition.label} installé · termine le tour`);

    this.placementPreviewText.setText(
      `${definition.label} améliore désormais cette Forêt.`,
    );

    this.game.events.emit(TERRITORY_UPGRADE_APPLIED_EVENT, {
      tileId: tile.id,
      upgradeTypeId,
    });
  }

  private handleSelectedTileRotationChanged(rotation: HexRotation): void {
    this.selectedTileRotation = rotation;

    if (this.hoveredCellId !== null) {
      const hoveredCell = this.cellViews.get(this.hoveredCellId);

      if (hoveredCell !== undefined) {
        this.refreshPlacementPreview(hoveredCell.cell);
      }
    } else {
      this.clearPlacementPreview();
    }

    this.redrawAllCells();
  }

  private showPlacementGhost(cell: BoardCell, valid: boolean): void {
    if (this.selectedTileTypeId !== "river") {
      return;
    }

    const cellView = this.cellViews.get(cell.id);

    if (cellView === undefined) {
      return;
    }

    const ghost = createTerritoryTilePreviewContent(
      this,
      "river",
      this.selectedTileRotation,
      cellView.centerX,
      cellView.centerY,
    );

    if (ghost === null) {
      return;
    }

    ghost.setAlpha(valid ? 0.65 : 0.25).setDepth(15);

    this.placementGhostView = ghost;
  }
}
