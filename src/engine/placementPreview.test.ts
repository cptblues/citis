import { describe, expect, it } from "vitest";

import { prototypeBoardCells } from "../content/prototypeBoard";
import { TERRITORY_TILE_DEFINITIONS } from "../content/territoryTileDefinitions";
import { TERRITORY_SYNERGY_DEFINITIONS } from "../content/territorySynergyDefinitions";
import { TERRITORY_UPGRADE_DEFINITIONS } from "../content/territoryUpgradeDefinitions";
import { createInitialBoardState, placeTerritoryTile } from "./board";
import { previewTerritoryTilePlacement } from "./placementPreview";
import { applyTerritoryUpgrade } from "./upgrades";

describe("previewTerritoryTilePlacement", () => {
  it("inclut le bonus de deux forêts adjacentes", () => {
    const initialState = createInitialBoardState();

    const stateWithForest = placeTerritoryTile(
      prototypeBoardCells,
      initialState,
      "cell:1:0",
      "forest",
    );

    const preview = previewTerritoryTilePlacement(
      prototypeBoardCells,
      stateWithForest,
      "cell:1:-1",
      "forest",
      TERRITORY_TILE_DEFINITIONS,
      TERRITORY_SYNERGY_DEFINITIONS,
    );

    expect(preview.valid).toBe(true);

    expect(preview.resourceDelta).toEqual({
      food: 0,
      energy: 0,
      nature: 6,
      happiness: 1,
    });

    expect(preview.createdSynergies).toHaveLength(1);

    expect(preview.affectedCellIds).toContain("cell:1:0");

    expect(preview.affectedCellIds).toContain("cell:1:-1");
  });

  it("prévisualise un placement après une amélioration existante", () => {
    const initialState = createInitialBoardState();

    const stateWithForest = placeTerritoryTile(
      prototypeBoardCells,
      initialState,
      "cell:1:0",
      "forest",
    );

    const upgradedState = applyTerritoryUpgrade(
      stateWithForest,
      "territory:forest:1:0",
      "forest-trail",
      TERRITORY_UPGRADE_DEFINITIONS,
    );

    const preview = previewTerritoryTilePlacement(
      prototypeBoardCells,
      upgradedState,
      "cell:1:-1",
      "forest",
      TERRITORY_TILE_DEFINITIONS,
      TERRITORY_SYNERGY_DEFINITIONS,
      TERRITORY_UPGRADE_DEFINITIONS,
    );

    expect(preview.valid).toBe(true);

    expect(preview.resourceDelta).toEqual({
      food: 0,
      energy: 0,
      nature: 6,
      happiness: 1,
    });
  });
});
