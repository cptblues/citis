import { describe, expect, it } from "vitest";
import { TERRITORY_SYNERGY_DEFINITIONS } from "./territorySynergyDefinitions";

describe("TERRITORY_SYNERGY_DEFINITIONS", () => {
  it("convertit Eau protégée en synergie de berge pour la forêt", () => {
    expect(
      TERRITORY_SYNERGY_DEFINITIONS.filter(
        (definition) => definition.id === "protected-water",
      ),
    ).toEqual([
      expect.objectContaining({
        kind: "edge-feature",
        tileTypeId: "forest",
        edgeFeatureKind: "river",
      }),
    ]);
  });

  it("convertit Irrigation en synergie de berge pour le champ", () => {
    expect(
      TERRITORY_SYNERGY_DEFINITIONS.filter(
        (definition) => definition.id === "field-irrigation",
      ),
    ).toEqual([
      expect.objectContaining({
        kind: "edge-feature",
        tileTypeId: "field",
        edgeFeatureKind: "river",
      }),
    ]);
  });

  it("conserve Forêts connectées comme synergie entre tuiles", () => {
    expect(
      TERRITORY_SYNERGY_DEFINITIONS.filter(
        (definition) => definition.id === "connected-forests",
      ),
    ).toEqual([
      expect.objectContaining({
        kind: "tile-adjacency",
        firstTileTypeId: "forest",
        secondTileTypeId: "forest",
      }),
    ]);
  });
});
