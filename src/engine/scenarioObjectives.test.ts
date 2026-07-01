import { describe, expect, it } from "vitest";

import type { BoardCell } from "./board";
import type { TerritoryAdjacencySynergyDefinition } from "./synergies";
import {
  createInitialScenarioObjectiveState,
  getScenarioObjectiveProgress,
  isScenarioContractCompleted,
  recordScenarioObjectivePlacement,
  updateScenarioObjectiveState,
  type TerritoryScenarioContractDefinition,
} from "./scenarioObjectives";

const CONTRACT: TerritoryScenarioContractDefinition = {
  label: "Contrat de territoire",
  description: "Trois objectifs complémentaires.",
  objectives: [
    {
      id: "development",
      kind: "settlement-level",
      icon: "⌂",
      label: "Développement",
      description: "Faire évoluer le bourg.",
      targetLevelIndex: 2,
      targetLabel: "Cœur métropolitain",
    },
    {
      id: "balance",
      kind: "resource-balance",
      icon: "⚖",
      label: "Équilibre",
      description: "Atteindre tous les besoins.",
      targets: {
        food: 35,
        energy: 6,
        nature: 35,
        happiness: 20,
      },
    },
    {
      id: "river",
      kind: "synergy-collection",
      icon: "≈",
      label: "Fleuve",
      description: "Valoriser les berges.",
      requiredDefinitionCounts: {
        "protected-water": 1,
        "field-irrigation": 1,
      },
      totalRequiredCount: 3,
    },
  ],
};

const SYNERGIES: TerritoryAdjacencySynergyDefinition[] = [
  {
    id: "protected-water",
    kind: "edge-feature",
    label: "Eau protégée",
    tileTypeId: "forest",
    edgeFeatureKind: "river",
    resourceBonus: { food: 0, energy: 0, nature: 2, happiness: 0 },
  },
  {
    id: "field-irrigation",
    kind: "edge-feature",
    label: "Irrigation",
    tileTypeId: "field",
    edgeFeatureKind: "river",
    resourceBonus: { food: 2, energy: 0, nature: 0, happiness: 0 },
  },
];

const RIVER_CELL: BoardCell = {
  id: "0:0",
  q: 0,
  r: 0,
  edgeFeatures: {
    0: [{ kind: "river" }],
    1: [{ kind: "river" }],
  },
};

const LAND_CELL: BoardCell = {
  id: "1:0",
  q: 1,
  r: 0,
  edgeFeatures: {},
};

const EMPTY_CONTEXT = {
  settlementLevelIndex: 0,
  resources: { food: 0, energy: 0, nature: 0, happiness: 0 },
};

describe("scenario objectives", () => {
  it("crée un contrat sans objectif validé", () => {
    const state = createInitialScenarioObjectiveState();

    expect(state.completedObjectiveIds).toEqual([]);
    expect(isScenarioContractCompleted(state, CONTRACT)).toBe(false);
  });

  it("compte une synergie de berge une seule fois par placement", () => {
    const state = recordScenarioObjectivePlacement(
      createInitialScenarioObjectiveState(),
      RIVER_CELL,
      "forest",
      SYNERGIES,
    );

    expect(state.synergyDefinitionCounts).toEqual({
      "protected-water": 1,
    });
  });

  it("ignore une tuile qui ne touche pas le fleuve", () => {
    const initialState = createInitialScenarioObjectiveState();
    const state = recordScenarioObjectivePlacement(
      initialState,
      LAND_CELL,
      "field",
      SYNERGIES,
    );

    expect(state).toBe(initialState);
  });

  it("valide le développement au niveau cible", () => {
    const result = updateScenarioObjectiveState(
      createInitialScenarioObjectiveState(),
      { ...EMPTY_CONTEXT, settlementLevelIndex: 2 },
      CONTRACT,
    );

    expect(result.newlyCompletedObjectiveIds).toContain("development");
  });

  it("demande les quatre ressources simultanément", () => {
    const almostBalanced = updateScenarioObjectiveState(
      createInitialScenarioObjectiveState(),
      {
        settlementLevelIndex: 0,
        resources: { food: 35, energy: 6, nature: 35, happiness: 19 },
      },
      CONTRACT,
    );

    expect(almostBalanced.state.completedObjectiveIds).not.toContain("balance");

    const balanced = updateScenarioObjectiveState(
      almostBalanced.state,
      {
        settlementLevelIndex: 0,
        resources: { food: 35, energy: 6, nature: 35, happiness: 20 },
      },
      CONTRACT,
    );

    expect(balanced.state.completedObjectiveIds).toContain("balance");
  });

  it("conserve un objectif déjà validé", () => {
    const balanced = updateScenarioObjectiveState(
      createInitialScenarioObjectiveState(),
      {
        settlementLevelIndex: 0,
        resources: { food: 35, energy: 6, nature: 35, happiness: 20 },
      },
      CONTRACT,
    );
    const afterDecrease = updateScenarioObjectiveState(
      balanced.state,
      EMPTY_CONTEXT,
      CONTRACT,
    );

    expect(afterDecrease.state.completedObjectiveIds).toContain("balance");
    expect(afterDecrease.newlyCompletedObjectiveIds).toEqual([]);
  });

  it("exige les deux synergies fluviales et trois occurrences au total", () => {
    let state = createInitialScenarioObjectiveState();
    state = recordScenarioObjectivePlacement(
      state,
      RIVER_CELL,
      "forest",
      SYNERGIES,
    );
    state = recordScenarioObjectivePlacement(
      state,
      RIVER_CELL,
      "field",
      SYNERGIES,
    );

    let result = updateScenarioObjectiveState(state, EMPTY_CONTEXT, CONTRACT);
    expect(result.state.completedObjectiveIds).not.toContain("river");

    state = recordScenarioObjectivePlacement(
      result.state,
      RIVER_CELL,
      "forest",
      SYNERGIES,
    );
    result = updateScenarioObjectiveState(state, EMPTY_CONTEXT, CONTRACT);

    expect(result.state.completedObjectiveIds).toContain("river");
  });

  it("expose une progression détaillée pour l'interface", () => {
    const progress = getScenarioObjectiveProgress(
      createInitialScenarioObjectiveState(),
      {
        settlementLevelIndex: 1,
        resources: { food: 35, energy: 4, nature: 35, happiness: 20 },
      },
      CONTRACT,
    );
    const balance = progress.find((objective) => objective.id === "balance");

    expect(balance).toMatchObject({
      kind: "resource-balance",
      reachedResourceCount: 3,
      resourceCount: 4,
    });
  });
});
