import { useState } from "react";

import { PROTOTYPE_SCENARIO } from "../content/prototypeScenario";
import { getPrototypeTurnProposals } from "../content/prototypeTurnProposals";
import { getTerritoryTileDefinition } from "../content/territoryTileDefinitions";
import {
  getTerritoryUpgradeDefinition,
  PROTOTYPE_UPGRADE_TYPE_IDS,
} from "../content/territoryUpgradeDefinitions";
import { getNextHexRotation, type HexRotation } from "../engine/hex";
import {
  createEmptyTerritoryResources,
  type TerritoryResources,
} from "../engine/resources";
import { calculateTerritoryScore } from "../engine/score";
import {
  canCompleteScenario,
  createInitialTurnState,
  endTurn,
  isFinalTurn,
  markImprovementCompleted,
  markPlacementCompleted,
} from "../engine/turn";
import { GameViewport } from "../game/GameViewport";
import type {
  SelectedTileTypeId,
  SelectedUpgradeTypeId,
  TerritorySummaryChangedPayload,
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

function formatScore(score: number): string {
  return score.toLocaleString("fr-FR");
}

function createEmptyTerritorySummary(): TerritorySummaryChangedPayload {
  return {
    resources: createEmptyTerritoryResources(),
    placedTileCount: 0,
  };
}

/**
 * Compose l'interface React autour de la scène Phaser et de l'état de partie.
 */
export function App() {
  const [gameRunId, setGameRunId] = useState(1);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedTileTypeId, setSelectedTileTypeId] =
    useState<SelectedTileTypeId>(null);
  const [turnState, setTurnState] = useState(createInitialTurnState);
  const [selectedUpgradeTypeId, setSelectedUpgradeTypeId] =
    useState<SelectedUpgradeTypeId>(null);
  const [selectedTileRotation, setSelectedTileRotation] =
    useState<HexRotation>(0);
  const [territorySummary, setTerritorySummary] =
    useState<TerritorySummaryChangedPayload>(createEmptyTerritorySummary);

  const proposals = getPrototypeTurnProposals(turnState.number);
  const selectedTileDefinition =
    selectedTileTypeId === null
      ? null
      : getTerritoryTileDefinition(selectedTileTypeId);
  const rotationEnabled =
    selectedTileDefinition?.placement.rotationEnabled ?? false;
  const finalTurn = isFinalTurn(turnState, PROTOTYPE_SCENARIO.maximumTurns);
  const scoreBreakdown = calculateTerritoryScore(
    territorySummary.resources,
    PROTOTYPE_SCENARIO.scoring,
  );
  const scenarioSucceeded =
    scoreBreakdown.totalScore >= PROTOTYPE_SCENARIO.targetScore;
  const interactionsDisabled = gameCompleted;

  function clearSelections(): void {
    setSelectedTileTypeId(null);
    setSelectedUpgradeTypeId(null);
    setSelectedTileRotation(0);
  }

  function handleEndTurn(): void {
    if (gameCompleted || !turnState.placementCompleted) {
      return;
    }

    if (canCompleteScenario(turnState, PROTOTYPE_SCENARIO.maximumTurns)) {
      setGameCompleted(true);
      clearSelections();
      return;
    }

    setTurnState((currentState) => endTurn(currentState));
    clearSelections();
  }

  function handleRestart(): void {
    setGameRunId((currentId) => currentId + 1);
    setGameCompleted(false);
    setTurnState(createInitialTurnState());
    setTerritorySummary(createEmptyTerritorySummary());
    clearSelections();
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Prototype web</p>
          <h1>Citis</h1>
        </div>
        <p className="step-label">Migration 11 · Première partie complète</p>
      </header>

      <section className="game-card" aria-labelledby="game-title">
        <div className="game-card__header">
          <div>
            <h2 id="game-title">{PROTOTYPE_SCENARIO.label}</h2>
            <p>{PROTOTYPE_SCENARIO.description}</p>
          </div>

          <div
            className="scenario-progress"
            aria-label="Progression de la partie"
          >
            <span>
              Tour <strong>{turnState.number}</strong> /{" "}
              {PROTOTYPE_SCENARIO.maximumTurns}
            </span>
            <span>
              Score <strong>{formatScore(scoreBreakdown.totalScore)}</strong> /{" "}
              {formatScore(PROTOTYPE_SCENARIO.targetScore)}
            </span>
          </div>
        </div>

        <div className="build-toolbar">
          <div className="turn-summary">
            <strong>
              {finalTurn ? "Dernier tour" : `Tour ${turnState.number}`}
            </strong>
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
                  disabled={
                    interactionsDisabled || turnState.placementCompleted
                  }
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
              disabled={
                interactionsDisabled ||
                turnState.placementCompleted ||
                !rotationEnabled
              }
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
                    interactionsDisabled ||
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
            disabled={interactionsDisabled || !turnState.placementCompleted}
            onClick={handleEndTurn}
          >
            {finalTurn ? "Voir le bilan" : "Terminer le tour"}
          </button>
        </div>

        <div className="game-stage">
          <GameViewport
            key={gameRunId}
            selectedTileTypeId={selectedTileTypeId}
            placementEnabled={
              !interactionsDisabled && !turnState.placementCompleted
            }
            onTilePlaced={() => {
              setTurnState((currentState) =>
                markPlacementCompleted(currentState),
              );
              clearSelections();
            }}
            selectedUpgradeTypeId={selectedUpgradeTypeId}
            improvementEnabled={
              !interactionsDisabled &&
              turnState.placementCompleted &&
              !turnState.improvementCompleted
            }
            onUpgradeApplied={() => {
              setTurnState((currentState) =>
                markImprovementCompleted(currentState),
              );
              setSelectedUpgradeTypeId(null);
              setSelectedTileRotation(0);
            }}
            selectedTileRotation={selectedTileRotation}
            onTerritorySummaryChanged={setTerritorySummary}
          />

          {gameCompleted ? (
            <div className="game-result-backdrop">
              <section
                className="game-result"
                role="dialog"
                aria-modal="true"
                aria-labelledby="result-title"
              >
                <p className="eyebrow">Bilan de la commune</p>
                <h2 id="result-title">{PROTOTYPE_SCENARIO.label}</h2>
                <p className="game-result__status">
                  {scenarioSucceeded
                    ? "Commune réussie"
                    : "Commune encore fragile"}
                </p>

                <div className="game-result__score">
                  <strong>{formatScore(scoreBreakdown.totalScore)}</strong>
                  <span>
                    Objectif : {formatScore(PROTOTYPE_SCENARIO.targetScore)}{" "}
                    points
                  </span>
                </div>

                <dl className="resource-results">
                  <div>
                    <dt>Nourriture</dt>
                    <dd>{territorySummary.resources.food}</dd>
                  </div>
                  <div>
                    <dt>Énergie</dt>
                    <dd>{territorySummary.resources.energy}</dd>
                  </div>
                  <div>
                    <dt>Nature</dt>
                    <dd>{territorySummary.resources.nature}</dd>
                  </div>
                  <div>
                    <dt>Bonheur</dt>
                    <dd>{territorySummary.resources.happiness}</dd>
                  </div>
                </dl>

                <div className="score-breakdown">
                  <span>
                    Ressources : {formatScore(scoreBreakdown.resourceScore)}
                  </span>
                  <span>
                    Équilibre : +{formatScore(scoreBreakdown.balanceBonus)}
                  </span>
                </div>

                {!scenarioSucceeded ? (
                  <p className="game-result__hint">
                    Il manque{" "}
                    {formatScore(
                      PROTOTYPE_SCENARIO.targetScore -
                        scoreBreakdown.totalScore,
                    )}{" "}
                    points pour atteindre l’objectif.
                  </p>
                ) : null}

                <button
                  type="button"
                  className="restart-button"
                  onClick={handleRestart}
                >
                  Rejouer
                </button>
              </section>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
