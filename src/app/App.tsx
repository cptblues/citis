import { GameViewport } from "../game/GameViewport";
import { useState } from "react";

import type {
  SelectedTileTypeId,
  SelectedUpgradeTypeId,
} from "../game/gameEvents";

import { getPrototypeTurnProposals } from "../content/prototypeTurnProposals";
import { getTerritoryTileDefinition } from "../content/territoryTileDefinitions";
import {
  createInitialTurnState,
  endTurn,
  markPlacementCompleted,
  markImprovementCompleted,
} from "../engine/turn";

import { getNextHexRotation, type HexRotation } from "../engine/hex";

import { TERRITORY_UPGRADE_DEFINITIONS } from "../content/territoryUpgradeDefinitions";

import "./App.css";

/**
 * Compose l'interface React autour de la scène Phaser et de l'état de tour.
 */
export function App() {
  const [selectedTileTypeId, setSelectedTileTypeId] =
    useState<SelectedTileTypeId>(null);
  const [turnState, setTurnState] = useState(createInitialTurnState);

  const proposals = getPrototypeTurnProposals(turnState.number);
  const [selectedUpgradeTypeId, setSelectedUpgradeTypeId] =
    useState<SelectedUpgradeTypeId>(null);

  const [selectedTileRotation, setSelectedTileRotation] =
    useState<HexRotation>(0);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Prototype web</p>
          <h1>Citis</h1>
        </div>

        <p className="step-label">Migration 7 · Rivière orientable</p>
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

              const resources = definition.baseResources;

              const resourceSummary = [
                resources.food > 0 ? `Nourriture +${resources.food}` : "",
                resources.energy > 0 ? `Énergie +${resources.energy}` : "",
                resources.nature > 0 ? `Nature +${resources.nature}` : "",
                resources.happiness > 0
                  ? `Bonheur +${resources.happiness}`
                  : "",
              ]
                .filter((value) => value !== "")
                .join(" · ");

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

                    setSelectedTileRotation(0);
                  }}
                >
                  <small>Proposition {proposalIndex + 1}</small>

                  <span>{definition.label}</span>
                  <small className="proposal-resources">
                    {resourceSummary}
                  </small>
                </button>
              );
            })}
          </div>

          <div className="rotation-panel">
            <strong>Orientation</strong>

            <button
              type="button"
              className="build-button"
              disabled={
                turnState.placementCompleted || selectedTileTypeId !== "river"
              }
              onClick={() => {
                setSelectedTileRotation((currentRotation) =>
                  getNextHexRotation(currentRotation),
                );
              }}
            >
              <span>Tourner la rivière</span>

              <small>Position {selectedTileRotation + 1} / 6</small>
            </button>
          </div>

          <div className="improvement-panel">
            <div>
              <strong>Amélioration facultative</strong>

              <small>Après avoir posé une tuile</small>
            </div>

            <button
              type="button"
              className={
                selectedUpgradeTypeId === "forest-trail"
                  ? "build-button build-button--active"
                  : "build-button"
              }
              disabled={
                !turnState.placementCompleted || turnState.improvementCompleted
              }
              onClick={() => {
                setSelectedUpgradeTypeId((currentUpgradeTypeId) =>
                  currentUpgradeTypeId === "forest-trail"
                    ? null
                    : "forest-trail",
                );
                setSelectedTileRotation(0);
              }}
            >
              <span>{TERRITORY_UPGRADE_DEFINITIONS["forest-trail"].label}</span>

              <small className="proposal-resources">Forêt · Bonheur +2</small>
            </button>
          </div>

          <button
            type="button"
            className="end-turn-button"
            disabled={!turnState.placementCompleted}
            onClick={() => {
              setTurnState((currentState) => endTurn(currentState));

              setSelectedTileTypeId(null);
              setSelectedUpgradeTypeId(null);
              setSelectedTileRotation(0);
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
            setSelectedUpgradeTypeId(null);
            setSelectedTileRotation(0);
          }}
          selectedUpgradeTypeId={selectedUpgradeTypeId}
          improvementEnabled={
            turnState.placementCompleted && !turnState.improvementCompleted
          }
          onUpgradeApplied={() => {
            setTurnState((currentState) =>
              markImprovementCompleted(currentState),
            );
            setSelectedUpgradeTypeId(null);
            setSelectedTileRotation(0);
          }}
          selectedTileRotation={selectedTileRotation}
        />
      </section>
    </main>
  );
}
