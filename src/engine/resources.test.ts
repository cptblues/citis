import { describe, expect, it } from "vitest";

import type { BoardState } from "./board";
import {
  calculateTerritoryResourceDelta,
  calculateTerritoryResources,
  type TerritoryResourceDefinitions,
} from "./resources";

const definitions = {
  town: {
    baseResources: {
      food: 0,
      energy: 0,
      nature: 0,
      happiness: 0,
    },
  },

  prairie: {
    baseResources: {
      food: 0,
      energy: 0,
      nature: 2,
      happiness: 2,
    },
  },

  forest: {
    baseResources: {
      food: 0,
      energy: 0,
      nature: 4,
      happiness: 1,
    },
  },
} satisfies TerritoryResourceDefinitions;

describe("calculateTerritoryResources", () => {
  it("retourne zéro avec uniquement le bourg", () => {
    const state: BoardState = {
      placedTiles: [
        {
          id: "territory:town:0:0",
          typeId: "town",
          q: 0,
          r: 0,
          rotation: 0,
          upgradeIds: [],
        },
      ],
    };

    expect(calculateTerritoryResources(state, definitions, [])).toEqual({
      food: 0,
      energy: 0,
      nature: 0,
      happiness: 0,
    });
  });

  it("additionne les ressources des tuiles", () => {
    const state: BoardState = {
      placedTiles: [
        {
          id: "territory:town:0:0",
          typeId: "town",
          q: 0,
          r: 0,
          rotation: 0,
          upgradeIds: [],
        },
        {
          id: "territory:prairie:1:0",
          typeId: "prairie",
          q: 1,
          r: 0,
          rotation: 0,
          upgradeIds: [],
        },
        {
          id: "territory:forest:0:1",
          typeId: "forest",
          q: 0,
          r: 1,
          rotation: 0,
          upgradeIds: [],
        },
      ],
    };

    expect(calculateTerritoryResources(state, definitions, [])).toEqual({
      food: 0,
      energy: 0,
      nature: 6,
      happiness: 3,
    });
  });
});

describe("calculateTerritoryResourceDelta", () => {
  it("calcule les variations", () => {
    expect(
      calculateTerritoryResourceDelta(
        {
          food: 0,
          energy: 0,
          nature: 2,
          happiness: 2,
        },
        {
          food: 0,
          energy: 0,
          nature: 6,
          happiness: 3,
        },
      ),
    ).toEqual({
      food: 0,
      energy: 0,
      nature: 4,
      happiness: 1,
    });
  });
});
