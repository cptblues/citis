import type { BoardState, TerritoryTileTypeId } from "./board";
import {
  calculateTerritorySynergies,
  calculateTerritorySynergyBonus,
  type TerritoryAdjacencySynergyDefinition,
} from "./synergies";

export interface TerritoryResources {
  food: number;
  energy: number;
  nature: number;
  happiness: number;
}

export interface TerritoryResourceDefinition {
  baseResources: TerritoryResources;
}

export type TerritoryResourceDefinitions = Partial<
  Record<TerritoryTileTypeId, TerritoryResourceDefinition>
>;

export function createEmptyTerritoryResources(): TerritoryResources {
  return {
    food: 0,
    energy: 0,
    nature: 0,
    happiness: 0,
  };
}

export function calculateTerritoryResources(
  state: BoardState,
  definitions: TerritoryResourceDefinitions,
  synergyDefinitions: readonly TerritoryAdjacencySynergyDefinition[],
): TerritoryResources {
  const resources = createEmptyTerritoryResources();

  for (const tile of state.placedTiles) {
    const definition = definitions[tile.typeId];

    if (definition === undefined) {
      throw new Error(`Définition de ressources manquante pour ${tile.typeId}`);
    }

    resources.food += definition.baseResources.food;

    resources.energy += definition.baseResources.energy;

    resources.nature += definition.baseResources.nature;

    resources.happiness += definition.baseResources.happiness;
  }

  const activeSynergies = calculateTerritorySynergies(
    state,
    synergyDefinitions,
  );

  const synergyBonus = calculateTerritorySynergyBonus(activeSynergies);

  resources.food += synergyBonus.food;
  resources.energy += synergyBonus.energy;
  resources.nature += synergyBonus.nature;
  resources.happiness += synergyBonus.happiness;

  return resources;
}

export function calculateTerritoryResourceDelta(
  previousResources: TerritoryResources,
  nextResources: TerritoryResources,
): TerritoryResources {
  return {
    food: nextResources.food - previousResources.food,

    energy: nextResources.energy - previousResources.energy,

    nature: nextResources.nature - previousResources.nature,

    happiness: nextResources.happiness - previousResources.happiness,
  };
}
