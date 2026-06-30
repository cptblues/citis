import { describe, expect, it } from "vitest";

import type { BoardState } from "./board";
import {
  calculateTerritorySynergies,
  calculateTerritorySynergyBonus,
  type TerritoryAdjacencySynergyDefinition,
} from "./synergies";

const definitions = [
  {
    id: "connected-forests",
    label: "Forêts connectées",
    firstTileTypeId: "forest",
    secondTileTypeId: "forest",
    resourceBonus: {
      food: 0,
      energy: 0,
      nature: 2,
      happiness: 0,
    },
  },
] satisfies readonly TerritoryAdjacencySynergyDefinition[];

describe("calculateTerritorySynergies", () => {
  it("détecte deux forêts adjacentes", () => {
    const state: BoardState = {
      placedTiles: [
        {
          id: "forest-a",
          typeId: "forest",
          q: 1,
          r: 0,
          rotation: 0,
          upgradeIds: [],
        },
        {
          id: "forest-b",
          typeId: "forest",
          q: 1,
          r: -1,
          rotation: 0,
          upgradeIds: [],
        },
      ],
    };

    const synergies = calculateTerritorySynergies(state, definitions);

    expect(synergies).toHaveLength(1);
    expect(synergies[0]?.label).toBe("Forêts connectées");

    expect(calculateTerritorySynergyBonus(synergies)).toEqual({
      food: 0,
      energy: 0,
      nature: 2,
      happiness: 0,
    });
  });

  it("ignore deux forêts non adjacentes", () => {
    const state: BoardState = {
      placedTiles: [
        {
          id: "forest-a",
          typeId: "forest",
          q: 1,
          r: 0,
          rotation: 0,
          upgradeIds: [],
        },
        {
          id: "forest-b",
          typeId: "forest",
          q: -1,
          r: 0,
          rotation: 0,
          upgradeIds: [],
        },
      ],
    };

    expect(calculateTerritorySynergies(state, definitions)).toHaveLength(0);
  });
});
