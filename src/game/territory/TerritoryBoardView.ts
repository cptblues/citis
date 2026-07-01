import Phaser from "phaser";
import { getTerritoryTileDefinition } from "../../content/territoryTileDefinitions";
import { TERRITORY_UPGRADE_DEFINITIONS } from "../../content/territoryUpgradeDefinitions";
import {
  createBoardCellId,
  getPlacedTileAt,
  type BoardCell,
  type BoardEdgeFeature,
  type BoardState,
} from "../../engine/board";
import {
  axialToPixel,
  getHexCorners,
  getHexNeighbor,
  type HexPoint,
  type HexSide,
} from "../../engine/hex";
import { canApplyTerritoryUpgrade } from "../../engine/upgrades";
import type { SelectedTileTypeId, SelectedUpgradeTypeId } from "../gameEvents";
import { createTerritoryTileContent } from "../rendering/territoryTileContent";

const BOARD_LEFT = 28;
const BOARD_RIGHT = 932;
const BOARD_TOP = 184;
const BOARD_BOTTOM = 626;
const MAX_HEX_SIZE = 62;
const TILE_CONTENT_REFERENCE_SIZE = 62;
const HEX_HORIZONTAL_RADIUS = Math.sqrt(3) / 2;

const EMPTY_FILL_COLOR = 0xffffff;
const EMPTY_STROKE_COLOR = 0x9ba79c;
const BLOCKED_FILL_COLOR = 0xc8ceca;
const BLOCKED_STROKE_COLOR = 0x7d8781;
const AVAILABLE_FILL_COLOR = 0xdcebd2;
const AVAILABLE_HOVER_COLOR = 0xc5e2b7;
const AVAILABLE_STROKE_COLOR = 0x4f8058;
const SYNERGY_PREVIEW_STROKE_COLOR = 0x765da8;
const SYNERGY_PREVIEW_STROKE_WIDTH = 6;
const UPGRADE_PREVIEW_STROKE_COLOR = 0xd08b45;
const INVALID_PLACEMENT_STROKE_COLOR = 0xb54f4f;

const RIVER_OUTER_COLOR = 0x2e7185;
const RIVER_INNER_COLOR = 0x78bfd2;
const RIVER_HIGHLIGHT_COLOR = 0xc3e7ee;
const ROAD_OUTER_COLOR = 0x76513a;
const ROAD_INNER_COLOR = 0xd8ad73;
const BRIDGE_OUTER_COLOR = 0x624b38;
const BRIDGE_INNER_COLOR = 0xead8b4;

const EDGE_CORNER_INDEXES: Readonly<
  Record<HexSide, readonly [number, number]>
> = {
  0: [1, 2],
  1: [0, 1],
  2: [5, 0],
  3: [4, 5],
  4: [3, 4],
  5: [2, 3],
};

interface TerritoryBoardLayout {
  hexSize: number;
  contentScale: number;
  offsetX: number;
  offsetY: number;
}

interface TerritoryRenderedEdge {
  origin: TerritoryCellView;
  neighbor: TerritoryCellView;
  side: HexSide;
  features: readonly BoardEdgeFeature[];
}

export interface TerritoryCellView {
  cell: BoardCell;
  graphics: Phaser.GameObjects.Graphics;
  corners: HexPoint[];
  centerX: number;
  centerY: number;
  contentScale: number;
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
  private readonly networkGraphics: Phaser.GameObjects.Graphics;
  private readonly layout: TerritoryBoardLayout;
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
    this.layout = createBoardLayout(cells);
    this.networkGraphics = this.scene.add.graphics().setDepth(6);

    this.createCells();
    this.drawNetworks();
    this.drawInitialTileContents();
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
      const relativePosition = axialToPixel(cell, this.layout.hexSize);
      const centerX = this.layout.offsetX + relativePosition.x;
      const centerY = this.layout.offsetY + relativePosition.y;
      const corners = getHexCorners(
        centerX,
        centerY,
        Math.max(4, this.layout.hexSize - 1.4),
      );

