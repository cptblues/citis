import { useEffect, useRef } from "react";

import Phaser from "phaser";

import type { HexRotation } from "../engine/hex";
import { createPhaserGame } from "./createPhaserGame";
import {
  SET_IMPROVEMENT_ENABLED_EVENT,
  SET_PLACEMENT_ENABLED_EVENT,
  SET_SELECTED_TILE_ROTATION_EVENT,
  SET_SELECTED_TILE_TYPE_EVENT,
  SET_SELECTED_UPGRADE_TYPE_EVENT,
  TERRITORY_SUMMARY_CHANGED_EVENT,
  TERRITORY_TILE_PLACED_EVENT,
  TERRITORY_UPGRADE_APPLIED_EVENT,
  type SelectedTileTypeId,
  type SelectedUpgradeTypeId,
  type TerritorySummaryChangedPayload,
  type TerritoryTilePlacedPayload,
  type TerritoryUpgradeAppliedPayload,
  TERRITORY_PLACEMENT_PREVIEW_CHANGED_EVENT,
  type TerritoryPlacementPreviewChangedPayload,
} from "./gameEvents";
import "./GameViewport.css";

const TERRITORY_SCENE_KEY = "TerritoryPrototypeScene";

const BOARD_FRAME = {
  centerX: 480,
  centerY: 350,
  width: 820,
  height: 540,
} as const;

const CAMERA_FIT_MARGIN = 0.94;
const MIN_ZOOM_MULTIPLIER = 0.8;
const MAX_ZOOM_MULTIPLIER = 2;
const ZOOM_STEP = 0.15;

interface GameViewportProps {
  selectedTileTypeId: SelectedTileTypeId;
  placementEnabled: boolean;
  onTilePlaced: (payload: TerritoryTilePlacedPayload) => void;
  selectedUpgradeTypeId: SelectedUpgradeTypeId;
  improvementEnabled: boolean;
  onUpgradeApplied: (payload: TerritoryUpgradeAppliedPayload) => void;
  selectedTileRotation: HexRotation;
  onTerritorySummaryChanged: (payload: TerritorySummaryChangedPayload) => void;
  onPlacementPreviewChanged: (
    payload: TerritoryPlacementPreviewChangedPayload,
  ) => void;
}

function clampZoomMultiplier(value: number): number {
  return Phaser.Math.Clamp(value, MIN_ZOOM_MULTIPLIER, MAX_ZOOM_MULTIPLIER);
}

function getTerritoryScene(game: Phaser.Game): Phaser.Scene | null {
  if (!game.scene.isActive(TERRITORY_SCENE_KEY)) {
    return null;
  }

  return game.scene.getScene(TERRITORY_SCENE_KEY);
}

/**
 * Les textes permanents de l'ancienne scène faisaient doublon avec le HUD
 * React. Ils sont masqués une fois la scène créée. Les feedbacks temporaires
 * générés plus tard après un placement restent visibles.
 */
function hideInitialSceneTexts(scene: Phaser.Scene): void {
  for (const gameObject of scene.children.list) {
    if (gameObject instanceof Phaser.GameObjects.Text) {
      gameObject.setVisible(false);
    }
  }
}

function frameTerritoryCamera(game: Phaser.Game, zoomMultiplier: number): void {
  const scene = getTerritoryScene(game);

  if (scene === null) {
    return;
  }

  const viewportWidth = Math.max(game.scale.gameSize.width, 1);
  const viewportHeight = Math.max(game.scale.gameSize.height, 1);
  const fitZoom =
    Math.min(
      viewportWidth / BOARD_FRAME.width,
      viewportHeight / BOARD_FRAME.height,
    ) * CAMERA_FIT_MARGIN;

  scene.cameras.main
    .setZoom(fitZoom * zoomMultiplier)
    .centerOn(BOARD_FRAME.centerX, BOARD_FRAME.centerY);
}

/**
 * Monte la scène Phaser dans React, relaie les événements de gameplay et
 * fournit les contrôles de caméra de la carte.
 */
