import Phaser from "phaser";
import {
  axialToPixel,
  getHexCorners,
  type HexPoint,
  getItemsInHexRadius,
} from "../../engine/hex";
import { prototypeTiles } from "../../content/prototypeMap";
import type { GameTile } from "../../engine/gameTile";
import { getTerrainDefinition } from "../../content/terrainDefinitions";

import {
  getStructureDefinition,
  STRUCTURE_DEFINITIONS,
} from "../../content/structureDefinitions";

import {
  applyPlaceStructure,
  canPlaceStructure,
  createInitialGameState,
  type GameState,
  type PlacedStructure,
  type StructureTypeId,
} from "../../engine/structure";

import { calculateGlobalMetrics } from "../../engine/metrics";

import { SET_BUILD_MODE_EVENT, type BuildMode } from "../gameEvents";

const MAP_CENTER_X = 480;
const MAP_CENTER_Y = 345;
const HEX_SIZE = 62;

const TILE_SELECTED_COLOR = 0xffdf7f;
const TILE_STROKE_COLOR = 0x18351f;

const INFLUENCE_RADIUS = 1;

const TILE_INFLUENCE_STROKE_COLOR = 0x765da8;
const TILE_INFLUENCE_STROKE_WIDTH = 5;
const TILE_DEFAULT_STROKE_WIDTH = 2;

const TILE_BUILD_VALID_STROKE_COLOR = 0x3f7f4f;
const TILE_BUILD_INVALID_STROKE_COLOR = 0x9b5751;
const TILE_BUILD_INVALID_ALPHA = 0.35;
const TILE_BUILD_VALID_STROKE_WIDTH = 4;
const TILE_BUILD_HOVER_STROKE_WIDTH = 6;

export class PrototypeScene extends Phaser.Scene {
  private selectedTileId: string | null = null;
  private hoveredTileId: string | null = null;

  private ghostStructureView: Phaser.GameObjects.Container | null = null;
  private influencedTileIds = new Set<string>();

  private selectedTileText!: Phaser.GameObjects.Text;

  private readonly tileViews = new Map<
    string,
    {
      tile: GameTile;
      graphics: Phaser.GameObjects.Graphics;
      corners: HexPoint[];
      centerX: number;
      centerY: number;
    }
  >();

  private gameState: GameState = createInitialGameState();

  private activeBuildMode: BuildMode = null;

  private readonly structureViews = new Map<
    string,
    Phaser.GameObjects.Container
  >();

  private populationText!: Phaser.GameObjects.Text;