      this.createCellView(cell, corners, centerX, centerY);
    }
  }

  private createCellView(
    cell: BoardCell,
    corners: HexPoint[],
    centerX: number,
    centerY: number,
  ): void {
    const graphics = this.scene.add.graphics().setDepth(0);

    this.cellViews.set(cell.id, {
      cell,
      graphics,
      corners,
      centerX,
      centerY,
      contentScale: this.layout.contentScale,
    });

    if (cell.blocked !== true) {
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
    }

    this.redrawCell(cell.id);
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
    const isBlocked = cellView.cell.blocked === true;

    let fillColor = isBlocked ? BLOCKED_FILL_COLOR : EMPTY_FILL_COLOR;
    let fillAlpha = isBlocked ? 0.78 : 0.12;
    let strokeColor = isBlocked ? BLOCKED_STROKE_COLOR : EMPTY_STROKE_COLOR;
    let strokeWidth = isBlocked ? 2 : 1;

    if (placedTile !== undefined) {
      const definition = getTerritoryTileDefinition(placedTile.typeId);
      fillColor = definition.fillColor;
      fillAlpha = 1;
      strokeColor = definition.strokeColor;
      strokeWidth = Math.max(2, this.layout.hexSize * 0.05);
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
      state.selectedTileTypeId !== null &&
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
      placedTile === undefined && !isAvailable && !isBlocked ? 0.35 : 1,
    );
    cellView.graphics.fillPoints(cellView.corners, true);
    cellView.graphics.strokePoints(cellView.corners, true);
  }

  private drawNetworks(): void {
    const edges = this.collectRenderedEdges();

    this.networkGraphics.clear();

    for (const edge of edges) {
      if (edge.features.some((feature) => feature.kind === "major-road")) {
        this.drawRoad(edge);
      }
    }

    for (const edge of edges) {
      if (edge.features.some((feature) => feature.kind === "river")) {
        this.drawRiver(edge);
      }
    }

    for (const edge of edges) {
      if (edge.features.some((feature) => feature.bridge === true)) {
        this.drawBridge(edge);
      }
    }
  }

  private collectRenderedEdges(): TerritoryRenderedEdge[] {
    const edges: TerritoryRenderedEdge[] = [];

    for (const origin of this.cellViews.values()) {
      for (const [rawSide, features] of Object.entries(
        origin.cell.edgeFeatures ?? {},
      )) {
        if (features === undefined || features.length === 0) {
          continue;
        }

        const side = Number(rawSide) as HexSide;
        const neighborCoordinate = getHexNeighbor(origin.cell, side);
        const neighbor = this.cellViews.get(
          createBoardCellId(neighborCoordinate.q, neighborCoordinate.r),
        );

        if (neighbor === undefined || origin.cell.id > neighbor.cell.id) {
          continue;
        }

        edges.push({ origin, neighbor, side, features });
      }
    }

    return edges;
  }

  private drawRoad(edge: TerritoryRenderedEdge): void {
    const outerWidth = Math.max(4, this.layout.hexSize * 0.2);
    const innerWidth = Math.max(2, this.layout.hexSize * 0.1);

    drawLine(
      this.networkGraphics,
      edge.origin.centerX,
      edge.origin.centerY,
      edge.neighbor.centerX,
      edge.neighbor.centerY,
      outerWidth,
      ROAD_OUTER_COLOR,
      0.92,
    );
    drawLine(
      this.networkGraphics,
      edge.origin.centerX,
      edge.origin.centerY,
      edge.neighbor.centerX,
      edge.neighbor.centerY,
      innerWidth,
      ROAD_INNER_COLOR,
      1,
    );
  }

  private drawRiver(edge: TerritoryRenderedEdge): void {
    const [firstCornerIndex, secondCornerIndex] =
      EDGE_CORNER_INDEXES[edge.side];
    const firstCorner = edge.origin.corners[firstCornerIndex];
    const secondCorner = edge.origin.corners[secondCornerIndex];

    if (firstCorner === undefined || secondCorner === undefined) {
      return;
    }

    const outerWidth = Math.max(6, this.layout.hexSize * 0.28);
    const innerWidth = Math.max(4, this.layout.hexSize * 0.19);
    const highlightWidth = Math.max(1, this.layout.hexSize * 0.045);

    drawLine(
      this.networkGraphics,
      firstCorner.x,
      firstCorner.y,
      secondCorner.x,
      secondCorner.y,
      outerWidth,
      RIVER_OUTER_COLOR,
      1,
    );
    drawLine(
      this.networkGraphics,
      firstCorner.x,
      firstCorner.y,
      secondCorner.x,
      secondCorner.y,
      innerWidth,
      RIVER_INNER_COLOR,
      1,
    );
    drawLine(
      this.networkGraphics,
      firstCorner.x,
      firstCorner.y,
      secondCorner.x,
      secondCorner.y,
      highlightWidth,
      RIVER_HIGHLIGHT_COLOR,
      0.9,
    );
  }

  private drawBridge(edge: TerritoryRenderedEdge): void {
    const deltaX = edge.neighbor.centerX - edge.origin.centerX;
    const deltaY = edge.neighbor.centerY - edge.origin.centerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance === 0) {
      return;
    }

    const directionX = deltaX / distance;
    const directionY = deltaY / distance;
    const midpointX = (edge.origin.centerX + edge.neighbor.centerX) / 2;
    const midpointY = (edge.origin.centerY + edge.neighbor.centerY) / 2;
    const halfLength = this.layout.hexSize * 0.38;
    const startX = midpointX - directionX * halfLength;
    const startY = midpointY - directionY * halfLength;
    const endX = midpointX + directionX * halfLength;
    const endY = midpointY + directionY * halfLength;

    drawLine(
      this.networkGraphics,
      startX,
      startY,
      endX,
      endY,
      Math.max(6, this.layout.hexSize * 0.28),
      BRIDGE_OUTER_COLOR,
      1,
    );
    drawLine(
      this.networkGraphics,
      startX,
      startY,
      endX,
      endY,
      Math.max(3, this.layout.hexSize * 0.15),
      BRIDGE_INNER_COLOR,
      1,
    );
  }

  private drawInitialTileContents(): void {
    const { boardState } = this.getVisualState();

    for (const tile of boardState.placedTiles) {
      const cellId = createBoardCellId(tile.q, tile.r);
      const cellView = this.cellViews.get(cellId);

      if (cellView === undefined) {
        continue;
      }

      createTerritoryTileContent(
        this.scene,
        tile,
        cellView.centerX,
        cellView.centerY,
      ).setScale(cellView.contentScale);
    }
  }
}

