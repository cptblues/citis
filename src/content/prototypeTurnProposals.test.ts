import { describe, expect, it } from "vitest";
import { PROTOTYPE_SCENARIO } from "./prototypeScenario";
import { getPrototypeTurnProposals } from "./prototypeTurnProposals";

describe("getPrototypeTurnProposals", () => {
  it("propose trois tuiles au premier tour", () => {
    expect(getPrototypeTurnProposals(1)).toHaveLength(3);
  });

  it("ne propose que des types autorisés par le scénario", () => {
    const proposals = getPrototypeTurnProposals(1);

    for (const proposal of proposals) {
      expect(PROTOTYPE_SCENARIO.board.proposalTileTypeIds).toContain(proposal);
    }
  });

  it("ne propose plus de rivière", () => {
    for (let turnNumber = 1; turnNumber <= 10; turnNumber += 1) {
      expect(getPrototypeTurnProposals(turnNumber)).not.toContain("river");
    }
  });

  it("fait défiler les tuiles disponibles", () => {
    expect(getPrototypeTurnProposals(4)).toEqual([
      "orchard",
      "farm",
      "prairie",
    ]);
  });

  it("cycle lorsque toutes les tuiles du scénario ont été parcourues", () => {
    const firstTurnAfterFullCycle =
      PROTOTYPE_SCENARIO.board.proposalTileTypeIds.length + 1;

    expect(getPrototypeTurnProposals(firstTurnAfterFullCycle)).toEqual(
      getPrototypeTurnProposals(1),
    );
  });
});
