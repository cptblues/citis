import type { TerritoryTileTypeId } from "./board";
import type { BoardCell } from "./board";
import type { TerritoryResources } from "./resources";
import type {
  TerritoryAdjacencySynergyDefinition,
  TerritoryEdgeFeatureSynergyDefinition,
} from "./synergies";

export interface TerritoryScenarioObjectiveBaseDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface TerritorySettlementObjectiveDefinition extends TerritoryScenarioObjectiveBaseDefinition {
  kind: "settlement-level";
  targetLevelIndex: number;
  targetLabel: string;
}

export interface TerritoryResourceBalanceObjectiveDefinition extends TerritoryScenarioObjectiveBaseDefinition {
  kind: "resource-balance";
  targets: TerritoryResources;
}

export interface TerritorySynergyCollectionObjectiveDefinition extends TerritoryScenarioObjectiveBaseDefinition {
  kind: "synergy-collection";
  requiredDefinitionCounts: Readonly<Record<string, number>>;
  totalRequiredCount: number;
}

export type TerritoryScenarioObjectiveDefinition =
  | TerritorySettlementObjectiveDefinition
  | TerritoryResourceBalanceObjectiveDefinition
  | TerritorySynergyCollectionObjectiveDefinition;

export interface TerritoryScenarioContractDefinition {
  label: string;
  description: string;
  objectives: readonly TerritoryScenarioObjectiveDefinition[];
}

export interface TerritoryScenarioObjectiveState {
  completedObjectiveIds: readonly string[];
  synergyDefinitionCounts: Readonly<Record<string, number>>;
}

export interface TerritoryScenarioObjectiveContext {
  settlementLevelIndex: number;
  resources: TerritoryResources;
}

export interface TerritoryResourceRequirementProgress {
  current: number;
  target: number;
  reached: boolean;
}

interface TerritoryScenarioObjectiveProgressBase {
  id: string;
  label: string;
  description: string;
  icon: string;
  completed: boolean;
}

export interface TerritorySettlementObjectiveProgress extends TerritoryScenarioObjectiveProgressBase {
  kind: "settlement-level";
  currentLevelIndex: number;
  targetLevelIndex: number;
  targetLabel: string;
}

export interface TerritoryResourceBalanceObjectiveProgress extends TerritoryScenarioObjectiveProgressBase {
  kind: "resource-balance";
  reachedResourceCount: number;
  resourceCount: number;
  resources: {
    food: TerritoryResourceRequirementProgress;
    energy: TerritoryResourceRequirementProgress;
    nature: TerritoryResourceRequirementProgress;
    happiness: TerritoryResourceRequirementProgress;
  };
}

export interface TerritorySynergyRequirementProgress {
  definitionId: string;
  current: number;
  target: number;
  reached: boolean;
}

export interface TerritorySynergyCollectionObjectiveProgress extends TerritoryScenarioObjectiveProgressBase {
  kind: "synergy-collection";
  currentTotalCount: number;
  totalRequiredCount: number;
  requirements: readonly TerritorySynergyRequirementProgress[];
}

export type TerritoryScenarioObjectiveProgress =
  | TerritorySettlementObjectiveProgress
  | TerritoryResourceBalanceObjectiveProgress
  | TerritorySynergyCollectionObjectiveProgress;

export interface TerritoryScenarioObjectiveUpdateResult {
  state: TerritoryScenarioObjectiveState;
  newlyCompletedObjectiveIds: readonly string[];
}

export function createInitialScenarioObjectiveState(): TerritoryScenarioObjectiveState {
  return {
    completedObjectiveIds: [],
    synergyDefinitionCounts: {},
  };
}

export function recordScenarioObjectivePlacement(
  state: TerritoryScenarioObjectiveState,
  cell: BoardCell,
  tileTypeId: TerritoryTileTypeId,
  synergyDefinitions: readonly TerritoryAdjacencySynergyDefinition[],
): TerritoryScenarioObjectiveState {
  const matchedDefinitionIds = synergyDefinitions
    .filter(isEdgeFeatureDefinition)
    .filter((definition) => definition.tileTypeId === tileTypeId)
    .filter((definition) =>
      cellTouchesEdgeFeature(cell, definition.edgeFeatureKind),
    )
    .map((definition) => definition.id);

  if (matchedDefinitionIds.length === 0) {
    return state;
  }

  const nextCounts = { ...state.synergyDefinitionCounts };

  for (const definitionId of new Set(matchedDefinitionIds)) {
    nextCounts[definitionId] = (nextCounts[definitionId] ?? 0) + 1;
  }

  return {
    ...state,
    synergyDefinitionCounts: nextCounts,
  };
}

