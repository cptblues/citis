import { describe, expect, it } from "vitest";

import type { TerritorySettlementProgressionDefinition } from "./settlementProgression";
import {
  createInitialSettlementLevelIndex,
  getSettlementProgress,
  getUnlockedSettlementLevelIndex,
} from "./settlementProgression";

const DEFINITION: TerritorySettlementProgressionDefinition = {
  levels: [
    {
      id: "village",
      label: "Bourg",
      description: "État initial",
      requirements: null,
    },
    {
      id: "communal-center",
      label: "Centre communal",
      description: "Premier développement",
      requirements: {
        playerPlacedTileCount: 4,
        resources: {
          food: 8,
          energy: 0,
          nature: 8,
          happiness: 4,
        },
      },
    },
    {
      id: "metropolitan-heart",
      label: "Cœur métropolitain",
      description: "Dernier niveau",
      requirements: {
        playerPlacedTileCount: 9,
        resources: {
          food: 20,
          energy: 3,
          nature: 20,
          happiness: 10,
        },
      },
    },
  ],
};

describe("settlement progression", () => {
  it("commence au premier niveau", () => {
    expect(createInitialSettlementLevelIndex(DEFINITION)).toBe(0);
  });

  it("débloque le centre communal lorsque tous les seuils sont atteints", () => {
    expect(
      getUnlockedSettlementLevelIndex(
        0,
        4,
        { food: 8, energy: 0, nature: 8, happiness: 4 },
        DEFINITION,
      ),
    ).toBe(1);
  });

  it("ne débloque pas un niveau si une seule condition manque", () => {
    expect(
      getUnlockedSettlementLevelIndex(
        0,
        4,
        { food: 8, energy: 0, nature: 8, happiness: 3 },
        DEFINITION,
      ),
    ).toBe(0);
  });

  it("peut franchir plusieurs niveaux si toutes les conditions sont remplies", () => {
    expect(
      getUnlockedSettlementLevelIndex(
        0,
        9,
        { food: 20, energy: 3, nature: 20, happiness: 10 },
        DEFINITION,
      ),
    ).toBe(2);
  });

  it("ne rétrograde jamais un niveau déjà atteint", () => {
    expect(
      getUnlockedSettlementLevelIndex(
        2,
        0,
        { food: 0, energy: 0, nature: 0, happiness: 0 },
        DEFINITION,
      ),
    ).toBe(2);
  });

  it("expose la progression vers le prochain niveau", () => {
    const progress = getSettlementProgress(
      0,
      3,
      { food: 7, energy: 0, nature: 10, happiness: 4 },
      DEFINITION,
    );

    expect(progress.currentLevel.id).toBe("village");
    expect(progress.nextLevel?.id).toBe("communal-center");
    expect(progress.playerPlacedTileCount).toEqual({
      current: 3,
      target: 4,
      reached: false,
    });
    expect(progress.resources?.nature.reached).toBe(true);
    expect(progress.resources?.food.reached).toBe(false);
  });
});
