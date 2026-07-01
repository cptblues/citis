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

  it("cadence les points d’aménagement sur la partie", () => {
    expect(PROTOTYPE_SCENARIO.improvements).toEqual({
      initialPoints: 2,
      pointsPerGrant: 1,
      pointsGrantedAtTurns: [4, 7, 10, 13],
    });
  });

  it("définit trois niveaux d’évolution du bourg", () => {
    expect(PROTOTYPE_SCENARIO.settlementProgression.levels).toHaveLength(3);
    expect(PROTOTYPE_SCENARIO.settlementProgression.levels[0]).toMatchObject({
      id: "village",
      label: "Bourg",
      requirements: null,
    });
    expect(PROTOTYPE_SCENARIO.settlementProgression.levels[1]).toMatchObject({
      id: "communal-center",
      requirements: {
        playerPlacedTileCount: 4,
        resources: {
          food: 8,
          energy: 0,
          nature: 8,
          happiness: 4,
        },
      },
    });
    expect(PROTOTYPE_SCENARIO.settlementProgression.levels[2]).toMatchObject({
      id: "metropolitan-heart",
      requirements: {
        playerPlacedTileCount: 9,
        resources: {
          food: 20,
          energy: 3,
          nature: 20,
          happiness: 10,
        },
      },
    });
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

// Les objectifs ci-dessous deviennent la condition de réussite du scénario.
describe("contrat de territoire", () => {
  it("définit trois objectifs lisibles", () => {
    expect(PROTOTYPE_SCENARIO.contract.objectives).toHaveLength(3);
    expect(
      PROTOTYPE_SCENARIO.contract.objectives.map((objective) => objective.kind),
    ).toEqual(["settlement-level", "resource-balance", "synergy-collection"]);
  });

  it("réutilise les seuils d'équilibre du score", () => {
    const balanceObjective = PROTOTYPE_SCENARIO.contract.objectives.find(
      (objective) => objective.kind === "resource-balance",
    );

    expect(balanceObjective).toMatchObject({
      targets: PROTOTYPE_SCENARIO.scoring.balanceTargets,
    });
  });

  it("demande irrigation, eau protégée et trois synergies fluviales", () => {
    const riverObjective = PROTOTYPE_SCENARIO.contract.objectives.find(
      (objective) => objective.kind === "synergy-collection",
    );

    expect(riverObjective).toMatchObject({
      requiredDefinitionCounts: {
        "protected-water": 1,
        "field-irrigation": 1,
      },
      totalRequiredCount: 3,
    });
  });
});
