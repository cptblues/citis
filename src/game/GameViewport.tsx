import { useEffect, useRef } from "react";
import type Phaser from "phaser";

import {
  SET_SELECTED_TILE_TYPE_EVENT,
  type SelectedTileTypeId,
  SET_PLACEMENT_ENABLED_EVENT,
  TERRITORY_TILE_PLACED_EVENT,
  type TerritoryTilePlacedPayload,
} from "./gameEvents";

import { createPhaserGame } from "./createPhaserGame";

interface GameViewportProps {
  selectedTileTypeId: SelectedTileTypeId;
  placementEnabled: boolean;
  onTilePlaced: (payload: TerritoryTilePlacedPayload) => void;
}

/**
 * Monte la scène Phaser dans React et relaie les événements de gameplay.
 */
export function GameViewport({
  selectedTileTypeId,
  placementEnabled,
  onTilePlaced,
}: GameViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onTilePlacedRef = useRef(onTilePlaced);

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

    return () => {
      game.events.off(TERRITORY_TILE_PLACED_EVENT, handleTilePlaced);
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

  return (
    <div
      ref={containerRef}
      className="game-viewport"
      aria-label="Zone de jeu Citis"
    />
  );
}
