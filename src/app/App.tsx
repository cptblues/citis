import { GameViewport } from "../game/GameViewport";
import { useState } from "react";

import type { SelectedTileTypeId } from "../game/gameEvents";

import { getPrototypeTurnProposals } from "../content/prototypeTurnProposals";
import { getTerritoryTileDefinition } from "../content/territoryTileDefinitions";
import {
  createInitialTurnState,
  endTurn,
  markPlacementCompleted,
} from "../engine/turn";

import "./App.css";

/**
 * Compose l'interface React autour de la scène Phaser et de l'état de tour.
 */
export function App() {
  const [selectedTileTypeId, setSelectedTileTypeId] =
    useState<SelectedTileTypeId>(null);
  const [turnState, setTurnState] = useState(createInitialTurnState);

  const proposals = getPrototypeTurnProposals(turnState.number);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Prototype web</p>
          <h1>Citis</h1>
        </div>

        <p className="step-label">Migration 3 · Boucle de tour</p>
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
          <div className="turn-summary">
            <strong>Tour {turnState.number}</strong>

            <span>
              {turnState.placementCompleted
                ? "Placement terminé"
                : "Choisis une proposition"}
            </span>
          </div>

          <div className="proposal-list">
            {proposals.map((tileTypeId, proposalIndex) => {
              const definition = getTerritoryTileDefinition(tileTypeId);

              const isSelected = selectedTileTypeId === tileTypeId;

              return (
                <button
                  key={`${turnState.number}:${proposalIndex}:${tileTypeId}`}
                  type="button"
                  className={
                    isSelected
                      ? "build-button build-button--active"
                      : "build-button"
                  }
                  aria-pressed={isSelected}
                  disabled={turnState.placementCompleted}
                  onClick={() => {
                    setSelectedTileTypeId(isSelected ? null : tileTypeId);
                  }}
                >
                  <small>Proposition {proposalIndex + 1}</small>

                  <span>{definition.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="end-turn-button"
            disabled={!turnState.placementCompleted}
            onClick={() => {
              setTurnState((currentState) => endTurn(currentState));

              setSelectedTileTypeId(null);
            }}
          >
            Terminer le tour
          </button>
        </div>

        <GameViewport
          selectedTileTypeId={selectedTileTypeId}
          placementEnabled={!turnState.placementCompleted}
          onTilePlaced={() => {
            setTurnState((currentState) =>
              markPlacementCompleted(currentState),
            );

            setSelectedTileTypeId(null);
          }}
        />
      </section>
    </main>
  );
}
