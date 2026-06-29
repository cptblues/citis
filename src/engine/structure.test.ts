import { describe, expect, it } from "vitest";

import type { GameTile } from "./gameTile";
import {
  applyPlaceStructure,
  canPlaceStructure,
  createInitialGameState,
} from "./structure";

const grassTile: GameTile = {
  id: "tile:0:0",
  q: 0,
  r: 0,
  terrainTypeId: "grass",
};

const waterTile: GameTile = {
  id: "tile:1:0",
  q: 1,
  r: 0,
  terrainTypeId: "water",
};

const housingPlacementRule = {
  allowedTerrainTypeIds: ["grass", "soil"] as const,
};

describe("canPlaceStructure", () => {
  it("autorise une habitation sur une tuile d’herbe vide", () => {
    const state = createInitialGameState();

    expect(canPlaceStructure(state, grassTile, housingPlacementRule)).toBe(
      true,
    );
  });

  it("interdit une habitation sur l’eau", () => {
    const state = createInitialGameState();

    expect(canPlaceStructure(state, waterTile, housingPlacementRule)).toBe(
      false,
    );
  });

  it("interdit une seconde structure sur la même tuile", () => {
    const initialState = createInitialGameState();

    const stateWithHousing = applyPlaceStructure(initialState, {
      type: "place-structure",
      structureTypeId: "housing",
      tileId: grassTile.id,
    });

    expect(
      canPlaceStructure(stateWithHousing, grassTile, housingPlacementRule),
    ).toBe(false);
  });
});
