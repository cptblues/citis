import { useEffect, useRef } from "react";
import type Phaser from "phaser";

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
} from "./gameEvents";

interface GameViewportProps {
  selectedTileTypeId: SelectedTileTypeId;
  placementEnabled: boolean;
  onTilePlaced: (payload: TerritoryTilePlacedPayload) => void;
  selectedUpgradeTypeId: SelectedUpgradeTypeId;
  improvementEnabled: boolean;
  onUpgradeApplied: (payload: TerritoryUpgradeAppliedPayload) => void;
  selectedTileRotation: HexRotation;
  onTerritorySummaryChanged: (payload: TerritorySummaryChangedPayload) => void;
}

/**
 * Monte la scène Phaser dans React et relaie les événements de gameplay.
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
}: GameViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onTilePlacedRef = useRef(onTilePlaced);
  const onUpgradeAppliedRef = useRef(onUpgradeApplied);
  const onTerritorySummaryChangedRef = useRef(onTerritorySummaryChanged);

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

    game.events.on(TERRITORY_TILE_PLACED_EVENT, handleTilePlaced);
    game.events.on(TERRITORY_UPGRADE_APPLIED_EVENT, handleUpgradeApplied);
    game.events.on(
      TERRITORY_SUMMARY_CHANGED_EVENT,
      handleTerritorySummaryChanged,
    );

    return () => {
      game.events.off(TERRITORY_TILE_PLACED_EVENT, handleTilePlaced);
      game.events.off(TERRITORY_UPGRADE_APPLIED_EVENT, handleUpgradeApplied);
      game.events.off(
        TERRITORY_SUMMARY_CHANGED_EVENT,
        handleTerritorySummaryChanged,
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

  return <div ref={containerRef} className="game-viewport" />;
}
