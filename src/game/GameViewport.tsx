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
  SET_SETTLEMENT_LEVEL_EVENT,
  TERRITORY_MAP_FIT_EVENT,
  TERRITORY_MAP_ZOOM_IN_EVENT,
  TERRITORY_MAP_ZOOM_OUT_EVENT,
  TERRITORY_PLACEMENT_PREVIEW_CHANGED_EVENT,
  TERRITORY_SUMMARY_CHANGED_EVENT,
  TERRITORY_TILE_PLACED_EVENT,
  TERRITORY_UPGRADE_APPLIED_EVENT,
  type SelectedTileTypeId,
  type SelectedUpgradeTypeId,
  type SettlementLevelChangedPayload,
  type TerritoryPlacementPreviewChangedPayload,
  type TerritorySummaryChangedPayload,
  type TerritoryTilePlacedPayload,
  type TerritoryUpgradeAppliedPayload,
} from "./gameEvents";
import "./GameViewport.css";

const TERRITORY_SCENE_KEY = "TerritoryPrototypeScene";

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
  settlementLevel: SettlementLevelChangedPayload;
}

function getTerritoryScene(game: Phaser.Game): Phaser.Scene | null {
  if (!game.scene.isActive(TERRITORY_SCENE_KEY)) {
    return null;
  }

  return game.scene.getScene(TERRITORY_SCENE_KEY);
}

/**
 * Les textes permanents de l'ancienne scène font doublon avec le HUD React.
 * Ils sont masqués une fois la scène créée. Les feedbacks temporaires générés
 * après un placement restent visibles.
 */
function hideInitialSceneTexts(scene: Phaser.Scene): void {
  for (const gameObject of scene.children.list) {
    if (gameObject instanceof Phaser.GameObjects.Text) {
      gameObject.setVisible(false);
    }
  }
}

/**
 * Monte la scène Phaser dans React, relaie les événements de gameplay et
 * transmet les commandes de caméra au contrôleur interne de la carte.
 *
 * La caméra principale Phaser reste volontairement à son zoom natif. Le zoom
 * et le déplacement sont appliqués uniquement au conteneur de territoire afin
 * que le masque, les zones interactives et les propositions restent alignés.
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
  settlementLevel,
}: GameViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
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

    let initializationFrame = 0;

    const initializeSceneView = (): void => {
      const scene = getTerritoryScene(game);

      if (scene === null) {
        initializationFrame = window.requestAnimationFrame(initializeSceneView);
        return;
      }

      hideInitialSceneTexts(scene);
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

    resizeObserver.observe(container);
    initializationFrame = window.requestAnimationFrame(initializeSceneView);

    return () => {
      window.cancelAnimationFrame(initializationFrame);
      resizeObserver.disconnect();
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

  useEffect(() => {
    const game = gameRef.current;

    if (game === null) {
      return;
    }

    game.events.emit(SET_SETTLEMENT_LEVEL_EVENT, settlementLevel);
  }, [settlementLevel.id, settlementLevel.label, settlementLevel.levelIndex]);

  function emitMapControl(eventName: string): void {
    gameRef.current?.events.emit(eventName);
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
          onClick={() => emitMapControl(TERRITORY_MAP_ZOOM_OUT_EVENT)}
          aria-label="Dézoomer"
          title="Dézoomer"
        >
          −
        </button>

        <button
          type="button"
          className="map-zoom-button map-zoom-button--reset"
          onClick={() => emitMapControl(TERRITORY_MAP_FIT_EVENT)}
          aria-label="Afficher toute la carte"
          title="Afficher toute la carte"
        >
          ◎
        </button>

        <button
          type="button"
          className="map-zoom-button"
          onClick={() => emitMapControl(TERRITORY_MAP_ZOOM_IN_EVENT)}
          aria-label="Zoomer"
          title="Zoomer"
        >
          +
        </button>
      </div>
    </div>
  );
}
