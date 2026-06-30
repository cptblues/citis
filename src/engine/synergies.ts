import type {
  BoardState,
  PlacedTerritoryTile,
  TerritoryTileTypeId,
} from "./board";
import { getHexDistance } from "./hex";
import type { TerritoryResources } from "./resources";

export interface TerritoryAdjacencySynergyDefinition {
  id: string;
  label: string;
  firstTileTypeId: TerritoryTileTypeId;
  secondTileTypeId: TerritoryTileTypeId;
  resourceBonus: TerritoryResources;
}

export interface ActiveTerritorySynergy {
  id: string;
  definitionId: string;
  label: string;
  tileIds: readonly [string, string];
  resourceBonus: TerritoryResources;
}

function tilePairMatchesDefinition(
  firstTile: PlacedTerritoryTile,
  secondTile: PlacedTerritoryTile,
  definition: TerritoryAdjacencySynergyDefinition,
): boolean {
  return (
    (firstTile.typeId === definition.firstTileTypeId &&
      secondTile.typeId === definition.secondTileTypeId) ||
    (firstTile.typeId === definition.secondTileTypeId &&
      secondTile.typeId === definition.firstTileTypeId)
  );
}

export function calculateTerritorySynergies(
  state: BoardState,
  definitions: readonly TerritoryAdjacencySynergyDefinition[],
): ActiveTerritorySynergy[] {
  const activeSynergies: ActiveTerritorySynergy[] = [];

  for (
    let firstIndex = 0;
    firstIndex < state.placedTiles.length;
    firstIndex += 1
  ) {
    const firstTile = state.placedTiles[firstIndex];

    if (firstTile === undefined) {
      continue;
    }

    for (
      let secondIndex = firstIndex + 1;
      secondIndex < state.placedTiles.length;
      secondIndex += 1
    ) {
      const secondTile = state.placedTiles[secondIndex];

      if (secondTile === undefined) {
        continue;
      }

      if (getHexDistance(firstTile, secondTile) !== 1) {
        continue;
      }

      for (const definition of definitions) {
        if (!tilePairMatchesDefinition(firstTile, secondTile, definition)) {
          continue;
        }

        const firstId =
          firstTile.id < secondTile.id ? firstTile.id : secondTile.id;

        const secondId =
          firstTile.id < secondTile.id ? secondTile.id : firstTile.id;

        activeSynergies.push({
          id: `synergy:${definition.id}:${firstId}|${secondId}`,
          definitionId: definition.id,
          label: definition.label,
          tileIds: [firstId, secondId],
          resourceBonus: definition.resourceBonus,
        });
      }
    }
  }

  return activeSynergies;
}

export function calculateTerritorySynergyBonus(
  synergies: readonly ActiveTerritorySynergy[],
): TerritoryResources {
  const total: TerritoryResources = {
    food: 0,
    energy: 0,
    nature: 0,
    happiness: 0,
  };

  for (const synergy of synergies) {
    total.food += synergy.resourceBonus.food;
    total.energy += synergy.resourceBonus.energy;
    total.nature += synergy.resourceBonus.nature;
    total.happiness += synergy.resourceBonus.happiness;
  }

  return total;
}
