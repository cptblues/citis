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

const RESOURCE_PRESENTATION = [
  {
    key: "food",
    label: "Nourriture",
    shortLabel: "NOU",
    tone: "food",
  },
  {
    key: "energy",
    label: "Énergie",
    shortLabel: "ÉNE",
    tone: "energy",
  },
  {
    key: "nature",
    label: "Nature",
    shortLabel: "NAT",
    tone: "nature",
  },
  {
    key: "happiness",
    label: "Bonheur",
    shortLabel: "BON",
    tone: "happiness",
  },
] as const;

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
  const scoreProgress = Math.min(
    100,
    Math.max(
      0,
      (scoreBreakdown.totalScore / PROTOTYPE_SCENARIO.targetScore) * 100,
    ),
  );
  const turnProgress = Math.min(
    100,
    (turnState.number / PROTOTYPE_SCENARIO.maximumTurns) * 100,
  );

  const phase = !turnState.placementCompleted
    ? {
        index: 1,
        title: "Choisis et place une tuile",
        description:
          "Sélectionne une proposition, puis clique sur une case disponible de la carte.",
      }
    : !turnState.improvementCompleted
      ? {
          index: 2,
          title: "Améliore ou valide le tour",
          description:
            "Choisis une amélioration compatible ou conserve l'état actuel de la commune.",
        }
      : {
          index: 3,
          title: "Le tour est prêt",
          description:
            "L'amélioration est installée. Tu peux maintenant passer au tour suivant.",
        };

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
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <div>
            <p className="eyebrow">Prototype de gestion écologique</p>
            <h1>Citis</h1>
          </div>
        </div>

        <div className="scenario-identity">
          <span>Commune pilote</span>
          <strong>{PROTOTYPE_SCENARIO.label}</strong>
        </div>

        <div className="topbar-progress" aria-label="Progression de la partie">
          <div className="topbar-stat">
            <span>Tour</span>
            <strong>
              {turnState.number}
              <small> / {PROTOTYPE_SCENARIO.maximumTurns}</small>
            </strong>
            <div className="mini-meter" aria-hidden="true">
              <span style={{ width: `${turnProgress}%` }} />
            </div>
          </div>

          <div className="topbar-stat topbar-stat--score">
            <span>Score</span>
            <strong>
              {formatScore(scoreBreakdown.totalScore)}
              <small> / {formatScore(PROTOTYPE_SCENARIO.targetScore)}</small>
            </strong>
            <div className="mini-meter" aria-hidden="true">
              <span style={{ width: `${scoreProgress}%` }} />
            </div>
          </div>
        </div>
      </header>

      <section className="game-layout" aria-labelledby="scenario-title">
        <aside className="status-panel panel-surface">
          <div className="panel-heading">
            <p className="panel-kicker">Tableau de bord</p>
            <h2 id="scenario-title">{PROTOTYPE_SCENARIO.label}</h2>
            <p>{PROTOTYPE_SCENARIO.description}</p>
          </div>

          <section className="status-section" aria-labelledby="resources-title">
            <div className="section-title-row">
              <h3 id="resources-title">Ressources</h3>
              <span>{territorySummary.placedTileCount} tuiles</span>
            </div>

            <dl className="resource-grid">
              {RESOURCE_PRESENTATION.map((resource) => (
                <div
                  key={resource.key}
                  className={`resource-card resource-card--${resource.tone}`}
                >
                  <dt>
                    <span className="resource-card__badge" aria-hidden="true">
                      {resource.shortLabel}
                    </span>
                    {resource.label}
                  </dt>
                  <dd>{territorySummary.resources[resource.key]}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            className="status-section score-panel"
            aria-labelledby="score-title"
          >
            <div className="section-title-row">
              <h3 id="score-title">Objectif</h3>
              <span>{Math.round(scoreProgress)} %</span>
            </div>

            <div className="score-value-row">
              <strong>{formatScore(scoreBreakdown.totalScore)}</strong>
              <span>{formatScore(PROTOTYPE_SCENARIO.targetScore)} pts</span>
            </div>

            <div
              className="score-meter"
              role="progressbar"
              aria-label="Progression vers l'objectif de score"
              aria-valuemin={0}
              aria-valuemax={PROTOTYPE_SCENARIO.targetScore}
              aria-valuenow={Math.min(
                scoreBreakdown.totalScore,
                PROTOTYPE_SCENARIO.targetScore,
              )}
            >
              <span style={{ width: `${scoreProgress}%` }} />
            </div>

            <div className="score-details">
              <span>
                Ressources
                <strong>{formatScore(scoreBreakdown.resourceScore)}</strong>
              </span>
              <span>
                Équilibre
                <strong>+{formatScore(scoreBreakdown.balanceBonus)}</strong>
              </span>
            </div>
          </section>

          <section className="status-section status-help">
            <h3>Repères</h3>
            <p>
              Les contours violets signalent une synergie. Les contours orangés
              indiquent les tuiles compatibles avec l'amélioration sélectionnée.
            </p>
          </section>
        </aside>

        <section className="map-panel">
          <header className="map-panel__header">
            <div className="phase-indicator" aria-live="polite">
              <span>Étape {phase.index}</span>
              <div>
                <strong>{phase.title}</strong>
                <p>{phase.description}</p>
              </div>
            </div>

            <span
              className={finalTurn ? "turn-chip turn-chip--final" : "turn-chip"}
            >
              {finalTurn ? "Dernier tour" : `Tour ${turnState.number}`}
            </span>
          </header>

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
          </div>
        </section>

        <aside className="action-panel panel-surface">
          <header className="action-panel__header">
            <div>
              <p className="panel-kicker">Actions du tour</p>
              <h2>
                {finalTurn ? "Derniers choix" : `Tour ${turnState.number}`}
              </h2>
            </div>
            <span className="phase-number">{phase.index}/3</span>
          </header>

          <div className="action-panel__content">
            <section
              className="action-section"
              aria-labelledby="proposals-title"
            >
              <div className="action-section__heading">
                <span className="step-number">1</span>
                <div>
                  <h3 id="proposals-title">Choisir une tuile</h3>
                  <p>Une seule proposition peut être placée ce tour-ci.</p>
                </div>
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
                          ? "choice-button choice-button--active"
                          : "choice-button"
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
                      <span className="choice-button__index">
                        {proposalIndex + 1}
                      </span>
                      <span className="choice-button__content">
                        <strong>{definition.label}</strong>
                        <small>{resourceSummary}</small>
                      </span>
                      <span className="choice-button__state" aria-hidden="true">
                        {isSelected ? "Sélectionnée" : "Choisir"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="secondary-button"
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
                  <strong>Tourner la tuile</strong>
                  <small>
                    {selectedTileDefinition === null
                      ? "Disponible sur les tuiles orientables"
                      : `${selectedTileDefinition.label} · position ${selectedTileRotation + 1}/6`}
                  </small>
                </span>
                <span className="rotation-symbol" aria-hidden="true">
                  ↻
                </span>
              </button>
            </section>

            <section
              className="action-section"
              aria-labelledby="upgrades-title"
            >
              <div className="action-section__heading">
                <span className="step-number">2</span>
                <div>
                  <h3 id="upgrades-title">Amélioration facultative</h3>
                  <p>Disponible après le placement de la tuile.</p>
                </div>
              </div>

              <div className="upgrade-list">
                {PROTOTYPE_UPGRADE_TYPE_IDS.map((upgradeTypeId) => {
                  const definition =
                    getTerritoryUpgradeDefinition(upgradeTypeId);
                  const isSelected = selectedUpgradeTypeId === upgradeTypeId;

                  return (
                    <button
                      key={upgradeTypeId}
                      type="button"
                      className={
                        isSelected
                          ? "upgrade-button upgrade-button--active"
                          : "upgrade-button"
                      }
                      aria-pressed={isSelected}
                      disabled={
                        interactionsDisabled ||
                        !turnState.placementCompleted ||
                        turnState.improvementCompleted
                      }
                      onClick={() => {
                        setSelectedUpgradeTypeId(
                          isSelected ? null : upgradeTypeId,
                        );
                        setSelectedTileTypeId(null);
                        setSelectedTileRotation(0);
                      }}
                    >
                      <span>
                        <strong>{definition.label}</strong>
                        <small>{definition.targetLabel}</small>
                      </span>
                      <span className="upgrade-button__bonus">
                        {formatResourceSummary(definition.resourceBonus)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <footer className="action-panel__footer">
            <div>
              <span className="step-number">3</span>
              <p>
                {turnState.placementCompleted
                  ? "Le tour peut être validé."
                  : "Place d'abord une proposition."}
              </p>
            </div>
            <button
              type="button"
              className="end-turn-button"
              disabled={interactionsDisabled || !turnState.placementCompleted}
              onClick={handleEndTurn}
            >
              {finalTurn ? "Voir le bilan" : "Terminer le tour"}
            </button>
          </footer>
        </aside>
      </section>

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
            <p
              className={
                scenarioSucceeded
                  ? "game-result__status game-result__status--success"
                  : "game-result__status"
              }
            >
              {scenarioSucceeded ? "Commune réussie" : "Commune encore fragile"}
            </p>

            <div className="game-result__score">
              <strong>{formatScore(scoreBreakdown.totalScore)}</strong>
              <span>
                Objectif : {formatScore(PROTOTYPE_SCENARIO.targetScore)} points
              </span>
            </div>

            <dl className="resource-results">
              {RESOURCE_PRESENTATION.map((resource) => (
                <div key={resource.key}>
                  <dt>{resource.label}</dt>
                  <dd>{territorySummary.resources[resource.key]}</dd>
                </div>
              ))}
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
                  PROTOTYPE_SCENARIO.targetScore - scoreBreakdown.totalScore,
                )}{" "}
                points pour atteindre l'objectif.
              </p>
            ) : null}

            <button
              type="button"
              className="restart-button"
              onClick={handleRestart}
            >
              Rejouer une partie
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
