import { describe, expect, it } from "vitest";

import { getPrototypeTurnProposals } from "./prototypeTurnProposals";
import { PROTOTYPE_PLACEABLE_TILE_TYPE_IDS } from "./territoryTileDefinitions";

describe("getPrototypeTurnProposals", () => {
  it("propose trois tuiles au premier tour", () => {
    expect(getPrototypeTurnProposals(1)).toHaveLength(3);
  });

  it("ne propose que des types disponibles", () => {
    const proposals = getPrototypeTurnProposals(1);

    for (const proposal of proposals) {
      expect(PROTOTYPE_PLACEABLE_TILE_TYPE_IDS).toContain(proposal);
    }
  });

  it("fait défiler les tuiles disponibles", () => {
    expect(getPrototypeTurnProposals(4)).toEqual(["field", "orchard", "farm"]);
  });

  it("cycle lorsque toutes les tuiles ont été parcourues", () => {
    const firstTurnAfterFullCycle =
      PROTOTYPE_PLACEABLE_TILE_TYPE_IDS.length + 1;

    expect(getPrototypeTurnProposals(firstTurnAfterFullCycle)).toEqual(
      getPrototypeTurnProposals(1),
    );
  });
});
