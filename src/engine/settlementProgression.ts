import type { TerritoryResources } from "./resources";

export interface TerritorySettlementRequirements {
  playerPlacedTileCount: number;
  resources: TerritoryResources;
}

export interface TerritorySettlementLevelDefinition {
  id: string;
  label: string;
  description: string;
  requirements: TerritorySettlementRequirements | null;
}

export interface TerritorySettlementProgressionDefinition {
  levels: readonly TerritorySettlementLevelDefinition[];
}

export interface TerritorySettlementRequirementProgress {
  current: number;
  target: number;
  reached: boolean;
}

export interface TerritorySettlementProgress {
  currentLevelIndex: number;
  currentLevel: TerritorySettlementLevelDefinition;
  nextLevel: TerritorySettlementLevelDefinition | null;
  playerPlacedTileCount: TerritorySettlementRequirementProgress | null;
  resources: {
    food: TerritorySettlementRequirementProgress;
    energy: TerritorySettlementRequirementProgress;
    nature: TerritorySettlementRequirementProgress;
    happiness: TerritorySettlementRequirementProgress;
  } | null;
}

export function createInitialSettlementLevelIndex(
  definition: TerritorySettlementProgressionDefinition,
): number {
  assertSettlementLevels(definition);
  return 0;
}

export function getUnlockedSettlementLevelIndex(
  currentLevelIndex: number,
  playerPlacedTileCount: number,
  resources: TerritoryResources,
  definition: TerritorySettlementProgressionDefinition,
): number {
  assertSettlementLevels(definition);

  let unlockedLevelIndex = clampLevelIndex(currentLevelIndex, definition);

  for (
    let candidateIndex = unlockedLevelIndex + 1;
    candidateIndex < definition.levels.length;
    candidateIndex += 1
  ) {
    const candidate = definition.levels[candidateIndex];

    if (
      candidate === undefined ||
      candidate.requirements === null ||
      !meetsSettlementRequirements(
        playerPlacedTileCount,
        resources,
        candidate.requirements,
      )
    ) {
      break;
    }

    unlockedLevelIndex = candidateIndex;
  }

  return unlockedLevelIndex;
}

export function getSettlementProgress(
  currentLevelIndex: number,
  playerPlacedTileCount: number,
  resources: TerritoryResources,
  definition: TerritorySettlementProgressionDefinition,
): TerritorySettlementProgress {
  assertSettlementLevels(definition);

  const safeLevelIndex = clampLevelIndex(currentLevelIndex, definition);
  const currentLevel = definition.levels[safeLevelIndex];
  const nextLevel = definition.levels[safeLevelIndex + 1] ?? null;

  if (currentLevel === undefined) {
    throw new Error("Le niveau courant du bourg est introuvable.");
  }

  if (nextLevel?.requirements === null || nextLevel === null) {
    return {
      currentLevelIndex: safeLevelIndex,
      currentLevel,
      nextLevel,
      playerPlacedTileCount: null,
      resources: null,
    };
  }

  return {
    currentLevelIndex: safeLevelIndex,
    currentLevel,
    nextLevel,
    playerPlacedTileCount: createRequirementProgress(
      playerPlacedTileCount,
      nextLevel.requirements.playerPlacedTileCount,
    ),
    resources: {
      food: createRequirementProgress(
        resources.food,
        nextLevel.requirements.resources.food,
      ),
      energy: createRequirementProgress(
        resources.energy,
        nextLevel.requirements.resources.energy,
      ),
      nature: createRequirementProgress(
        resources.nature,
        nextLevel.requirements.resources.nature,
      ),
      happiness: createRequirementProgress(
        resources.happiness,
        nextLevel.requirements.resources.happiness,
      ),
    },
  };
}

export function meetsSettlementRequirements(
  playerPlacedTileCount: number,
  resources: TerritoryResources,
  requirements: TerritorySettlementRequirements,
): boolean {
  return (
    playerPlacedTileCount >= requirements.playerPlacedTileCount &&
    resources.food >= requirements.resources.food &&
    resources.energy >= requirements.resources.energy &&
    resources.nature >= requirements.resources.nature &&
    resources.happiness >= requirements.resources.happiness
  );
}

function createRequirementProgress(
  current: number,
  target: number,
): TerritorySettlementRequirementProgress {
  return {
    current,
    target,
    reached: current >= target,
  };
}

function clampLevelIndex(
  levelIndex: number,
  definition: TerritorySettlementProgressionDefinition,
): number {
  return Math.min(
    Math.max(0, Math.floor(levelIndex)),
    definition.levels.length - 1,
  );
}

function assertSettlementLevels(
  definition: TerritorySettlementProgressionDefinition,
): void {
  if (definition.levels.length === 0) {
    throw new Error(
      "La progression du bourg doit contenir au moins un niveau.",
    );
  }
}
