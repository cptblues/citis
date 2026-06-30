import { useEffect, useRef } from "react";
import type Phaser from "phaser";

import {
  SET_SELECTED_TILE_TYPE_EVENT,
  type SelectedTileTypeId,
  SET_PLACEMENT_ENABLED_EVENT,
  TERRITORY_TILE_PLACED_EVENT,
  type TerritoryTilePlacedPayload,
  SET_IMPROVEMENT_ENABLED_EVENT,
  SET_SELECTED_UPGRADE_TYPE_EVENT,
  TERRITORY_UPGRADE_APPLIED_EVENT,
  type SelectedUpgradeTypeId,
  type TerritoryUpgradeAppliedPayload,
  SET_SELECTED_TILE_ROTATION_EVENT,
} from "./gameEvents";

import { createPhaserGame } from "./createPhaserGame";
import type { HexRotation } from "../engine/hex";

interface GameViewportProps {
  selectedTileTypeId: SelectedTileTypeId;
  placementEnabled: boolean;
  onTilePlaced: (payload: TerritoryTilePlacedPayload) => void;
  selectedUpgradeTypeId: SelectedUpgradeTypeId;
  improvementEnabled: boolean;
  onUpgradeApplied: (payload: TerritoryUpgradeAppliedPayload) => void;
  selectedTileRotation: HexRotation;
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
}: GameViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onTilePlacedRef = useRef(onTilePlaced);
  const onUpgradeAppliedRef = useRef(onUpgradeApplied);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const game = createPhaserGame(container);
    gameRef.current = game;

    /**
     * Transmet le callback React le plus récent sans recréer la scène Phaser.
     */
    const handleTilePlaced = (payload: TerritoryTilePlacedPayload): void => {
      onTilePlacedRef.current(payload);
    };

    game.events.on(TERRITORY_TILE_PLACED_EVENT, handleTilePlaced);

    const handleUpgradeApplied = (
      payload: TerritoryUpgradeAppliedPayload,
    ): void => {
      onUpgradeAppliedRef.current(payload);
    };

    game.events.on(TERRITORY_UPGRADE_APPLIED_EVENT, handleUpgradeApplied);

    return () => {
      game.events.off(TERRITORY_TILE_PLACED_EVENT, handleTilePlaced);
      game.events.off(TERRITORY_UPGRADE_APPLIED_EVENT, handleUpgradeApplied);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const game = gameRef.current;

    if (game === null) {
      return;
    }

    game.events.emit(SET_SELECTED_TILE_TYPE_EVENT, selectedTileTypeId);
  }, [selectedTileTypeId]);

  useEffect(() => {
    onTilePlacedRef.current = onTilePlaced;
  }, [onTilePlaced]);

  useEffect(() => {
    const game = gameRef.current;

    if (game === null) {
      return;
    }

    game.events.emit(SET_PLACEMENT_ENABLED_EVENT, placementEnabled);
  }, [placementEnabled]);

  useEffect(() => {
    onUpgradeAppliedRef.current = onUpgradeApplied;
  }, [onUpgradeApplied]);

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

  return (
    <div
      ref={containerRef}
      className="game-viewport"
      aria-label="Zone de jeu Citis"
    />
  );
}
