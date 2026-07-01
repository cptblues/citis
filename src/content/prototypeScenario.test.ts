import { describe, expect, it } from "vitest";
import { PROTOTYPE_SCENARIO } from "./prototypeScenario";

describe("PROTOTYPE_SCENARIO", () => {
  it("définit une partie limitée à quinze tours", () => {
    expect(PROTOTYPE_SCENARIO.maximumTurns).toBe(15);
  });

  it("possède un objectif de score positif", () => {
    expect(PROTOTYPE_SCENARIO.targetScore).toBeGreaterThan(0);
  });

  it("valorise chacune des quatre ressources", () => {
    expect(PROTOTYPE_SCENARIO.scoring.resourceWeights).toEqual({
      food: 20,
      energy: 100,
      nature: 25,
      happiness: 40,
    });
  });

  it("demande un territoire équilibré pour obtenir tout le bonus", () => {
    const targets = PROTOTYPE_SCENARIO.scoring.balanceTargets;

    expect(targets.food).toBeGreaterThan(0);
    expect(targets.energy).toBeGreaterThan(0);
    expect(targets.nature).toBeGreaterThan(0);
    expect(targets.happiness).toBeGreaterThan(0);
  });

  it("décrit un plateau irrégulier avec un bourg central", () => {
    expect(PROTOTYPE_SCENARIO.board.rows).toHaveLength(11);
    expect(PROTOTYPE_SCENARIO.board.initialTiles).toContainEqual({
      typeId: "town",
      q: 0,
      r: 0,
      rotation: 0,
    });
  });

  it("exclut la rivière des propositions de ce scénario", () => {
    expect(PROTOTYPE_SCENARIO.board.proposalTileTypeIds).not.toContain("river");
  });

  it("définit trois ponts sur le fleuve", () => {
    const bridges = PROTOTYPE_SCENARIO.board.edges.filter(
      (edge) =>
        edge.kind === "river" && "bridge" in edge && edge.bridge === true,
    );

    expect(bridges).toHaveLength(3);
  });
});
