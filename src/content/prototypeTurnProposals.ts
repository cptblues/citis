import type { PrototypePlaceableTileTypeId } from "./territoryTileDefinitions";

const PROTOTYPE_TURN_PROPOSALS = [
  ["prairie", "forest"],
  ["forest", "prairie"],
] as const satisfies readonly (readonly PrototypePlaceableTileTypeId[])[];

/**
 * Donne les propositions disponibles pour un tour du prototype.
 */
export function getPrototypeTurnProposals(
  turnNumber: number,
): readonly PrototypePlaceableTileTypeId[] {
  const proposalIndex = (turnNumber - 1) % PROTOTYPE_TURN_PROPOSALS.length;

  return PROTOTYPE_TURN_PROPOSALS[proposalIndex]!;
}
