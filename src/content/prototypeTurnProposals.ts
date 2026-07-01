import { PROTOTYPE_SCENARIO } from "./prototypeScenario";
import { TERRITORY_CONTENT } from "./territoryContentCatalog";
import type { PrototypePlaceableTileTypeId } from "./territoryTileDefinitions";

/**
 * Produit une fenêtre tournante dans le catalogue autorisé par le scénario.
 *
 * La rivière est désormais une infrastructure fixe du plateau et n'apparaît
 * donc plus parmi les propositions de cette commune.
 */
export function getPrototypeTurnProposals(
  turnNumber: number,
): readonly PrototypePlaceableTileTypeId[] {
  const availableTileTypeIds =
    PROTOTYPE_SCENARIO.board.proposalTileTypeIds.filter(
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
