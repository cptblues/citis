import { describe, expect, it } from "vitest";

import { PROTOTYPE_PLACEABLE_TILE_TYPE_IDS } from "./territoryTileDefinitions";
import { getPrototypeTurnProposals } from "./prototypeTurnProposals";

describe("getPrototypeTurnProposals", () => {
  it("propose deux tuiles au premier tour", () => {
    expect(getPrototypeTurnProposals(1)).toHaveLength(2);
  });

  it("ne propose que des types disponibles", () => {
    const proposals = getPrototypeTurnProposals(1);

    for (const proposal of proposals) {
      expect(PROTOTYPE_PLACEABLE_TILE_TYPE_IDS).toContain(proposal);
    }
  });

  it("cycle lorsque les séries sont épuisées", () => {
    expect(getPrototypeTurnProposals(3)).toEqual(getPrototypeTurnProposals(1));
  });
});
