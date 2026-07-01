import { describe, expect, it } from "vitest";
import type {
  BoardEdgeFeature,
  BoardState,
  PlacedTerritoryTile,
} from "./board";
import {
  getHexSideBetween,
  getOppositeHexSide,
  type HexCoordinate,
} from "./hex";
import {
  calculateTerritorySynergies,
  calculateTerritorySynergyBonus,
  type TerritoryAdjacencySynergyDefinition,
} from "./synergies";

const definitions = [
  {
    kind: "tile-adjacency",
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
  {
    kind: "edge-feature",
    id: "protected-water",
    label: "Eau protégée",
    tileTypeId: "forest",
    edgeFeatureKind: "river",
    resourceBonus: {
      food: 0,
      energy: 0,
      nature: 2,
      happiness: 0,
    },
  },
  {
    kind: "edge-feature",
    id: "field-irrigation",
    label: "Irrigation",
    tileTypeId: "field",
    edgeFeatureKind: "river",
    resourceBonus: {
      food: 2,
      energy: 0,
      nature: 0,
      happiness: 0,
    },
  },
] satisfies readonly TerritoryAdjacencySynergyDefinition[];

function createTile(
  id: string,
  typeId: PlacedTerritoryTile["typeId"],
  coordinate: HexCoordinate,
): PlacedTerritoryTile {
  return {
    id,
    typeId,
    ...coordinate,
    rotation: 0,
    upgradeIds: [],
  };
}

function addSharedRiverEdge(
  firstTile: PlacedTerritoryTile,
  secondTile: PlacedTerritoryTile,
  bridge = false,
): void {
  const firstSide = getHexSideBetween(firstTile, secondTile);

  if (firstSide === null) {
    throw new Error("Les tuiles de test doivent être voisines.");
  }

  const feature: BoardEdgeFeature = {
    kind: "river",
    blocksExpansion: true,
    bridge,
  };

  firstTile.edgeFeatures = {
    ...firstTile.edgeFeatures,
    [firstSide]: [feature],
  };
  secondTile.edgeFeatures = {
    ...secondTile.edgeFeatures,
    [getOppositeHexSide(firstSide)]: [feature],
  };
}

describe("calculateTerritorySynergies", () => {
  it("détecte deux forêts adjacentes", () => {
    const state: BoardState = {
      placedTiles: [
        createTile("forest-a", "forest", { q: 1, r: 0 }),
        createTile("forest-b", "forest", { q: 1, r: -1 }),
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
        createTile("forest-a", "forest", { q: 1, r: 0 }),
        createTile("forest-b", "forest", { q: -1, r: 0 }),
      ],
    };

    expect(calculateTerritorySynergies(state, definitions)).toHaveLength(0);
  });

  it("accorde Eau protégée à une forêt située en bord de rivière", () => {
    const forest = createTile("forest-a", "forest", { q: 0, r: 0 });
    forest.edgeFeatures = {
      0: [{ kind: "river", blocksExpansion: true }],
    };
    const state: BoardState = { placedTiles: [forest] };

    const synergies = calculateTerritorySynergies(state, definitions);

    expect(synergies).toHaveLength(1);
    expect(synergies[0]).toMatchObject({
      definitionId: "protected-water",
      label: "Eau protégée",
      tileIds: ["forest-a"],
      resourceBonus: {
        food: 0,
        energy: 0,
        nature: 2,
        happiness: 0,
      },
    });
  });

  it("accorde Irrigation une seule fois même si un champ touche deux segments", () => {
    const field = createTile("field-a", "field", { q: 0, r: 0 });
    field.edgeFeatures = {
      0: [{ kind: "river", blocksExpansion: true }],
      1: [{ kind: "river", blocksExpansion: true }],
    };
    const state: BoardState = { placedTiles: [field] };

    const synergies = calculateTerritorySynergies(state, definitions);

    expect(synergies).toHaveLength(1);
    expect(synergies[0]?.definitionId).toBe("field-irrigation");
    expect(calculateTerritorySynergyBonus(synergies)).toEqual({
      food: 2,
      energy: 0,
      nature: 0,
      happiness: 0,
    });
  });

  it("bloque les synergies classiques entre deux rives sans pont", () => {
    const firstForest = createTile("forest-a", "forest", { q: 0, r: 0 });
    const secondForest = createTile("forest-b", "forest", { q: 1, r: 0 });
    addSharedRiverEdge(firstForest, secondForest);
    const state: BoardState = {
      placedTiles: [firstForest, secondForest],
    };

    const synergies = calculateTerritorySynergies(state, definitions);

    expect(
      synergies.some((synergy) => synergy.definitionId === "connected-forests"),
    ).toBe(false);
    expect(
      synergies.filter((synergy) => synergy.definitionId === "protected-water"),
    ).toHaveLength(2);
  });

  it("rétablit les synergies classiques lorsqu'un pont traverse la rivière", () => {
    const firstForest = createTile("forest-a", "forest", { q: 0, r: 0 });
    const secondForest = createTile("forest-b", "forest", { q: 1, r: 0 });
    addSharedRiverEdge(firstForest, secondForest, true);
    const state: BoardState = {
      placedTiles: [firstForest, secondForest],
    };

    const synergies = calculateTerritorySynergies(state, definitions);

    expect(
      synergies.some((synergy) => synergy.definitionId === "connected-forests"),
    ).toBe(true);
    expect(
      synergies.filter((synergy) => synergy.definitionId === "protected-water"),
    ).toHaveLength(2);
  });
});
