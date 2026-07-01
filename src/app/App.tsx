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

type ResourceTone = "food" | "energy" | "nature" | "happiness";

const RESOURCE_PRESENTATION = [
  {
    key: "food",
    label: "Nourriture",
    shortLabel: "NOU",
    icon: "✦",
    tone: "food",
  },
  {
    key: "energy",
    label: "Énergie",
    shortLabel: "ÉNE",
    icon: "ϟ",
    tone: "energy",
  },
  {
    key: "nature",
    label: "Nature",
    shortLabel: "NAT",
    icon: "⌁",
    tone: "nature",
  },
  {
    key: "happiness",
    label: "Bonheur",
    shortLabel: "BON",
    icon: "☀",
    tone: "happiness",
  },
] as const;

const TILE_PRESENTATION: Readonly<
  Record<
    string,
    {
      icon: string;
      subtitle: string;
      description: string;
    }
  >
> = {
  prairie: {
    icon: "✿",
    subtitle: "Milieu naturel",
    description: "Une base douce pour développer la nature et le bien-être.",
  },
  forest: {
    icon: "♠",
    subtitle: "Milieu naturel",
    description: "Renforce fortement la biodiversité du territoire.",
  },
  river: {
    icon: "≈",
    subtitle: "Réseau naturel",
    description: "Une tuile orientable qui structure le futur réseau d'eau.",
  },
  field: {
    icon: "≋",
    subtitle: "Production agricole",
    description: "Une production alimentaire efficace, mais plus intensive.",
  },
  orchard: {
    icon: "●",
    subtitle: "Production équilibrée",
    description: "Produit de la nourriture tout en soutenant la nature.",
  },
  farm: {
    icon: "⌂",
    subtitle: "Pôle agricole",
    description: "Une exploitation polyvalente au service de la commune.",
  },
};

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

function getPrimaryResourceTone(resources: TerritoryResources): ResourceTone {
  let selectedTone: ResourceTone = "nature";
  let selectedValue = Number.NEGATIVE_INFINITY;

  for (const resource of RESOURCE_PRESENTATION) {
    const value = resources[resource.key];

    if (value > selectedValue) {
      selectedValue = value;
      selectedTone = resource.tone;
    }
  }

  return selectedTone;
}

