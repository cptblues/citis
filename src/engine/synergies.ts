import {
  getBoardEdgeFeaturesBetween,
  type BoardEdgeFeatureKind,
  type BoardState,
  type PlacedTerritoryTile,
  type TerritoryTileTypeId,
} from "./board";
import { getHexDistance } from "./hex";
import type { TerritoryResources } from "./resources";

export interface TerritoryTileAdjacencySynergyDefinition {
  kind?: "tile-adjacency";
  id: string;
  label: string;
  firstTileTypeId: TerritoryTileTypeId;
  secondTileTypeId: TerritoryTileTypeId;
  resourceBonus: TerritoryResources;
}

export interface TerritoryEdgeFeatureSynergyDefinition {
  kind: "edge-feature";
  id: string;
  label: string;
  tileTypeId: TerritoryTileTypeId;
  edgeFeatureKind: BoardEdgeFeatureKind;
  resourceBonus: TerritoryResources;
}

/**
 * Le nom historique est conservé pour ne pas propager un renommage dans tout
 * le prototype. Il représente maintenant aussi les synergies territoriales
 * portées par une arête de la carte.
 */
export type TerritoryAdjacencySynergyDefinition =
  | TerritoryTileAdjacencySynergyDefinition
  | TerritoryEdgeFeatureSynergyDefinition;

export interface ActiveTerritorySynergy {
  id: string;
  definitionId: string;
  label: string;
  tileIds: readonly string[];
  resourceBonus: TerritoryResources;
}

function isEdgeFeatureDefinition(
  definition: TerritoryAdjacencySynergyDefinition,
): definition is TerritoryEdgeFeatureSynergyDefinition {
  return definition.kind === "edge-feature";
}

function tilePairMatchesDefinition(
  firstTile: PlacedTerritoryTile,
  secondTile: PlacedTerritoryTile,
  definition: TerritoryTileAdjacencySynergyDefinition,
): boolean {
  return (
    (firstTile.typeId === definition.firstTileTypeId &&
      secondTile.typeId === definition.secondTileTypeId) ||
    (firstTile.typeId === definition.secondTileTypeId &&
      secondTile.typeId === definition.firstTileTypeId)
  );
}

function tileTouchesEdgeFeature(
  tile: PlacedTerritoryTile,
  edgeFeatureKind: BoardEdgeFeatureKind,
): boolean {
  return Object.values(tile.edgeFeatures ?? {}).some(
    (features) =>
      features?.some((feature) => feature.kind === edgeFeatureKind) ?? false,
  );
}

/**
 * Une rivière coupe les relations de voisinage classiques entre les deux rives.
 * Un pont porté par cette même arête rétablit ces relations.
 */
function riverBlocksTileAdjacency(
  firstTile: PlacedTerritoryTile,
  secondTile: PlacedTerritoryTile,
): boolean {
  const riverFeatures = getBoardEdgeFeaturesBetween(
    firstTile,
    secondTile,
  ).filter((feature) => feature.kind === "river");

  if (riverFeatures.length === 0) {
    return false;
  }

  return !riverFeatures.some((feature) => feature.bridge === true);
}

export function calculateTerritorySynergies(
  state: BoardState,
  definitions: readonly TerritoryAdjacencySynergyDefinition[],
): ActiveTerritorySynergy[] {
  const activeSynergies: ActiveTerritorySynergy[] = [];
  const edgeDefinitions = definitions.filter(isEdgeFeatureDefinition);
  const adjacencyDefinitions = definitions.filter(
    (definition): definition is TerritoryTileAdjacencySynergyDefinition =>
      !isEdgeFeatureDefinition(definition),
  );

  for (const tile of state.placedTiles) {
    for (const definition of edgeDefinitions) {
      if (tile.typeId !== definition.tileTypeId) {
        continue;
      }

      if (!tileTouchesEdgeFeature(tile, definition.edgeFeatureKind)) {
        continue;
      }

      activeSynergies.push({
        id: `synergy:${definition.id}:${tile.id}|edge:${definition.edgeFeatureKind}`,
        definitionId: definition.id,
        label: definition.label,
        tileIds: [tile.id],
        resourceBonus: definition.resourceBonus,
      });
    }
  }

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

      if (riverBlocksTileAdjacency(firstTile, secondTile)) {
        continue;
      }

      for (const definition of adjacencyDefinitions) {
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
