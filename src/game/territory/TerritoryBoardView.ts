import Phaser from "phaser";

import { getTerritoryTileDefinition } from "../../content/territoryTileDefinitions";
import { TERRITORY_UPGRADE_DEFINITIONS } from "../../content/territoryUpgradeDefinitions";
import {
  getPlacedTileAt,
  type BoardCell,
  type BoardState,
} from "../../engine/board";
import { axialToPixel, getHexCorners, type HexPoint } from "../../engine/hex";
import { canApplyTerritoryUpgrade } from "../../engine/upgrades";
import type { SelectedTileTypeId, SelectedUpgradeTypeId } from "../gameEvents";
import { createTownContent } from "../rendering/territoryTileContent";

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
const UPGRADE_PREVIEW_STROKE_COLOR = 0xd08b45;
const INVALID_PLACEMENT_STROKE_COLOR = 0xb54f4f;

export interface TerritoryCellView {
  cell: BoardCell;
  graphics: Phaser.GameObjects.Graphics;
  corners: HexPoint[];
  centerX: number;
  centerY: number;
}

export interface TerritoryBoardVisualState {
  boardState: BoardState;
  availableCellIds: ReadonlySet<string>;
  placementEnabled: boolean;
  selectedTileTypeId: SelectedTileTypeId;
  improvementEnabled: boolean;
  selectedUpgradeTypeId: SelectedUpgradeTypeId;
  previewSynergyCellIds: ReadonlySet<string>;
  placementPreviewValid: boolean | null;
}

export interface TerritoryBoardCallbacks {
  onCellPointerOver: (cell: BoardCell) => void;
  onCellPointerOut: (cell: BoardCell) => void;
  onCellPointerDown: (cell: BoardCell) => void;
}

export class TerritoryBoardView {
  private readonly scene: Phaser.Scene;
  private readonly cells: readonly BoardCell[];
  private readonly getVisualState: () => TerritoryBoardVisualState;
  private readonly callbacks: TerritoryBoardCallbacks;
  private readonly cellViews = new Map<string, TerritoryCellView>();
  private hoveredCellId: string | null = null;

  public constructor(
    scene: Phaser.Scene,
    cells: readonly BoardCell[],
    getVisualState: () => TerritoryBoardVisualState,
    callbacks: TerritoryBoardCallbacks,
  ) {
    this.scene = scene;
    this.cells = cells;
    this.getVisualState = getVisualState;
    this.callbacks = callbacks;

    this.createCells();
    this.drawTown();
  }

  public redrawAll(): void {
    for (const cellId of this.cellViews.keys()) {
      this.redrawCell(cellId);
    }
  }

  public getCellView(cellId: string): TerritoryCellView | undefined {
    return this.cellViews.get(cellId);
  }

  public getHoveredCell(): BoardCell | null {
    if (this.hoveredCellId === null) {
      return null;
    }

    return this.cellViews.get(this.hoveredCellId)?.cell ?? null;
  }

  public getGraphicsForCellIds(
    cellIds: readonly string[],
  ): Phaser.GameObjects.Graphics[] {
    return cellIds
      .map((cellId) => this.cellViews.get(cellId)?.graphics)
      .filter(
        (graphics): graphics is Phaser.GameObjects.Graphics =>
          graphics !== undefined,
      );
  }

  private createCells(): void {
    for (const cell of this.cells) {
      const relativePosition = axialToPixel(cell, HEX_SIZE);
      const centerX = MAP_CENTER_X + relativePosition.x;
      const centerY = MAP_CENTER_Y + relativePosition.y;
      const corners = getHexCorners(centerX, centerY, HEX_SIZE - 2);

      this.createCellView(cell, corners, centerX, centerY);
    }
  }

  private createCellView(
    cell: BoardCell,
    corners: HexPoint[],
    centerX: number,
    centerY: number,
  ): void {
    const graphics = this.scene.add.graphics();

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
      this.callbacks.onCellPointerOver(cell);
      this.redrawAll();
    });

    graphics.on("pointerout", () => {
      if (this.hoveredCellId === cell.id) {
        this.hoveredCellId = null;
      }

      this.callbacks.onCellPointerOut(cell);
      this.redrawAll();
    });

    graphics.on("pointerdown", () => {
      this.callbacks.onCellPointerDown(cell);
      this.redrawAll();
    });

    this.redrawCell(cell.id);

    this.scene.add
      .text(centerX, centerY + 38, `q${cell.q} r${cell.r}`, {
        color: "#526056",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "10px",
      })
      .setOrigin(0.5)
      .setDepth(20);
  }

  private redrawCell(cellId: string): void {
    const cellView = this.cellViews.get(cellId);
    if (cellView === undefined) {
      return;
    }

    const state = this.getVisualState();
    const placedTile = getPlacedTileAt(state.boardState, cellView.cell);
    const isAvailable = state.availableCellIds.has(cellId);
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
      if (state.placementEnabled && state.selectedTileTypeId !== null) {
        const selectedDefinition = getTerritoryTileDefinition(
          state.selectedTileTypeId,
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

    if (state.previewSynergyCellIds.has(cellId)) {
      strokeColor = SYNERGY_PREVIEW_STROKE_COLOR;
      strokeWidth = SYNERGY_PREVIEW_STROKE_WIDTH;
    }

    if (
      placedTile !== undefined &&
      state.improvementEnabled &&
      state.selectedUpgradeTypeId !== null &&
      canApplyTerritoryUpgrade(
        state.boardState,
        placedTile.id,
        state.selectedUpgradeTypeId,
        TERRITORY_UPGRADE_DEFINITIONS,
      )
    ) {
      strokeColor = UPGRADE_PREVIEW_STROKE_COLOR;
      strokeWidth = isHovered ? 7 : 5;
    }

    if (
      isHovered &&
      state.selectedTileTypeId === "river" &&
      state.placementPreviewValid === false
    ) {
      strokeColor = INVALID_PLACEMENT_STROKE_COLOR;
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

  private drawTown(): void {
    const townCell = this.cellViews.get("cell:0:0");
    if (townCell === undefined) {
      return;
    }

    createTownContent(this.scene, townCell.centerX, townCell.centerY);
  }
}