function createBoardLayout(cells: readonly BoardCell[]): TerritoryBoardLayout {
  if (cells.length === 0) {
    return {
      hexSize: MAX_HEX_SIZE,
      contentScale: 1,
      offsetX: (BOARD_LEFT + BOARD_RIGHT) / 2,
      offsetY: (BOARD_TOP + BOARD_BOTTOM) / 2,
    };
  }

  const unitCenters = cells.map((cell) => axialToPixel(cell, 1));
  const minimumX =
    Math.min(...unitCenters.map((position) => position.x)) -
    HEX_HORIZONTAL_RADIUS;
  const maximumX =
    Math.max(...unitCenters.map((position) => position.x)) +
    HEX_HORIZONTAL_RADIUS;
  const minimumY = Math.min(...unitCenters.map((position) => position.y)) - 1;
  const maximumY = Math.max(...unitCenters.map((position) => position.y)) + 1;
  const boardWidthInUnits = maximumX - minimumX;
  const boardHeightInUnits = maximumY - minimumY;
  const availableWidth = BOARD_RIGHT - BOARD_LEFT;
  const availableHeight = BOARD_BOTTOM - BOARD_TOP;
  const fittedHexSize = Math.min(
    availableWidth / boardWidthInUnits,
    availableHeight / boardHeightInUnits,
  );
  const hexSize = Math.min(MAX_HEX_SIZE, fittedHexSize);
  const renderedWidth = boardWidthInUnits * hexSize;
  const renderedHeight = boardHeightInUnits * hexSize;
  const offsetX =
    BOARD_LEFT + (availableWidth - renderedWidth) / 2 - minimumX * hexSize;
  const offsetY =
    BOARD_TOP + (availableHeight - renderedHeight) / 2 - minimumY * hexSize;

  return {
    hexSize,
    contentScale: hexSize / TILE_CONTENT_REFERENCE_SIZE,
    offsetX,
    offsetY,
  };
}

function drawLine(
  graphics: Phaser.GameObjects.Graphics,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  width: number,
  color: number,
  alpha: number,
): void {
  graphics.lineStyle(width, color, alpha);
  graphics.beginPath();
  graphics.moveTo(startX, startY);
  graphics.lineTo(endX, endY);
  graphics.strokePath();
}
