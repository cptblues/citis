import type {
  TerritoryAdjacencySynergyDefinition,
  TerritoryEdgeFeatureSynergyDefinition,
  TerritoryTileAdjacencySynergyDefinition,
} from "../engine/synergies";
import { TERRITORY_CONTENT } from "./territoryContentCatalog";
import { getTerritoryTileTypeIdsWithTags } from "./territoryTileDefinitions";

const WATER_TAG = "water";

function createRiverEdgeDefinitions(
  contentDefinition: (typeof TERRITORY_CONTENT.synergies)[number],
): TerritoryEdgeFeatureSynergyDefinition[] | null {
  const firstTag: string = contentDefinition.condition.firstTag;
  const secondTag: string = contentDefinition.condition.secondTag;
  const firstTagIsWater = firstTag === WATER_TAG;
  const secondTagIsWater = secondTag === WATER_TAG;

  if (!firstTagIsWater && !secondTagIsWater) {
    return null;
  }

  const riversideTag = firstTagIsWater ? secondTag : firstTag;

  if (riversideTag === WATER_TAG) {
    return [];
  }

  return getTerritoryTileTypeIdsWithTags([riversideTag]).map((tileTypeId) => ({
    kind: "edge-feature",
    id: contentDefinition.id,
    label: contentDefinition.label,
    tileTypeId,
    edgeFeatureKind: "river",
    resourceBonus: contentDefinition.resourceBonus,
  }));
}

function createTileAdjacencyDefinitions(
  contentDefinition: (typeof TERRITORY_CONTENT.synergies)[number],
): TerritoryTileAdjacencySynergyDefinition[] {
  const firstTileTypeIds = getTerritoryTileTypeIdsWithTags([
    contentDefinition.condition.firstTag,
  ]);
  const secondTileTypeIds = getTerritoryTileTypeIdsWithTags([
    contentDefinition.condition.secondTag,
  ]);
  const definitions: TerritoryTileAdjacencySynergyDefinition[] = [];
  const createdPairs = new Set<string>();

  for (const firstTileTypeId of firstTileTypeIds) {
    for (const secondTileTypeId of secondTileTypeIds) {
      const pairKey = [firstTileTypeId, secondTileTypeId].sort().join("|");

      if (createdPairs.has(pairKey)) {
        continue;
      }

      createdPairs.add(pairKey);
      definitions.push({
        kind: "tile-adjacency",
        id: contentDefinition.id,
        label: contentDefinition.label,
        firstTileTypeId,
        secondTileTypeId,
        resourceBonus: contentDefinition.resourceBonus,
      });
    }
  }

  return definitions;
}

function createSynergyDefinitions(): TerritoryAdjacencySynergyDefinition[] {
  const definitions: TerritoryAdjacencySynergyDefinition[] = [];

  for (const contentDefinition of TERRITORY_CONTENT.synergies) {
    const riverEdgeDefinitions = createRiverEdgeDefinitions(contentDefinition);

    if (riverEdgeDefinitions !== null) {
      definitions.push(...riverEdgeDefinitions);
      continue;
    }

    definitions.push(...createTileAdjacencyDefinitions(contentDefinition));
  }

  return definitions;
}

export const TERRITORY_SYNERGY_DEFINITIONS =
  createSynergyDefinitions() as readonly TerritoryAdjacencySynergyDefinition[];
