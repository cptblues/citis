import { describe, expect, it } from "vitest";

import { PROTOTYPE_SCENARIO } from "../content/prototypeScenario";
import { calculateTerritoryScore } from "./score";

describe("calculateTerritoryScore", () => {
  it("additionne la valeur pondérée des ressources", () => {
    const result = calculateTerritoryScore(
      {
        food: 10,
        energy: 2,
        nature: 8,
        happiness: 5,
      },
      PROTOTYPE_SCENARIO.scoring,
    );

    expect(result.resourceScore).toBe(800);
  });

  it("accorde le bonus maximal lorsque tous les objectifs sont atteints", () => {
    const result = calculateTerritoryScore(
      PROTOTYPE_SCENARIO.scoring.balanceTargets,
      PROTOTYPE_SCENARIO.scoring,
    );

    expect(result.balanceRatio).toBe(1);
    expect(result.balanceBonus).toBe(1000);
  });

  it("utilise la ressource la plus faible pour le bonus d'équilibre", () => {
    const result = calculateTerritoryScore(
      {
        food: 35,
        energy: 3,
        nature: 35,
        happiness: 20,
      },
      PROTOTYPE_SCENARIO.scoring,
    );

    expect(result.balanceRatio).toBe(0.5);
    expect(result.balanceBonus).toBe(500);
  });

  it("reproduit le score observé sur la partie de test", () => {
    const result = calculateTerritoryScore(
      {
        food: 56,
        energy: 8,
        nature: 52,
        happiness: 30,
      },
      PROTOTYPE_SCENARIO.scoring,
    );

    expect(result).toEqual({
      resourceScore: 4420,
      balanceRatio: 1,
      balanceBonus: 1000,
      totalScore: 5420,
    });
  });

  it("ne produit pas de bonus négatif", () => {
    const result = calculateTerritoryScore(
      {
        food: 0,
        energy: 0,
        nature: -2,
        happiness: 0,
      },
      PROTOTYPE_SCENARIO.scoring,
    );

    expect(result.balanceRatio).toBe(0);
    expect(result.balanceBonus).toBe(0);
  });
});
