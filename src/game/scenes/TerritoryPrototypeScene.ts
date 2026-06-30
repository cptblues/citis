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
import { axialToPixel, getHexCorners, type HexPoint } from "../../engine/hex";
import {
  getTerritoryTileDefinition,
  TERRITORY_TILE_DEFINITIONS,
} from "../../content/territoryTileDefinitions";
import {
  SET_SELECTED_TILE_TYPE_EVENT,
  type SelectedTileTypeId,
  SET_PLACEMENT_ENABLED_EVENT,
  TERRITORY_TILE_PLACED_EVENT,
} from "../gameEvents";

import { calculateTerritoryResources } from "../../engine/resources";

import { TERRITORY_SYNERGY_DEFINITIONS } from "../../content/territorySynergyDefinitions";

import { previewTerritoryTilePlacement } from "../../engine/placementPreview";

import {
  createTerritoryTileContent,
  createTownContent,
} from "../rendering/territoryTileContent";

import {
  formatPlacementPreview,
  showResourceDeltaFeedback,
  showSynergyFeedback,
} from "../rendering/territoryFeedback";

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

    this.add.text(32, 28, "Premières synergies", {
      color: "#18351f",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "28px",
      fontStyle: "bold",
    });

    this.add.text(
      32,
      70,
      "Survole un emplacement pour prévisualiser les bonus de voisinage.",
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
      this.refreshPlacementPreview(cell);
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
        this.statusText.setText("Choisis d’abord Prairie ou Forêt");

        return;
      }

      const previousTileCount = this.boardState.placedTiles.length;

      const selectedTileTypeId = this.selectedTileTypeId;

      const placementPreview = previewTerritoryTilePlacement(
        prototypeBoardCells,
        this.boardState,
        cell.id,
        selectedTileTypeId,
        TERRITORY_TILE_DEFINITIONS,
        TERRITORY_SYNERGY_DEFINITIONS,
      );

      if (!placementPreview.valid) {
        return;
      }

      this.boardState = placeTerritoryTile(
        prototypeBoardCells,
        this.boardState,
        cell.id,
        selectedTileTypeId,
      );

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
      });

      this.refreshAvailableCells();
      this.redrawAllCells();

      const definition = getTerritoryTileDefinition(placedTile.typeId);

      const synergySummary = placementPreview.createdSynergies
        .map((synergy) => synergy.label)
        .join(", ");

      this.statusText.setText(
        synergySummary.length > 0
          ? `${definition.label} posée · ${synergySummary} ! · termine le tour`
          : `${definition.label} posée · termine le tour`,
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

      this.statusText.setText("Tuile posée · termine le tour");
    }

    this.redrawAllCells();
  }

  private refreshResources(): void {
    const resources = calculateTerritoryResources(
      this.boardState,
      TERRITORY_TILE_DEFINITIONS,
      TERRITORY_SYNERGY_DEFINITIONS,
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
    );

    if (!preview.valid) {
      return;
    }

    this.previewSynergyCellIds = new Set(preview.affectedCellIds);

    this.placementPreviewText.setText(formatPlacementPreview(preview));
  }
}
