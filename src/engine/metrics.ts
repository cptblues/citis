import type { GameState, StructureTypeId } from "./structure";

export interface GlobalMetrics {
  populationCapacity: number;
}

export interface StructureMetricDefinition {
  populationCapacityByLevel: readonly [number, number, number];
}

export type StructureMetricDefinitions = Record<
  StructureTypeId,
  StructureMetricDefinition
>;

/**
 * Agrège les métriques globales dérivées des structures placées.
 */
export function calculateGlobalMetrics(
  state: GameState,
  definitions: StructureMetricDefinitions,
): GlobalMetrics {
  let populationCapacity = 0;

  for (const structure of state.structures) {
    const definition = definitions[structure.typeId];

    populationCapacity +=
      definition.populationCapacityByLevel[structure.level - 1];
  }

  return {
    populationCapacity,
  };
}
