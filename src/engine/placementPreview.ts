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
import type { TerritoryConnectionDefinitions } from "./connections";
import type { HexRotation } from "./hex";

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
  rotation: HexRotation = 0,
  connectionDefinitions: TerritoryConnectionDefinitions = {},
): TerritoryPlacementPreview {
  const nextState = placeTerritoryTile(
    cells,
    state,
    cellId,
    tileTypeId,
    rotation,
    connectionDefinitions,
  );

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
    createdSynergies: createdSynergies.map((synergy) => ({
      ...synergy,
      label: formatTerritorySynergyPreviewLabel(synergy),
    })),
    affectedCellIds: [...affectedCellIds],
  };
}

/**
 * Le bandeau React consomme actuellement le label de la synergie. On y ajoute
 * donc le bonus propre à la synergie, sans toucher au calcul des ressources.
 */
export function formatTerritorySynergyPreviewLabel(
  synergy: ActiveTerritorySynergy,
): string {
  const gains = formatResourceBonus(synergy.resourceBonus);

  return gains.length === 0
    ? synergy.label
    : `${synergy.label} (${gains.join(" · ")})`;
}

function formatResourceBonus(resources: TerritoryResources): string[] {
  const gains: string[] = [];

  addResourceBonus(gains, "Nourriture", resources.food);
  addResourceBonus(gains, "Énergie", resources.energy);
  addResourceBonus(gains, "Nature", resources.nature);
  addResourceBonus(gains, "Bonheur", resources.happiness);

  return gains;
}

function addResourceBonus(
  gains: string[],
  label: string,
  amount: number,
): void {
  if (amount === 0) {
    return;
  }

  const sign = amount > 0 ? "+" : "";
  gains.push(`${sign}${amount} ${label}`);
}