export function updateScenarioObjectiveState(
  state: TerritoryScenarioObjectiveState,
  context: TerritoryScenarioObjectiveContext,
  contract: TerritoryScenarioContractDefinition,
): TerritoryScenarioObjectiveUpdateResult {
  const completedIds = new Set(state.completedObjectiveIds);
  const newlyCompletedObjectiveIds: string[] = [];

  for (const definition of contract.objectives) {
    if (completedIds.has(definition.id)) {
      continue;
    }

    if (!isObjectiveCurrentlyReached(definition, state, context)) {
      continue;
    }

    completedIds.add(definition.id);
    newlyCompletedObjectiveIds.push(definition.id);
  }

  if (newlyCompletedObjectiveIds.length === 0) {
    return {
      state,
      newlyCompletedObjectiveIds,
    };
  }

  return {
    state: {
      ...state,
      completedObjectiveIds: [...completedIds],
    },
    newlyCompletedObjectiveIds,
  };
}

export function getScenarioObjectiveProgress(
  state: TerritoryScenarioObjectiveState,
  context: TerritoryScenarioObjectiveContext,
  contract: TerritoryScenarioContractDefinition,
): TerritoryScenarioObjectiveProgress[] {
  const completedIds = new Set(state.completedObjectiveIds);

  return contract.objectives.map((definition) => {
    const completed = completedIds.has(definition.id);
    const base = {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      icon: definition.icon,
      completed,
    };

    switch (definition.kind) {
      case "settlement-level":
        return {
          ...base,
          kind: definition.kind,
          currentLevelIndex: context.settlementLevelIndex,
          targetLevelIndex: definition.targetLevelIndex,
          targetLabel: definition.targetLabel,
        };

      case "resource-balance": {
        const resources = {
          food: createRequirementProgress(
            context.resources.food,
            definition.targets.food,
          ),
          energy: createRequirementProgress(
            context.resources.energy,
            definition.targets.energy,
          ),
          nature: createRequirementProgress(
            context.resources.nature,
            definition.targets.nature,
          ),
          happiness: createRequirementProgress(
            context.resources.happiness,
            definition.targets.happiness,
          ),
        };

        return {
          ...base,
          kind: definition.kind,
          reachedResourceCount: Object.values(resources).filter(
            (requirement) => requirement.reached,
          ).length,
          resourceCount: Object.keys(resources).length,
          resources,
        };
      }

      case "synergy-collection": {
        const requirements = Object.entries(
          definition.requiredDefinitionCounts,
        ).map(([definitionId, target]) => {
          const current = state.synergyDefinitionCounts[definitionId] ?? 0;

          return {
            definitionId,
            current,
            target,
            reached: current >= target,
          };
        });
        const currentTotalCount = Object.keys(
          definition.requiredDefinitionCounts,
        ).reduce(
          (total, definitionId) =>
            total + (state.synergyDefinitionCounts[definitionId] ?? 0),
          0,
        );

        return {
          ...base,
          kind: definition.kind,
          currentTotalCount,
          totalRequiredCount: definition.totalRequiredCount,
          requirements,
        };
      }
    }
  });
}

export function isScenarioContractCompleted(
  state: TerritoryScenarioObjectiveState,
  contract: TerritoryScenarioContractDefinition,
): boolean {
  const completedIds = new Set(state.completedObjectiveIds);

  return contract.objectives.every((objective) =>
    completedIds.has(objective.id),
  );
}

function isObjectiveCurrentlyReached(
  definition: TerritoryScenarioObjectiveDefinition,
  state: TerritoryScenarioObjectiveState,
  context: TerritoryScenarioObjectiveContext,
): boolean {
  switch (definition.kind) {
    case "settlement-level":
      return context.settlementLevelIndex >= definition.targetLevelIndex;

    case "resource-balance":
      return (
        context.resources.food >= definition.targets.food &&
        context.resources.energy >= definition.targets.energy &&
        context.resources.nature >= definition.targets.nature &&
        context.resources.happiness >= definition.targets.happiness
      );

    case "synergy-collection": {
      const everyRequiredSynergyReached = Object.entries(
        definition.requiredDefinitionCounts,
      ).every(
        ([definitionId, target]) =>
          (state.synergyDefinitionCounts[definitionId] ?? 0) >= target,
      );
      const totalCount = Object.keys(
        definition.requiredDefinitionCounts,
      ).reduce(
        (total, definitionId) =>
          total + (state.synergyDefinitionCounts[definitionId] ?? 0),
        0,
      );

      return (
        everyRequiredSynergyReached &&
        totalCount >= definition.totalRequiredCount
      );
    }
  }
}

function isEdgeFeatureDefinition(
  definition: TerritoryAdjacencySynergyDefinition,
): definition is TerritoryEdgeFeatureSynergyDefinition {
  return definition.kind === "edge-feature";
}

function cellTouchesEdgeFeature(
  cell: BoardCell,
  edgeFeatureKind: TerritoryEdgeFeatureSynergyDefinition["edgeFeatureKind"],
): boolean {
  return Object.values(cell.edgeFeatures ?? {}).some(
    (features) =>
      features?.some((feature) => feature.kind === edgeFeatureKind) ?? false,
  );
}

function createRequirementProgress(
  current: number,
  target: number,
): TerritoryResourceRequirementProgress {
  return {
    current,
    target,
    reached: current >= target,
  };
}
