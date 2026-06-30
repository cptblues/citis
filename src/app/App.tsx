import { useState } from "react";

import { getPrototypeTurnProposals } from "../content/prototypeTurnProposals";
import { getTerritoryTileDefinition } from "../content/territoryTileDefinitions";
import {
  getTerritoryUpgradeDefinition,
  PROTOTYPE_UPGRADE_TYPE_IDS,
} from "../content/territoryUpgradeDefinitions";
import { getNextHexRotation, type HexRotation } from "../engine/hex";
import type { TerritoryResources } from "../engine/resources";
import {
  createInitialTurnState,
  endTurn,
  markImprovementCompleted,
  markPlacementCompleted,
} from "../engine/turn";
import { GameViewport } from "../game/GameViewport";
import type {
  SelectedTileTypeId,
  SelectedUpgradeTypeId,
} from "../game/gameEvents";

import "./App.css";

function formatResourceSummary(resources: TerritoryResources): string {
  return [
    formatResourceValue("Nourriture", resources.food),
    formatResourceValue("Énergie", resources.energy),
    formatResourceValue("Nature", resources.nature),
    formatResourceValue("Bonheur", resources.happiness),
  ]
    .filter((value) => value !== "")
    .join(" · ");
}

function formatResourceValue(label: string, value: number): string {
  if (value === 0) {
    return "";
  }

  const sign = value > 0 ? "+" : "";
  return `${label} ${sign}${value}`;
}

/**
 * Compose l'interface React autour de la scène Phaser et de l'état de tour.
 */
export function App() {
  const [selectedTileTypeId, setSelectedTileTypeId] =
    useState<SelectedTileTypeId>(null);
  const [turnState, setTurnState] = useState(createInitialTurnState);
  const [selectedUpgradeTypeId, setSelectedUpgradeTypeId] =
    useState<SelectedUpgradeTypeId>(null);
  const [selectedTileRotation, setSelectedTileRotation] =
    useState<HexRotation>(0);

  const proposals = getPrototypeTurnProposals(turnState.number);
  const selectedTileDefinition =
    selectedTileTypeId === null
      ? null
      : getTerritoryTileDefinition(selectedTileTypeId);
  const rotationEnabled =
    selectedTileDefinition?.placement.rotationEnabled ?? false;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Prototype web</p>
          <h1>Citis</h1>
        </div>
        <p className="step-label">Migration 9 · Catalogue data-driven</p>
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
              const resourceSummary = formatResourceSummary(
                definition.baseResources,
              );
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
                    setSelectedUpgradeTypeId(null);
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
              disabled={turnState.placementCompleted || !rotationEnabled}
              onClick={() => {
                setSelectedTileRotation((currentRotation) =>
                  getNextHexRotation(currentRotation),
                );
              }}
            >
              <span>
                {selectedTileDefinition === null
                  ? "Sélectionne une tuile orientable"
                  : `Tourner ${selectedTileDefinition.label.toLowerCase()}`}
              </span>
              <small>Position {selectedTileRotation + 1} / 6</small>
            </button>
          </div>

          <div className="improvement-panel">
            <div>
              <strong>Amélioration facultative</strong>
              <small>Après avoir posé une tuile</small>
            </div>

            {PROTOTYPE_UPGRADE_TYPE_IDS.map((upgradeTypeId) => {
              const definition = getTerritoryUpgradeDefinition(upgradeTypeId);
              const isSelected = selectedUpgradeTypeId === upgradeTypeId;

              return (
                <button
                  key={upgradeTypeId}
                  type="button"
                  className={
                    isSelected
                      ? "build-button build-button--active"
                      : "build-button"
                  }
                  aria-pressed={isSelected}
                  disabled={
                    !turnState.placementCompleted ||
                    turnState.improvementCompleted
                  }
                  onClick={() => {
                    setSelectedUpgradeTypeId(isSelected ? null : upgradeTypeId);
                    setSelectedTileTypeId(null);
                    setSelectedTileRotation(0);
                  }}
                >
                  <span>{definition.label}</span>
                  <small className="proposal-resources">
                    {definition.targetLabel} ·{" "}
                    {formatResourceSummary(definition.resourceBonus)}
                  </small>
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
