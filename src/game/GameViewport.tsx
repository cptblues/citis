import { useEffect, useRef } from "react";
import type Phaser from "phaser";

import {
  SET_SELECTED_TILE_TYPE_EVENT,
  type SelectedTileTypeId,
} from "./gameEvents";

import { createPhaserGame } from "./createPhaserGame";

interface GameViewportProps {
  selectedTileTypeId: SelectedTileTypeId;
}

export function GameViewport({ selectedTileTypeId }: GameViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const game = createPhaserGame(container);
    gameRef.current = game;

    return () => {
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

  return (
    <div
      ref={containerRef}
      className="game-viewport"
      aria-label="Zone de jeu Citis"
    />
  );
}