  public constructor() {
    super({ key: "PrototypeScene" });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#dfe8dd");

    this.add.text(32, 32, "Premiers effets de gameplay", {
      color: "#18351f",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "28px",
      fontStyle: "bold",
    });

    this.add.text(
      32,
      76,
      "Chaque habitation augmente maintenant la capacité de population.",
      {
        color: "#4f5e51",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "18px",
      },
    );

    this.selectedTileText = this.add
      .text(928, 32, "Aucune tuile sélectionnée", {
        color: "#18351f",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
      })
      .setOrigin(1, 0);

    this.populationText = this.add
      .text(32, 108, "", {
        color: "#31583a",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
      })
      .setDepth(100);

    this.refreshMetrics();

    this.drawHexGrid();
  }
  private drawHexGrid(): void {
    this.tileViews.clear();

    for (const tile of prototypeTiles) {
      const relativePosition = axialToPixel(
        {
          q: tile.q,
          r: tile.r,
        },
        HEX_SIZE,
      );

      const centerX = MAP_CENTER_X + relativePosition.x;
      const centerY = MAP_CENTER_Y + relativePosition.y;

      const corners = getHexCorners(centerX, centerY, HEX_SIZE - 2);

      this.createInteractiveTile(tile, corners, centerX, centerY);

      this.add
        .text(centerX, centerY + 38, `${tile.q}, ${tile.r}`, {
          color: "#18351f",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "11px",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(20);
    }
  }

  private createInteractiveTile(
    tile: GameTile,
    corners: HexPoint[],
    centerX: number,
    centerY: number,
  ): void {
    const graphics = this.add.graphics();

    this.tileViews.set(tile.id, {
      tile,
      graphics,
      corners,
      centerX,
      centerY,
    });

    this.redrawTile(tile.id);

    graphics.setInteractive(
      new Phaser.Geom.Polygon(corners),
      Phaser.Geom.Polygon.Contains,
    );

    const terrainDefinition = getTerrainDefinition(tile.terrainTypeId);

    graphics.on("pointerover", () => {
      this.hoveredTileId = tile.id;

      if (
        this.activeBuildMode !== null &&
        this.canPlaceOnTile(tile, this.activeBuildMode)
      ) {
        this.showGhostStructure(tile, this.activeBuildMode);
      }

      this.redrawAllTiles();
    });

    graphics.on("pointerout", () => {
      if (this.hoveredTileId === tile.id) {
        this.hoveredTileId = null;
      }

      this.clearGhostStructure();
      this.redrawAllTiles();
    });

    graphics.on("pointerdown", () => {
      if (this.activeBuildMode !== null) {
        const structureWasPlaced = this.tryPlaceStructure(
          tile,
          this.activeBuildMode,
        );

        if (structureWasPlaced) {
          this.clearGhostStructure();
        }

        this.redrawAllTiles();

        return;
      }

      const previousSelectedTileId = this.selectedTileId;

      this.selectedTileId = previousSelectedTileId === tile.id ? null : tile.id;

      this.updateInfluencedTiles(tile);
      this.redrawAllTiles();

      if (this.selectedTileId === null) {
        this.selectedTileText.setText("Aucune tuile sélectionnée");

        return;
      }

      this.selectedTileText.setText(
        `Tuile : ${tile.q}, ${tile.r} · ${terrainDefinition.label} · Rayon : ${this.influencedTileIds.size}`,
      );
    });

    this.game.events.on(
      SET_BUILD_MODE_EVENT,
      this.handleBuildModeChanged,
      this,
    );

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.handleSceneShutdown,
      this,
    );
  }

  private handleBuildModeChanged(buildMode: StructureTypeId | null): void {
    this.activeBuildMode = buildMode;
    this.hoveredTileId = null;
    this.clearGhostStructure();
    this.redrawAllTiles();
  }

  private handleSceneShutdown(): void {
    this.game.events.off(
      SET_BUILD_MODE_EVENT,
      this.handleBuildModeChanged,
      this,
    );
  }

  private updateInfluencedTiles(selectedTile: GameTile): void {
    this.influencedTileIds.clear();

    if (this.selectedTileId === null) {
      return;
    }

    const tilesInRadius = getItemsInHexRadius(
      prototypeTiles,
      selectedTile,
      INFLUENCE_RADIUS,
    );

    for (const tile of tilesInRadius) {
      if (tile.id !== selectedTile.id) {
        this.influencedTileIds.add(tile.id);
      }
    }
  }

  private redrawAllTiles(): void {
    for (const tileId of this.tileViews.keys()) {
      this.redrawTile(tileId);
    }
  }

  private redrawTile(tileId: string): void {
    const tileView = this.tileViews.get(tileId);

    if (tileView === undefined) {
      return;
    }

    const terrainDefinition = getTerrainDefinition(tileView.tile.terrainTypeId);

    const isHovered = this.hoveredTileId === tileId;

    const isSelected = this.selectedTileId === tileId;

    const isInfluenced = this.influencedTileIds.has(tileId);

    let fillColor = terrainDefinition.fillColor;
    let fillAlpha = 1;
    let strokeColor = TILE_STROKE_COLOR;
    let strokeWidth = TILE_DEFAULT_STROKE_WIDTH;

    if (this.activeBuildMode !== null) {
      const placementIsValid = this.canPlaceOnTile(
        tileView.tile,
        this.activeBuildMode,
      );

      if (placementIsValid) {
        strokeColor = TILE_BUILD_VALID_STROKE_COLOR;

        strokeWidth = isHovered
          ? TILE_BUILD_HOVER_STROKE_WIDTH
          : TILE_BUILD_VALID_STROKE_WIDTH;

        if (isHovered) {
          fillColor = terrainDefinition.hoverColor;
        }
      } else {
        fillAlpha = TILE_BUILD_INVALID_ALPHA;

        if (isHovered) {
          strokeColor = TILE_BUILD_INVALID_STROKE_COLOR;

          strokeWidth = TILE_BUILD_VALID_STROKE_WIDTH;
        }
      }
    } else {
      if (isSelected) {
        fillColor = TILE_SELECTED_COLOR;
      } else if (isHovered) {
        fillColor = terrainDefinition.hoverColor;
      }

      if (isInfluenced) {
        strokeColor = TILE_INFLUENCE_STROKE_COLOR;

        strokeWidth = TILE_INFLUENCE_STROKE_WIDTH;
      }
    }

    tileView.graphics.clear();
    tileView.graphics.fillStyle(fillColor, fillAlpha);
    tileView.graphics.lineStyle(strokeWidth, strokeColor, 1);

    tileView.graphics.fillPoints(tileView.corners, true);

    tileView.graphics.strokePoints(tileView.corners, true);
  }

  private tryPlaceStructure(
    tile: GameTile,
    structureTypeId: StructureTypeId,
  ): boolean {
    const definition = getStructureDefinition(structureTypeId);

    const placementIsValid = this.canPlaceOnTile(tile, structureTypeId);

    if (!placementIsValid) {
      this.selectedTileText.setText(
        `Construction impossible sur ${tile.q}, ${tile.r}`,
      );

      return false;
    }

    const previousMetrics = calculateGlobalMetrics(
      this.gameState,
      STRUCTURE_DEFINITIONS,
    );

    this.gameState = applyPlaceStructure(this.gameState, {
      type: "place-structure",
      structureTypeId,
      tileId: tile.id,
    });

    const placedStructure = this.gameState.structures.find(
      (structure) => structure.tileId === tile.id,
    );

    if (placedStructure === undefined) {
      return false;
    }

    this.drawStructure(placedStructure);

    this.refreshMetrics();

    const nextMetrics = calculateGlobalMetrics(
      this.gameState,
      STRUCTURE_DEFINITIONS,
    );

    const populationCapacityDelta =
      nextMetrics.populationCapacity - previousMetrics.populationCapacity;

    this.showPopulationCapacityDelta(tile.id, populationCapacityDelta);

    this.selectedTileText.setText(
      `${definition.label} construite · +${populationCapacityDelta} capacité`,
    );

    return true;
  }

  private drawStructure(structure: PlacedStructure): void {
    const tileView = this.tileViews.get(structure.tileId);

    if (tileView === undefined) {
      return;
    }

    const existingView = this.structureViews.get(structure.id);

    if (existingView !== undefined) {
      existingView.destroy(true);
    }

    const container = this.createStructureView(
      structure.typeId,
      tileView.centerX,
      tileView.centerY,
      1,
    );

    this.structureViews.set(structure.id, container);

    container.setDepth(10);

    this.structureViews.set(structure.id, container);
  }

  private canPlaceOnTile(
    tile: GameTile,
    structureTypeId: StructureTypeId,
  ): boolean {
    const definition = getStructureDefinition(structureTypeId);

    return canPlaceStructure(this.gameState, tile, {
      allowedTerrainTypeIds: definition.allowedTerrainTypeIds,
    });
  }

  private showGhostStructure(
    tile: GameTile,
    structureTypeId: StructureTypeId,
  ): void {
    this.clearGhostStructure();

    const tileView = this.tileViews.get(tile.id);

    if (tileView === undefined) {
      return;
    }

    this.ghostStructureView = this.createStructureView(
      structureTypeId,
      tileView.centerX,
      tileView.centerY,
      0.5,
    );

    this.ghostStructureView.setDepth(30);
  }

  private clearGhostStructure(): void {
    if (this.ghostStructureView === null) {
      return;
    }

    this.ghostStructureView.destroy(true);
    this.ghostStructureView = null;
  }

  private createStructureView(
    structureTypeId: StructureTypeId,
    centerX: number,
    centerY: number,
    alpha: number,
  ): Phaser.GameObjects.Container {
    const definition = getStructureDefinition(structureTypeId);

    const container = this.add.container(centerX, centerY - 4);

    const walls = this.add.rectangle(0, 8, 32, 24, definition.wallColor);

    const roof = this.add.graphics();

    roof.fillStyle(definition.roofColor, 1);
    roof.beginPath();
    roof.moveTo(-20, -4);
    roof.lineTo(0, -24);
    roof.lineTo(20, -4);
    roof.closePath();
    roof.fillPath();

    const door = this.add.rectangle(0, 12, 8, 16, definition.doorColor);

    container.add([walls, roof, door]);
    container.setAlpha(alpha);
    container.setDepth(10);

    return container;
  }

  private refreshMetrics(): void {
    const metrics = calculateGlobalMetrics(
      this.gameState,
      STRUCTURE_DEFINITIONS,
    );

    this.populationText.setText(
      `Capacité de population : ${metrics.populationCapacity}`,
    );
  }

  private showPopulationCapacityDelta(tileId: string, amount: number): void {
    if (amount <= 0) {
      return;
    }

    const tileView = this.tileViews.get(tileId);

    if (tileView === undefined) {
      return;
    }

    const feedbackText = this.add
      .text(tileView.centerX, tileView.centerY - 38, `+${amount} capacité`, {
        color: "#245f35",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        stroke: "#fffdf7",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(50);

    this.tweens.add({
      targets: feedbackText,
      y: feedbackText.y - 30,
      alpha: 0,
      duration: 900,
      ease: "Cubic.easeOut",
      onComplete: () => {
        feedbackText.destroy();
      },
    });
  }
}
