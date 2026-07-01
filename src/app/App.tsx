import { useRef, useState } from "react";

import { prototypeBoardCells } from "../content/prototypeBoard";
import { PROTOTYPE_SCENARIO } from "../content/prototypeScenario";
import { getPrototypeTurnProposals } from "../content/prototypeTurnProposals";
import { TERRITORY_SYNERGY_DEFINITIONS } from "../content/territorySynergyDefinitions";
import { getTerritoryTileDefinition } from "../content/territoryTileDefinitions";
import {
  getTerritoryUpgradeDefinition,
  PROTOTYPE_UPGRADE_TYPE_IDS,
} from "../content/territoryUpgradeDefinitions";
import { getNextHexRotation, type HexRotation } from "../engine/hex";
import {
  canSpendImprovementPoints,
  createInitialImprovementPoints,
  getNextImprovementPointGrantTurn,
  grantImprovementPointsForTurn,
  spendImprovementPoints,
} from "../engine/improvementPoints";
import {
  createEmptyTerritoryResources,
  type TerritoryResources,
} from "../engine/resources";
import { calculateTerritoryScore } from "../engine/score";
import {
  createInitialScenarioObjectiveState,
  getScenarioObjectiveProgress,
  isScenarioContractCompleted,
  recordScenarioObjectivePlacement,
  updateScenarioObjectiveState,
  type TerritoryScenarioObjectiveState,
} from "../engine/scenarioObjectives";
import {
  createInitialSettlementLevelIndex,
  getSettlementProgress,
  getUnlockedSettlementLevelIndex,
} from "../engine/settlementProgression";
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
  TerritoryPlacementPreviewChangedPayload,
  TerritorySummaryChangedPayload,
  TerritoryTilePlacedPayload,
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

const RIVER_SYNERGY_LABELS: Readonly<Record<string, string>> = {
  "protected-water": "Eau protégée",
  "field-irrigation": "Irrigation",
};

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

