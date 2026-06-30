import { TERRITORY_CONTENT } from "./territoryContentCatalog";
import {
  PROTOTYPE_PLACEABLE_TILE_TYPE_IDS,
  type PrototypePlaceableTileTypeId,
} from "./territoryTileDefinitions";

/**
 * Produit une fenêtre tournante dans le catalogue des tuiles proposées.
 * L'ajout d'une nouvelle tuile activée dans le catalogue ne demande aucune
 * modification de cette fonction.
 */
export function getPrototypeTurnProposals(
  turnNumber: number,
): readonly PrototypePlaceableTileTypeId[] {
  const availableTileTypeIds = PROTOTYPE_PLACEABLE_TILE_TYPE_IDS.filter(
    (tileTypeId) => TERRITORY_CONTENT.tiles[tileTypeId].proposals.enabled,
  );

  if (availableTileTypeIds.length === 0) {
    return [];
  }

  const proposalCount = Math.min(
    TERRITORY_CONTENT.proposalCount,
    availableTileTypeIds.length,
  );
  const firstProposalIndex =
    Math.max(0, turnNumber - 1) % availableTileTypeIds.length;

  return Array.from({ length: proposalCount }, (_, proposalIndex) => {
    const tileTypeIndex =
      (firstProposalIndex + proposalIndex) % availableTileTypeIds.length;

    return availableTileTypeIds[tileTypeIndex]!;
  });
}