function getResourceEntries(resources: TerritoryResources) {
  return RESOURCE_PRESENTATION.filter(
    (resource) => resources[resource.key] !== 0,
  ).map((resource) => ({
    ...resource,
    value: resources[resource.key],
  }));
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

  const phase = !turnState.placementCompleted
    ? {
        index: 1,
        title: "Choisis une tuile",
        description:
          "Compare les trois propositions, puis place ton choix sur la carte.",
      }
    : !turnState.improvementCompleted
      ? {
          index: 2,
          title: "Amélioration facultative",
          description:
            "Choisis une amélioration compatible ou termine directement le tour.",
        }
      : {
          index: 3,
          title: "Tour prêt",
          description:
            "Ton action est terminée. Tu peux maintenant passer au tour suivant.",
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

        <div className="commune-title">
          <span>Commune pilote</span>
          <strong>{PROTOTYPE_SCENARIO.label}</strong>
        </div>

        <dl className="header-resources" aria-label="Ressources de la commune">
          {RESOURCE_PRESENTATION.map((resource) => (
            <div
              key={resource.key}
              className={`header-resource header-resource--${resource.tone}`}
            >
              <dt>
                <span aria-hidden="true">{resource.icon}</span>
                {resource.label}
              </dt>
              <dd>{territorySummary.resources[resource.key]}</dd>
            </div>
          ))}
        </dl>

        <div className="header-progress" aria-label="Progression de la partie">
          <div>
            <span>Tour</span>
            <strong>
              {turnState.number}
              <small> / {PROTOTYPE_SCENARIO.maximumTurns}</small>
            </strong>
          </div>
          <div>
            <span>Score</span>
            <strong>
              {formatScore(scoreBreakdown.totalScore)}
              <small> / {formatScore(PROTOTYPE_SCENARIO.targetScore)}</small>
            </strong>
          </div>
        </div>
      </header>

      <section className="game-layout">
        <aside className="dashboard-panel">
          <header>
            <p className="panel-kicker">Tableau de bord</p>
            <h2>{PROTOTYPE_SCENARIO.label}</h2>
            <p>{PROTOTYPE_SCENARIO.description}</p>
          </header>

          <section className="dashboard-section">
            <div className="section-heading">
              <h3>Ressources</h3>
              <span>{territorySummary.placedTileCount} tuiles</span>
            </div>

            <dl className="dashboard-resources">
              {RESOURCE_PRESENTATION.map((resource) => (
                <div
                  key={resource.key}
                  className={`dashboard-resource dashboard-resource--${resource.tone}`}
                >
                  <dt>
                    <span aria-hidden="true">{resource.icon}</span>
                    {resource.label}
                  </dt>
                  <dd>{territorySummary.resources[resource.key]}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="dashboard-section dashboard-score">
            <div className="section-heading">
              <h3>Objectif</h3>
              <span>{Math.round(scoreProgress)} %</span>
            </div>
            <strong>{formatScore(scoreBreakdown.totalScore)}</strong>
            <small>
              sur {formatScore(PROTOTYPE_SCENARIO.targetScore)} points
            </small>
            <div
              className="progress-meter"
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
            <div className="score-split">
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

          <section className="dashboard-section dashboard-help">
            <h3>Repères</h3>
            <p>
              Les contours colorés indiquent les placements possibles, synergies
              et améliorations compatibles.
            </p>
          </section>
        </aside>

        <section className="map-panel" aria-labelledby="map-title">
          <header className="map-panel__header">
            <div className="phase-summary">
              <span>{phase.index}</span>
              <div>
                <p>Étape en cours</p>
                <strong id="map-title">{phase.title}</strong>
                <small>{phase.description}</small>
              </div>
            </div>

            <div className="map-badges">
              <span>{territorySummary.placedTileCount} tuiles</span>
              <span className={finalTurn ? "map-badge--final" : undefined}>
                {finalTurn ? "Dernier tour" : `Tour ${turnState.number}`}
              </span>
            </div>
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

        <aside className="actions-panel">
          <header>
            <div>
              <p className="panel-kicker">Actions du tour</p>
              <h2>
                {finalTurn ? "Derniers choix" : `Tour ${turnState.number}`}
              </h2>
            </div>
            <span>{phase.index}/3</span>
          </header>

          <div className="actions-panel__body">
            <section className="step-card">
              <div className="step-card__heading">
                <span>1</span>
                <div>
                  <strong>Choisir une tuile</strong>
                  <small>Utilise les grandes cartes sous la map.</small>
                </div>
              </div>

              {selectedTileDefinition === null ? (
                <p className="selection-placeholder">
                  Aucune proposition sélectionnée.
                </p>
              ) : (
                <div className="selected-tile-summary">
                  <span aria-hidden="true">
                    {TILE_PRESENTATION[selectedTileTypeId ?? ""]?.icon ?? "⬡"}
                  </span>
                  <div>
                    <strong>{selectedTileDefinition.label}</strong>
                    <small>
                      {formatResourceSummary(
                        selectedTileDefinition.baseResources,
                      )}
                    </small>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="secondary-action"
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
                <span aria-hidden="true">↻</span>
                <span>
                  <strong>Tourner la tuile</strong>
                  <small>
                    {rotationEnabled
                      ? `Position ${selectedTileRotation + 1}/6`
                      : "Disponible pour les tuiles orientables"}
                  </small>
                </span>
              </button>
            </section>

            <section className="step-card step-card--upgrades">
              <div className="step-card__heading">
                <span>2</span>
                <div>
                  <strong>Amélioration facultative</strong>
                  <small>Disponible après le placement.</small>
                </div>
              </div>

              <div className="upgrade-list">
                {PROTOTYPE_UPGRADE_TYPE_IDS.map((upgradeTypeId) => {
                  const definition =
                    getTerritoryUpgradeDefinition(upgradeTypeId);
                  const isSelected = selectedUpgradeTypeId === upgradeTypeId;
                  const tone = getPrimaryResourceTone(definition.resourceBonus);

                  return (
                    <button
                      key={upgradeTypeId}
                      type="button"
                      className={`upgrade-action upgrade-action--${tone}${
                        isSelected ? " upgrade-action--selected" : ""
                      }`}
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
                      <span aria-hidden="true">
                        {tone === "food"
                          ? "✦"
                          : tone === "energy"
                            ? "ϟ"
                            : tone === "happiness"
                              ? "☀"
                              : "⌁"}
                      </span>
                      <span>
                        <strong>{definition.label}</strong>
                        <small>
                          {definition.targetLabel} ·{" "}
                          {formatResourceSummary(definition.resourceBonus)}
                        </small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <footer>
            <div className="finish-copy">
              <span>3</span>
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
              <span aria-hidden="true">→</span>
            </button>
          </footer>
        </aside>

        <section className="proposal-deck" aria-labelledby="proposals-title">
          <header className="proposal-deck__header">
            <div>
              <p className="panel-kicker">Propositions de tuiles</p>
              <h2 id="proposals-title">
                Choisis la prochaine évolution de la commune
              </h2>
            </div>
            <p>
              Compare les effets, sélectionne une carte, puis place-la sur une
              case valide.
            </p>
          </header>

          <div className="proposal-grid">
            {proposals.map((tileTypeId, proposalIndex) => {
              const definition = getTerritoryTileDefinition(tileTypeId);
              const presentation = TILE_PRESENTATION[tileTypeId] ?? {
                icon: "⬡",
                subtitle: "Tuile",
                description: "Une nouvelle possibilité pour la commune.",
              };
              const resourceEntries = getResourceEntries(
                definition.baseResources,
              );
              const isSelected = selectedTileTypeId === tileTypeId;

              return (
                <button
                  key={`${turnState.number}:${proposalIndex}:${tileTypeId}`}
                  type="button"
                  className={`proposal-card proposal-card--${tileTypeId}${
                    isSelected ? " proposal-card--selected" : ""
                  }`}
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
                  <span className="proposal-card__number">
                    {proposalIndex + 1}
                  </span>
                  {isSelected ? (
                    <span className="proposal-card__selected">
                      ✓ Sélectionnée
                    </span>
                  ) : null}

                  <span className="proposal-card__visual" aria-hidden="true">
                    <span>{presentation.icon}</span>
                  </span>

                  <span className="proposal-card__body">
                    <span className="proposal-card__type">
                      {presentation.subtitle}
                    </span>
                    <strong>{definition.label}</strong>
                    <small>{presentation.description}</small>
                  </span>

                  <span className="proposal-card__effects">
                    <span>Effets immédiats</span>
                    <span className="proposal-card__resources">
                      {resourceEntries.map((resource) => (
                        <span
                          key={resource.key}
                          className={`proposal-resource proposal-resource--${resource.tone}`}
                        >
                          <span aria-hidden="true">{resource.icon}</span>
                          <small>{resource.label}</small>
                          <strong>
                            {resource.value > 0 ? "+" : ""}
                            {resource.value}
                          </strong>
                        </span>
                      ))}
                    </span>
                  </span>

                  <span className="proposal-card__cta">
                    {isSelected ? "Tuile sélectionnée" : "Choisir cette tuile"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
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
