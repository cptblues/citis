import {
  TERRITORY_CONTENT,
  TERRITORY_TILE_TYPE_IDS,
  type PlaceableTerritoryTileTypeId,
  type TerritoryTileRendererKey,
  type TerritoryTileTypeId,
} from "./territoryContentCatalog";
import type { TerritoryResources } from "../engine/resources";
import type { HexSide } from "../engine/hex";

export interface TerritoryTileDefinition {
  label: string;
  fillColor: number;
  hoverColor: number;
  strokeColor: number;
  baseResources: TerritoryResources;
  tags: readonly string[];
  renderer: TerritoryTileRendererKey;
  placement: {
    placeable: boolean;
    rotationEnabled: boolean;
    previewContentEnabled: boolean;
    invalidMessage: string | null;
    connection: {
      connectionType: string;
      baseSides: readonly HexSide[];
    } | null;
  };
  proposals: {
    enabled: boolean;
    order: number;
  };
}

export const TERRITORY_TILE_DEFINITIONS = TERRITORY_CONTENT.tiles;

export const PROTOTYPE_PLACEABLE_TILE_TYPE_IDS = TERRITORY_TILE_TYPE_IDS.filter(
  (tileTypeId): tileTypeId is PlaceableTerritoryTileTypeId =>
    TERRITORY_TILE_DEFINITIONS[tileTypeId].placement.placeable,
).sort(
  (firstTileTypeId, secondTileTypeId) =>
    TERRITORY_TILE_DEFINITIONS[firstTileTypeId].proposals.order -
    TERRITORY_TILE_DEFINITIONS[secondTileTypeId].proposals.order,
);

export type PrototypePlaceableTileTypeId = PlaceableTerritoryTileTypeId;

/**
 * Retourne la définition complète d'une tuile du catalogue.
 */
export function getTerritoryTileDefinition(
  tileTypeId: TerritoryTileTypeId,
): TerritoryTileDefinition {
  return TERRITORY_TILE_DEFINITIONS[tileTypeId];
}

/**
 * Liste les types de tuiles possédant tous les tags demandés.
 */
export function getTerritoryTileTypeIdsWithTags(
  requiredTags: readonly string[],
): TerritoryTileTypeId[] {
  return TERRITORY_TILE_TYPE_IDS.filter((tileTypeId) => {
    const tileTags: readonly string[] =
      TERRITORY_TILE_DEFINITIONS[tileTypeId].tags;

    return requiredTags.every((requiredTag) => tileTags.includes(requiredTag));
  });
}