function formatPointCost(cost: number): string {
  return `${cost} pt${cost > 1 ? "s" : ""}`;
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
  const initialTerritorySummary = createEmptyTerritorySummary();
  const territorySummaryRef = useRef(initialTerritorySummary);
  const [territorySummary, setTerritorySummary] =
    useState<TerritorySummaryChangedPayload>(initialTerritorySummary);
  const [placementPreview, setPlacementPreview] =
    useState<TerritoryPlacementPreviewChangedPayload>(null);
  const [improvementPoints, setImprovementPoints] = useState(() =>
    createInitialImprovementPoints(PROTOTYPE_SCENARIO.improvements),
  );
  const initialSettlementLevelIndex = createInitialSettlementLevelIndex(
    PROTOTYPE_SCENARIO.settlementProgression,
  );
  const settlementLevelIndexRef = useRef(initialSettlementLevelIndex);
  const [settlementLevelIndex, setSettlementLevelIndex] = useState(
    initialSettlementLevelIndex,
  );
  const [settlementAnnouncement, setSettlementAnnouncement] = useState<
    string | null
  >(null);
  const initialObjectiveState = createInitialScenarioObjectiveState();
  const objectiveStateRef = useRef<TerritoryScenarioObjectiveState>(
    initialObjectiveState,
  );
  const [objectiveState, setObjectiveState] =
    useState<TerritoryScenarioObjectiveState>(initialObjectiveState);
  const [objectiveAnnouncement, setObjectiveAnnouncement] = useState<
    string | null
  >(null);

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
  const interactionsDisabled = gameCompleted;
  const scoreProgress = Math.min(
    100,
    Math.max(
      0,
      (scoreBreakdown.totalScore / PROTOTYPE_SCENARIO.targetScore) * 100,
    ),
  );
  const nextImprovementPointTurn = getNextImprovementPointGrantTurn(
    turnState.number,
    PROTOTYPE_SCENARIO.improvements,
  );
  const nextImprovementPointLabel =
    nextImprovementPointTurn === null
      ? "Aucun nouveau point prévu"
      : `+${PROTOTYPE_SCENARIO.improvements.pointsPerGrant} au tour ${nextImprovementPointTurn}`;
  const settlementProgress = getSettlementProgress(
    settlementLevelIndex,
    territorySummary.placedTileCount,
    territorySummary.resources,
    PROTOTYPE_SCENARIO.settlementProgression,
  );
  const currentSettlementLevel = settlementProgress.currentLevel;
  const settlementResourceRequirements = RESOURCE_PRESENTATION.flatMap(
    (resource) => {
      const requirement = settlementProgress.resources?.[resource.key];

      if (requirement === undefined || requirement.target === 0) {
        return [];
      }

      return [{ ...resource, requirement }];
    },
  );
  const objectiveProgress = getScenarioObjectiveProgress(
    objectiveState,
    {
      settlementLevelIndex,
      resources: territorySummary.resources,
    },
    PROTOTYPE_SCENARIO.contract,
  );
  const completedObjectiveCount = objectiveProgress.filter(
    (objective) => objective.completed,
  ).length;
  const scenarioSucceeded = isScenarioContractCompleted(
    objectiveState,
    PROTOTYPE_SCENARIO.contract,
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
            improvementPoints > 0
              ? "Dépense des points maintenant ou conserve-les pour un prochain tour."
              : "Tu n'as plus de point disponible : termine le tour pour continuer.",
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
    setPlacementPreview(null);
  }

  function synchronizeObjectives(
    candidateState: TerritoryScenarioObjectiveState,
    summary: TerritorySummaryChangedPayload,
    levelIndex: number,
  ): void {
    const result = updateScenarioObjectiveState(
      candidateState,
      {
        settlementLevelIndex: levelIndex,
        resources: summary.resources,
      },
      PROTOTYPE_SCENARIO.contract,
    );

    objectiveStateRef.current = result.state;
    setObjectiveState(result.state);

    if (result.newlyCompletedObjectiveIds.length === 0) {
      return;
    }

    const completedLabels = result.newlyCompletedObjectiveIds
      .map(
        (objectiveId) =>
          PROTOTYPE_SCENARIO.contract.objectives.find(
            (objective) => objective.id === objectiveId,
          )?.label,
      )
      .filter((label) => label !== undefined);

    if (completedLabels.length > 0) {
      setObjectiveAnnouncement(
        completedLabels.length === 1
          ? `Objectif accompli : ${completedLabels[0]}`
          : `Objectifs accomplis : ${completedLabels.join(" · ")}`,
      );
    }
  }

  function handleTerritorySummaryChanged(
    nextSummary: TerritorySummaryChangedPayload,
  ): void {
    territorySummaryRef.current = nextSummary;
    setTerritorySummary(nextSummary);

    const previousLevelIndex = settlementLevelIndexRef.current;
    const nextLevelIndex = getUnlockedSettlementLevelIndex(
      previousLevelIndex,
      nextSummary.placedTileCount,
      nextSummary.resources,
      PROTOTYPE_SCENARIO.settlementProgression,
    );

    if (nextLevelIndex > previousLevelIndex) {
      settlementLevelIndexRef.current = nextLevelIndex;
      setSettlementLevelIndex(nextLevelIndex);

      const nextLevel =
        PROTOTYPE_SCENARIO.settlementProgression.levels[nextLevelIndex];

      if (nextLevel !== undefined) {
        setSettlementAnnouncement(`Le bourg devient ${nextLevel.label} !`);
      }
    }

    synchronizeObjectives(
      objectiveStateRef.current,
      nextSummary,
      nextLevelIndex,
    );
  }

  function handleTilePlaced(payload: TerritoryTilePlacedPayload): void {
    const placedCell = prototypeBoardCells.find(
      (cell) => cell.id === payload.cellId,
    );
    const nextObjectiveState =
      placedCell === undefined
        ? objectiveStateRef.current
        : recordScenarioObjectivePlacement(
            objectiveStateRef.current,
            placedCell,
            payload.tileTypeId,
            TERRITORY_SYNERGY_DEFINITIONS,
          );

    synchronizeObjectives(
      nextObjectiveState,
      territorySummaryRef.current,
      settlementLevelIndexRef.current,
    );
    setTurnState((currentState) => markPlacementCompleted(currentState));
    clearSelections();
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

    const nextTurnState = endTurn(turnState);
    setTurnState(nextTurnState);
    setSettlementAnnouncement(null);
    setObjectiveAnnouncement(null);
    setImprovementPoints((currentPoints) =>
      grantImprovementPointsForTurn(
        currentPoints,
        nextTurnState.number,
        PROTOTYPE_SCENARIO.improvements,
      ),
    );
    clearSelections();
  }

  function handleRestart(): void {
    setGameRunId((currentId) => currentId + 1);
    setGameCompleted(false);
    setTurnState(createInitialTurnState());
    const emptySummary = createEmptyTerritorySummary();
    territorySummaryRef.current = emptySummary;
    setTerritorySummary(emptySummary);
    settlementLevelIndexRef.current = initialSettlementLevelIndex;
    setSettlementLevelIndex(initialSettlementLevelIndex);
    setSettlementAnnouncement(null);
    const emptyObjectiveState = createInitialScenarioObjectiveState();
    objectiveStateRef.current = emptyObjectiveState;
    setObjectiveState(emptyObjectiveState);
    setObjectiveAnnouncement(null);
    setImprovementPoints(
      createInitialImprovementPoints(PROTOTYPE_SCENARIO.improvements),
    );
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
              <small> points</small>
            </strong>
          </div>
          <div className="header-improvement-points">
            <span>Aménagement</span>
            <strong>
              {improvementPoints}
              <small> pt{improvementPoints === 1 ? "" : "s"}</small>
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

          <section className="dashboard-section improvement-budget-card">
            <div className="section-heading">
              <h3>Aménagement</h3>
              <span>{improvementPoints} disponibles</span>
            </div>
            <strong>{improvementPoints}</strong>
            <small>points conservés d'un tour à l'autre</small>
            <p>{nextImprovementPointLabel}</p>
          </section>

          <section className="dashboard-section territory-contract-card">
            <div className="section-heading">
              <h3>{PROTOTYPE_SCENARIO.contract.label}</h3>
              <span>
                {completedObjectiveCount}/
                {PROTOTYPE_SCENARIO.contract.objectives.length}
              </span>
            </div>

            <p className="territory-contract-card__description">
              {PROTOTYPE_SCENARIO.contract.description}
            </p>

            <div
              className="territory-contract-track"
              aria-label={`${completedObjectiveCount} objectifs validés sur ${PROTOTYPE_SCENARIO.contract.objectives.length}`}
            >
              {PROTOTYPE_SCENARIO.contract.objectives.map((objective) => (
                <span
                  key={objective.id}
                  className={
                    objectiveState.completedObjectiveIds.includes(objective.id)
                      ? "territory-contract-track__step territory-contract-track__step--done"
                      : "territory-contract-track__step"
                  }
                />
              ))}
            </div>

            {settlementAnnouncement !== null ? (
              <p
                className="settlement-announcement"
                role="status"
                aria-live="polite"
              >
                ✦ {settlementAnnouncement}
              </p>
            ) : null}

            {objectiveAnnouncement !== null ? (
              <p
                className="objective-announcement"
                role="status"
                aria-live="polite"
              >
                ✦ {objectiveAnnouncement}
              </p>
            ) : null}

            <div className="territory-objective-list">
              {objectiveProgress.map((objective) => (
                <article
                  key={objective.id}
                  className={`territory-objective${
                    objective.completed ? " territory-objective--done" : ""
                  }`}
                >
                  <span
                    className="territory-objective__icon"
                    aria-hidden="true"
                  >
                    {objective.completed ? "✓" : objective.icon}
                  </span>
                  <div className="territory-objective__content">
                    <div className="territory-objective__heading">
                      <strong>{objective.label}</strong>
                      <span>{objective.completed ? "Validé" : "En cours"}</span>
                    </div>
                    <small>{objective.description}</small>

                    {objective.kind === "settlement-level" ? (
                      <div className="territory-objective__summary">
                        <span>{currentSettlementLevel.label}</span>
                        <strong>
                          {Math.min(
                            objective.currentLevelIndex + 1,
                            objective.targetLevelIndex + 1,
                          )}
                          /{objective.targetLevelIndex + 1}
                        </strong>
                      </div>
                    ) : null}

                    {objective.kind === "settlement-level" &&
                    settlementProgress.nextLevel !== null &&
                    settlementProgress.playerPlacedTileCount !== null ? (
                      <div className="objective-resource-grid objective-resource-grid--settlement">
                        <span
                          className={
                            settlementProgress.playerPlacedTileCount.reached
                              ? "objective-resource objective-resource--done"
                              : "objective-resource"
                          }
                        >
                          <small>TUI</small>
                          <strong>
                            {settlementProgress.playerPlacedTileCount.current}/
                            {settlementProgress.playerPlacedTileCount.target}
                          </strong>
                        </span>
                        {settlementResourceRequirements.map(
                          ({ key, shortLabel, requirement }) => (
                            <span
                              key={key}
                              className={
                                requirement.reached
                                  ? "objective-resource objective-resource--done"
                                  : "objective-resource"
                              }
                            >
                              <small>{shortLabel}</small>
                              <strong>
                                {requirement.current}/{requirement.target}
                              </strong>
                            </span>
                          ),
                        )}
                      </div>
                    ) : null}

                    {objective.kind === "resource-balance" ? (
                      <div className="objective-resource-grid">
                        {RESOURCE_PRESENTATION.map((resource) => {
                          const requirement = objective.resources[resource.key];

                          return (
                            <span
                              key={resource.key}
                              className={
                                requirement.reached
                                  ? "objective-resource objective-resource--done"
                                  : "objective-resource"
                              }
                            >
                              <small>{resource.shortLabel}</small>
                              <strong>
                                {requirement.current}/{requirement.target}
                              </strong>
                            </span>
                          );
                        })}
                      </div>
                    ) : null}

                    {objective.kind === "synergy-collection" ? (
                      <div className="objective-synergy-progress">
                        <div className="objective-synergy-progress__requirements">
                          {objective.requirements.map((requirement) => (
                            <span
                              key={requirement.definitionId}
                              className={
                                requirement.reached
                                  ? "objective-synergy-chip objective-synergy-chip--done"
                                  : "objective-synergy-chip"
                              }
                            >
                              {RIVER_SYNERGY_LABELS[requirement.definitionId] ??
                                requirement.definitionId}
                              <strong>
                                {requirement.current}/{requirement.target}
                              </strong>
                            </span>
                          ))}
                        </div>
                        <span className="objective-synergy-total">
                          Synergies fluviales
                          <strong>
                            {objective.currentTotalCount}/
                            {objective.totalRequiredCount}
                          </strong>
                        </span>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            {scenarioSucceeded ? (
              <p className="territory-contract-complete">
                Contrat rempli. Continue jusqu'au dernier tour pour optimiser
                ton score.
              </p>
            ) : null}
          </section>

          <details className="dashboard-section performance-details">
            <summary>
              <span>Performance et score</span>
              <strong>{formatScore(scoreBreakdown.totalScore)}</strong>
            </summary>
            <div className="performance-details__content">
              <div
                className="progress-meter"
                role="progressbar"
                aria-label="Progression vers le score de référence"
                aria-valuemin={0}
                aria-valuemax={PROTOTYPE_SCENARIO.targetScore}
                aria-valuenow={Math.min(
                  scoreBreakdown.totalScore,
                  PROTOTYPE_SCENARIO.targetScore,
                )}
              >
                <span style={{ width: `${scoreProgress}%` }} />
              </div>
              <p>
                Référence : {formatScore(PROTOTYPE_SCENARIO.targetScore)} points
              </p>
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
            </div>
          </details>

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
              <span>{improvementPoints} pts d'aménagement</span>
              <span>{currentSettlementLevel.label}</span>
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
              onTilePlaced={handleTilePlaced}
              selectedUpgradeTypeId={selectedUpgradeTypeId}
              improvementEnabled={
                !interactionsDisabled &&
                turnState.placementCompleted &&
                !turnState.improvementCompleted
              }
              onUpgradeApplied={(payload) => {
                const definition = getTerritoryUpgradeDefinition(
                  payload.upgradeTypeId,
                );
                setImprovementPoints((currentPoints) =>
                  spendImprovementPoints(currentPoints, definition.cost),
                );
                setTurnState((currentState) =>
                  markImprovementCompleted(currentState),
                );
                setSelectedUpgradeTypeId(null);
                setSelectedTileRotation(0);
              }}
              selectedTileRotation={selectedTileRotation}
              onTerritorySummaryChanged={handleTerritorySummaryChanged}
              onPlacementPreviewChanged={setPlacementPreview}
              settlementLevel={{
                id: currentSettlementLevel.id,
                label: currentSettlementLevel.label,
                levelIndex: settlementLevelIndex,
              }}
            />

            {placementPreview !== null ? (
              <aside
                className={`placement-preview-banner${
                  placementPreview.valid
                    ? ""
                    : " placement-preview-banner--invalid"
                }`}
                aria-live="polite"
              >
                <span
                  className="placement-preview-banner__icon"
                  aria-hidden="true"
                >
                  {placementPreview.valid ? "✦" : "!"}
                </span>
                <span className="placement-preview-banner__content">
                  <small>
                    {placementPreview.synergyLabels.length > 0
                      ? "Synergie au placement"
                      : placementPreview.valid
                        ? "Aperçu du placement"
                        : "Placement impossible"}
                  </small>
                  <strong>
                    {placementPreview.synergyLabels.length > 0
                      ? placementPreview.synergyLabels.join(" · ")
                      : placementPreview.message}
                  </strong>
                </span>
              </aside>
            ) : null}
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
            <section
              className={`step-card${
                turnState.placementCompleted ? " step-card--complete" : ""
              }`}
            >
              <div className="step-card__heading">
                <span>{turnState.placementCompleted ? "✓" : "1"}</span>
                <div>
                  <strong>Choisir une tuile</strong>
                  <small>
                    {turnState.placementCompleted
                      ? "Placement réalisé pour ce tour."
                      : "Utilise les grandes cartes sous la map."}
                  </small>
                </div>
              </div>

              {!turnState.placementCompleted ? (
                <>
                  {selectedTileDefinition === null ? (
                    <p className="selection-placeholder">
                      Aucune proposition sélectionnée.
                    </p>
                  ) : (
                    <div className="selected-tile-summary">
                      <span aria-hidden="true">
                        {TILE_PRESENTATION[selectedTileTypeId ?? ""]?.icon ??
                          "⬡"}
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
                    disabled={interactionsDisabled || !rotationEnabled}
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
                </>
              ) : null}
            </section>

            <section
              className={`step-card step-card--upgrades${
                turnState.improvementCompleted ? " step-card--complete" : ""
              }`}
            >
              <div className="step-card__heading">
                <span>{turnState.improvementCompleted ? "✓" : "2"}</span>
                <div>
                  <strong>Amélioration facultative</strong>
                  <small>
                    {turnState.improvementCompleted
                      ? "Amélioration réalisée pour ce tour."
                      : turnState.placementCompleted
                        ? `${improvementPoints} point${
                            improvementPoints === 1 ? "" : "s"
                          } disponible${
                            improvementPoints === 1 ? "" : "s"
                          } · ${nextImprovementPointLabel}`
                        : "Disponible après le placement."}
                  </small>
                </div>
              </div>

              {!turnState.placementCompleted ? (
                <p className="step-card__locked">
                  Pose d'abord une tuile pour débloquer les améliorations.
                </p>
              ) : !turnState.improvementCompleted ? (
                <div className="upgrade-list">
                  {PROTOTYPE_UPGRADE_TYPE_IDS.map((upgradeTypeId) => {
                    const definition =
                      getTerritoryUpgradeDefinition(upgradeTypeId);
                    const isSelected = selectedUpgradeTypeId === upgradeTypeId;
                    const tone = getPrimaryResourceTone(
                      definition.resourceBonus,
                    );
                    const affordable = canSpendImprovementPoints(
                      improvementPoints,
                      definition.cost,
                    );

                    return (
                      <button
                        key={upgradeTypeId}
                        type="button"
                        className={`upgrade-action upgrade-action--${tone}${
                          isSelected ? " upgrade-action--selected" : ""
                        }`}
                        aria-pressed={isSelected}
                        aria-label={`${definition.label}, coût ${formatPointCost(
                          definition.cost,
                        )}`}
                        disabled={interactionsDisabled || !affordable}
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
                        <span className="upgrade-action__copy">
                          <span className="upgrade-action__title-row">
                            <strong>{definition.label}</strong>
                            <em>{formatPointCost(definition.cost)}</em>
                          </span>
                          <small>
                            {definition.targetLabel} ·{" "}
                            {formatResourceSummary(definition.resourceBonus)}
                          </small>
                          {!affordable ? (
                            <small className="upgrade-action__unavailable">
                              Points insuffisants
                            </small>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </section>
          </div>

          <footer>
            <div className="finish-copy">
              <span>3</span>
              <p>
                {turnState.placementCompleted
                  ? "Le tour peut être validé. Les points non dépensés sont conservés."
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
                  key={`${turnState.number}-${tileTypeId}`}
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
            <p className="panel-kicker">Bilan de la commune</p>
            <h2 id="result-title">{PROTOTYPE_SCENARIO.label}</h2>
            <p
              className={`game-result__status${
                scenarioSucceeded ? " game-result__status--success" : ""
              }`}
            >
              {scenarioSucceeded ? "Commune accomplie" : "Contrat incomplet"}
            </p>

            <div className="game-result__objectives">
              {objectiveProgress.map((objective) => (
                <div
                  key={objective.id}
                  className={
                    objective.completed
                      ? "game-result-objective game-result-objective--done"
                      : "game-result-objective"
                  }
                >
                  <span aria-hidden="true">
                    {objective.completed ? "✓" : objective.icon}
                  </span>
                  <div>
                    <strong>{objective.label}</strong>
                    <small>
                      {objective.completed ? "Objectif validé" : "Non atteint"}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            <p className="game-result__score">
              <strong>{formatScore(scoreBreakdown.totalScore)}</strong>
              <span>Score de performance</span>
            </p>
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
            <p className="game-result__hint">
              Niveau du bourg atteint : {currentSettlementLevel.label}
            </p>
            <p className="game-result__hint">
              Points d'aménagement restants : {improvementPoints}
            </p>
            {!scenarioSucceeded ? (
              <p className="game-result__hint game-result__hint--warning">
                {completedObjectiveCount} objectif
                {completedObjectiveCount === 1 ? "" : "s"} validé
                {completedObjectiveCount === 1 ? "" : "s"} sur{" "}
                {PROTOTYPE_SCENARIO.contract.objectives.length}.
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
