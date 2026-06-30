import { describe, expect, it } from "vitest";

import { TERRITORY_UPGRADE_DEFINITIONS } from "../content/territoryUpgradeDefinitions";
import type { BoardState } from "./board";
import { applyTerritoryUpgrade, canApplyTerritoryUpgrade } from "./upgrades";

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
      id: "prairie-a",
      typeId: "prairie",
      q: 0,
      r: 1,
      rotation: 0,
      upgradeIds: [],
    },
  ],
};

describe("territory upgrades", () => {
  it("autorise un sentier sur une forêt", () => {
    expect(
      canApplyTerritoryUpgrade(
        state,
        "forest-a",
        "forest-trail",
        TERRITORY_UPGRADE_DEFINITIONS,
      ),
    ).toBe(true);
  });

  it("refuse un sentier sur une prairie", () => {
    expect(
      canApplyTerritoryUpgrade(
        state,
        "prairie-a",
        "forest-trail",
        TERRITORY_UPGRADE_DEFINITIONS,
      ),
    ).toBe(false);
  });

  it("ajoute le sentier à la forêt", () => {
    const nextState = applyTerritoryUpgrade(
      state,
      "forest-a",
      "forest-trail",
      TERRITORY_UPGRADE_DEFINITIONS,
    );

    expect(nextState.placedTiles[0]?.upgradeIds).toEqual(["forest-trail"]);
  });

  it("empêche d'ajouter deux fois le même sentier", () => {
    const upgradedState = applyTerritoryUpgrade(
      state,
      "forest-a",
      "forest-trail",
      TERRITORY_UPGRADE_DEFINITIONS,
    );

    expect(
      applyTerritoryUpgrade(
        upgradedState,
        "forest-a",
        "forest-trail",
        TERRITORY_UPGRADE_DEFINITIONS,
      ),
    ).toBe(upgradedState);
  });
});
