import { describe, expect, it } from "vitest";

import {
  TERRITORY_CONTENT,
  TERRITORY_TILE_TYPE_IDS,
  TERRITORY_UPGRADE_TYPE_IDS,
} from "./territoryContentCatalog";
import { TERRITORY_CONNECTION_DEFINITIONS } from "./territoryConnectionDefinitions";
import { TERRITORY_SYNERGY_DEFINITIONS } from "./territorySynergyDefinitions";
import {
  PROTOTYPE_PLACEABLE_TILE_TYPE_IDS,
  getTerritoryTileTypeIdsWithTags,
} from "./territoryTileDefinitions";
import { TERRITORY_UPGRADE_DEFINITIONS } from "./territoryUpgradeDefinitions";

describe("territory content catalog", () => {
  it("dérive les tuiles plaçables depuis la configuration", () => {
    expect(PROTOTYPE_PLACEABLE_TILE_TYPE_IDS).toEqual([
      "prairie",
      "forest",
      "river",
      "field",
      "orchard",
      "farm",
    ]);
  });

  it("dérive les connexions depuis les tuiles", () => {
    expect(TERRITORY_CONNECTION_DEFINITIONS.river).toEqual({
      connectionType: "river",
      baseSides: [0, 2],
    });
    expect(TERRITORY_CONNECTION_DEFINITIONS.forest).toBeUndefined();
    expect(TERRITORY_CONNECTION_DEFINITIONS.field).toBeUndefined();
  });

  it("résout les cibles d'amélioration par tags", () => {
    expect(
      TERRITORY_UPGRADE_DEFINITIONS["forest-trail"].allowedTileTypeIds,
    ).toEqual(["forest"]);
    expect(TERRITORY_UPGRADE_DEFINITIONS.hedges.allowedTileTypeIds).toEqual([
      "field",
    ]);
    expect(TERRITORY_UPGRADE_DEFINITIONS.beehives.allowedTileTypeIds).toEqual([
      "orchard",
    ]);
    expect(
      TERRITORY_UPGRADE_DEFINITIONS["solar-panels"].allowedTileTypeIds,
    ).toEqual(["farm"]);
  });

  it("déplie les synergies par tags en règles moteur", () => {
    expect(TERRITORY_SYNERGY_DEFINITIONS).toContainEqual({
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
    });

    expect(TERRITORY_SYNERGY_DEFINITIONS).toContainEqual({
      id: "protected-water",
      label: "Eau protégée",
      firstTileTypeId: "forest",
      secondTileTypeId: "river",
      resourceBonus: {
        food: 0,
        energy: 0,
        nature: 2,
        happiness: 0,
      },
    });

    expect(TERRITORY_SYNERGY_DEFINITIONS).toContainEqual({
      id: "orchard-pollination",
      label: "Pollinisation",
      firstTileTypeId: "orchard",
      secondTileTypeId: "prairie",
      resourceBonus: {
        food: 2,
        energy: 0,
        nature: 1,
        happiness: 0,
      },
    });

    expect(TERRITORY_SYNERGY_DEFINITIONS).toContainEqual({
      id: "farm-short-circuit",
      label: "Circuit court",
      firstTileTypeId: "farm",
      secondTileTypeId: "town",
      resourceBonus: {
        food: 0,
        energy: 0,
        nature: 0,
        happiness: 2,
      },
    });
  });

  it("décrit les ressources du pack agricole", () => {
    expect(TERRITORY_CONTENT.tiles.field.baseResources).toEqual({
      food: 4,
      energy: 0,
      nature: -1,
      happiness: 0,
    });
    expect(TERRITORY_CONTENT.tiles.orchard.baseResources).toEqual({
      food: 3,
      energy: 0,
      nature: 2,
      happiness: 1,
    });
    expect(TERRITORY_CONTENT.tiles.farm.baseResources).toEqual({
      food: 2,
      energy: 1,
      nature: 0,
      happiness: 1,
    });
  });

  it("ne référence que des tags existants", () => {
    const knownTags = new Set(
      TERRITORY_TILE_TYPE_IDS.flatMap(
        (tileTypeId) => TERRITORY_CONTENT.tiles[tileTypeId].tags,
      ),
    );

    for (const upgradeTypeId of TERRITORY_UPGRADE_TYPE_IDS) {
      const requiredTags =
        TERRITORY_CONTENT.upgrades[upgradeTypeId].target.requiredTags;

      for (const requiredTag of requiredTags) {
        expect(knownTags.has(requiredTag)).toBe(true);
      }

      expect(
        getTerritoryTileTypeIdsWithTags(requiredTags).length,
      ).toBeGreaterThan(0);
    }

    for (const synergy of TERRITORY_CONTENT.synergies) {
      expect(knownTags.has(synergy.condition.firstTag)).toBe(true);
      expect(knownTags.has(synergy.condition.secondTag)).toBe(true);
    }
  });

  it("utilise des ordres de proposition uniques", () => {
    const proposalOrders = PROTOTYPE_PLACEABLE_TILE_TYPE_IDS.map(
      (tileTypeId) => TERRITORY_CONTENT.tiles[tileTypeId].proposals.order,
    );

    expect(new Set(proposalOrders).size).toBe(proposalOrders.length);
  });
});
