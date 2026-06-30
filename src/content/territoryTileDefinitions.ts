import type {
  PlaceableTerritoryTileTypeId,
  TerritoryTileTypeId,
} from "../engine/board";

export interface TerritoryTileDefinition {
  label: string;
  fillColor: number;
  hoverColor: number;
  strokeColor: number;
}

export const PROTOTYPE_PLACEABLE_TILE_TYPE_IDS = [
  "prairie",
  "forest",
] as const satisfies readonly PlaceableTerritoryTileTypeId[];

export type PrototypePlaceableTileTypeId =
  (typeof PROTOTYPE_PLACEABLE_TILE_TYPE_IDS)[number];

const TERRITORY_TILE_DEFINITIONS: Partial<
  Record<TerritoryTileTypeId, TerritoryTileDefinition>
> = {
  town: {
    label: "Bourg",
    fillColor: 0xf2d492,
    hoverColor: 0xf7dfaa,
    strokeColor: 0x18351f,
  },

  prairie: {
    label: "Prairie",
    fillColor: 0xa9cf7c,
    hoverColor: 0xc1df9d,
    strokeColor: 0x4b793d,
  },

  forest: {
    label: "Forêt",
    fillColor: 0x659765,
    hoverColor: 0x7ead7e,
    strokeColor: 0x28563a,
  },
};

/**
 * Retourne la définition visuelle d'une tuile de territoire connue du prototype.
 */
export function getTerritoryTileDefinition(
  tileTypeId: TerritoryTileTypeId,
): TerritoryTileDefinition {
  const definition = TERRITORY_TILE_DEFINITIONS[tileTypeId];

  if (definition === undefined) {
    throw new Error(`Définition manquante pour la tuile ${tileTypeId}`);
  }

  return definition;
}
