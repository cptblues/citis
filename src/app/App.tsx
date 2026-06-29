import { GameViewport } from "../game/GameViewport";
import { useState } from "react";

import type { SelectedTileTypeId } from "../game/gameEvents";

import "./App.css";

export function App() {
  const [selectedTileTypeId, setSelectedTileTypeId] =
    useState<SelectedTileTypeId>(null);
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Prototype web</p>
          <h1>Citis</h1>
        </div>

        <p className="step-label">Migration 2 · Placement territorial</p>
      </header>

      <section className="game-card" aria-labelledby="game-title">
        <div className="game-card__header">
          <div>
            <h2 id="game-title">Carte de test</h2>
            <p>La scène est gérée par Phaser, le cadre par React.</p>
          </div>

          <span className="status-badge">Scène active</span>
        </div>

        <div className="build-toolbar">
          <button
            type="button"
            className={
              selectedTileTypeId === "prairie"
                ? "build-button build-button--active"
                : "build-button"
            }
            aria-pressed={selectedTileTypeId === "prairie"}
            onClick={() => {
              setSelectedTileTypeId((currentTileTypeId) =>
                currentTileTypeId === "prairie" ? null : "prairie",
              );
            }}
          >
            Prairie
          </button>

          <button
            type="button"
            className={
              selectedTileTypeId === "forest"
                ? "build-button build-button--active"
                : "build-button"
            }
            aria-pressed={selectedTileTypeId === "forest"}
            onClick={() => {
              setSelectedTileTypeId((currentTileTypeId) =>
                currentTileTypeId === "forest" ? null : "forest",
              );
            }}
          >
            Forêt
          </button>

          <span className="build-toolbar__status">
            {selectedTileTypeId === null
              ? "Choisis une tuile à placer"
              : "Clique sur un emplacement disponible"}
          </span>
        </div>

        <GameViewport selectedTileTypeId={selectedTileTypeId} />
      </section>
    </main>
  );
}
