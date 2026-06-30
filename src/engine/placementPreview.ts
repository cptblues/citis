import {
  createBoardCellId,
  placeTerritoryTile,
  type BoardCell,
  type BoardState,
  type PlaceableTerritoryTileTypeId,
} from "./board";
import {
  calculateTerritoryResourceDelta,
  calculateTerritoryResources,
  createEmptyTerritoryResources,
  type TerritoryResourceDefinitions,
  type TerritoryResources,
} from "./resources";
import {
  calculateTerritorySynergies,
  type ActiveTerritorySynergy,
  type TerritoryAdjacencySynergyDefinition,
} from "./synergies";
import type { TerritoryUpgradeDefinitions } from "./upgrades";

export interface TerritoryPlacementPreview {
  valid: boolean;
  resourceDelta: TerritoryResources;
  createdSynergies: ActiveTerritorySynergy[];
  affectedCellIds: string[];
}

export function previewTerritoryTilePlacement(
  cells: readonly BoardCell[],
  state: BoardState,
  cellId: string,
  tileTypeId: PlaceableTerritoryTileTypeId,
  resourceDefinitions: TerritoryResourceDefinitions,
  synergyDefinitions: readonly TerritoryAdjacencySynergyDefinition[],
  upgradeDefinitions: TerritoryUpgradeDefinitions = {},
): TerritoryPlacementPreview {
  const nextState = placeTerritoryTile(cells, state, cellId, tileTypeId);

  if (nextState === state) {
    return {
      valid: false,
      resourceDelta: createEmptyTerritoryResources(),
      createdSynergies: [],
      affectedCellIds: [],
    };
  }

  const previousResources = calculateTerritoryResources(
    state,
    resourceDefinitions,
    synergyDefinitions,
    upgradeDefinitions,
  );

  const nextResources = calculateTerritoryResources(
    nextState,
    resourceDefinitions,
    synergyDefinitions,
    upgradeDefinitions,
  );

  const previousSynergyIds = new Set(
    calculateTerritorySynergies(state, synergyDefinitions).map(
      (synergy) => synergy.id,
    ),
  );

  const createdSynergies = calculateTerritorySynergies(
    nextState,
    synergyDefinitions,
  ).filter((synergy) => !previousSynergyIds.has(synergy.id));

  const affectedCellIds = new Set<string>();

  for (const synergy of createdSynergies) {
    for (const tileId of synergy.tileIds) {
      const tile = nextState.placedTiles.find(
        (candidate) => candidate.id === tileId,
      );

      if (tile !== undefined) {
        affectedCellIds.add(createBoardCellId(tile.q, tile.r));
      }
    }
  }

  return {
    valid: true,
    resourceDelta: calculateTerritoryResourceDelta(
      previousResources,
      nextResources,
    ),
    createdSynergies,
    affectedCellIds: [...affectedCellIds],
  };
}