export function GameViewport({
  selectedTileTypeId,
  placementEnabled,
  onTilePlaced,
  selectedUpgradeTypeId,
  improvementEnabled,
  onUpgradeApplied,
  selectedTileRotation,
  onTerritorySummaryChanged,
  onPlacementPreviewChanged,
}: GameViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const zoomMultiplierRef = useRef(1);
  const onTilePlacedRef = useRef(onTilePlaced);
  const onUpgradeAppliedRef = useRef(onUpgradeApplied);
  const onTerritorySummaryChangedRef = useRef(onTerritorySummaryChanged);
  const onPlacementPreviewChangedRef = useRef(onPlacementPreviewChanged);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const game = createPhaserGame(container);
    gameRef.current = game;

    const handleTilePlaced = (payload: TerritoryTilePlacedPayload): void => {
      onTilePlacedRef.current(payload);
    };

    const handleUpgradeApplied = (
      payload: TerritoryUpgradeAppliedPayload,
    ): void => {
      onUpgradeAppliedRef.current(payload);
    };

    const handleTerritorySummaryChanged = (
      payload: TerritorySummaryChangedPayload,
    ): void => {
      onTerritorySummaryChangedRef.current(payload);
    };

    const handlePlacementPreviewChanged = (
      payload: TerritoryPlacementPreviewChangedPayload,
    ): void => {
      onPlacementPreviewChangedRef.current(payload);
    };

    const handleWheel = (event: WheelEvent): void => {
      event.preventDefault();

      const direction = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      zoomMultiplierRef.current = clampZoomMultiplier(
        zoomMultiplierRef.current + direction,
      );
      frameTerritoryCamera(game, zoomMultiplierRef.current);
    };

    let initializationFrame = 0;
    let resizeFrame = 0;

    const initializeSceneView = (): void => {
      const scene = getTerritoryScene(game);

      if (scene === null) {
        initializationFrame = window.requestAnimationFrame(initializeSceneView);
        return;
      }

      hideInitialSceneTexts(scene);
      frameTerritoryCamera(game, zoomMultiplierRef.current);
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry === undefined) {
        return;
      }

      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);

      if (width <= 0 || height <= 0) {
        return;
      }

      game.scale.resize(width, height);
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        frameTerritoryCamera(game, zoomMultiplierRef.current);
      });
    });

    game.events.on(TERRITORY_TILE_PLACED_EVENT, handleTilePlaced);
    game.events.on(TERRITORY_UPGRADE_APPLIED_EVENT, handleUpgradeApplied);
    game.events.on(
      TERRITORY_SUMMARY_CHANGED_EVENT,
      handleTerritorySummaryChanged,
    );
    game.events.on(
      TERRITORY_PLACEMENT_PREVIEW_CHANGED_EVENT,
      handlePlacementPreviewChanged,
    );
    container.addEventListener("wheel", handleWheel, { passive: false });
    resizeObserver.observe(container);
    initializationFrame = window.requestAnimationFrame(initializeSceneView);

    return () => {
      window.cancelAnimationFrame(initializationFrame);
      window.cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      container.removeEventListener("wheel", handleWheel);
      game.events.off(TERRITORY_TILE_PLACED_EVENT, handleTilePlaced);
      game.events.off(TERRITORY_UPGRADE_APPLIED_EVENT, handleUpgradeApplied);
      game.events.off(
        TERRITORY_SUMMARY_CHANGED_EVENT,
        handleTerritorySummaryChanged,
      );
      game.events.off(
        TERRITORY_PLACEMENT_PREVIEW_CHANGED_EVENT,
        handlePlacementPreviewChanged,
      );
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    onTilePlacedRef.current = onTilePlaced;
  }, [onTilePlaced]);

  useEffect(() => {
    onUpgradeAppliedRef.current = onUpgradeApplied;
  }, [onUpgradeApplied]);

  useEffect(() => {
    onTerritorySummaryChangedRef.current = onTerritorySummaryChanged;
  }, [onTerritorySummaryChanged]);

  useEffect(() => {
    onPlacementPreviewChangedRef.current = onPlacementPreviewChanged;
  }, [onPlacementPreviewChanged]);

  useEffect(() => {
    const game = gameRef.current;

    if (game === null) {
      return;
    }

    game.events.emit(SET_SELECTED_TILE_TYPE_EVENT, selectedTileTypeId);
  }, [selectedTileTypeId]);

  useEffect(() => {
    const game = gameRef.current;

    if (game === null) {
      return;
    }

    game.events.emit(SET_PLACEMENT_ENABLED_EVENT, placementEnabled);
  }, [placementEnabled]);

  useEffect(() => {
    const game = gameRef.current;

    if (game === null) {
      return;
    }

    game.events.emit(SET_SELECTED_UPGRADE_TYPE_EVENT, selectedUpgradeTypeId);
  }, [selectedUpgradeTypeId]);

  useEffect(() => {
    const game = gameRef.current;

    if (game === null) {
      return;
    }

    game.events.emit(SET_IMPROVEMENT_ENABLED_EVENT, improvementEnabled);
  }, [improvementEnabled]);

  useEffect(() => {
    const game = gameRef.current;

    if (game === null) {
      return;
    }

    game.events.emit(SET_SELECTED_TILE_ROTATION_EVENT, selectedTileRotation);
  }, [selectedTileRotation]);

  function changeZoom(delta: number): void {
    zoomMultiplierRef.current = clampZoomMultiplier(
      zoomMultiplierRef.current + delta,
    );

    const game = gameRef.current;

    if (game !== null) {
      frameTerritoryCamera(game, zoomMultiplierRef.current);
    }
  }

  function resetZoom(): void {
    zoomMultiplierRef.current = 1;

    const game = gameRef.current;

    if (game !== null) {
      frameTerritoryCamera(game, zoomMultiplierRef.current);
    }
  }

  return (
    <div className="game-viewport game-viewport-shell">
      <div ref={containerRef} className="game-viewport__canvas" />

      <div
        className="map-zoom-controls"
        role="group"
        aria-label="Zoom de la carte"
      >
        <button
          type="button"
          className="map-zoom-button"
          onClick={() => changeZoom(-ZOOM_STEP)}
          aria-label="Dézoomer"
          title="Dézoomer"
        >
          −
        </button>
        <button
          type="button"
          className="map-zoom-button map-zoom-button--reset"
          onClick={resetZoom}
          aria-label="Recentrer la carte"
          title="Recentrer la carte"
        >
          ◎
        </button>
        <button
          type="button"
          className="map-zoom-button"
          onClick={() => changeZoom(ZOOM_STEP)}
          aria-label="Zoomer"
          title="Zoomer"
        >
          +
        </button>
      </div>
    </div>
  );
}
