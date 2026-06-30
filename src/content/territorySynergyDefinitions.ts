import type { TerritoryAdjacencySynergyDefinition } from "../engine/synergies";
import { TERRITORY_CONTENT } from "./territoryContentCatalog";
import { getTerritoryTileTypeIdsWithTags } from "./territoryTileDefinitions";

function createAdjacencyDefinitions(): TerritoryAdjacencySynergyDefinition[] {
  const definitions: TerritoryAdjacencySynergyDefinition[] = [];

  for (const contentDefinition of TERRITORY_CONTENT.synergies) {
    const firstTileTypeIds = getTerritoryTileTypeIdsWithTags([
      contentDefinition.condition.firstTag,
    ]);
    const secondTileTypeIds = getTerritoryTileTypeIdsWithTags([
      contentDefinition.condition.secondTag,
    ]);
    const createdPairs = new Set<string>();

    for (const firstTileTypeId of firstTileTypeIds) {
      for (const secondTileTypeId of secondTileTypeIds) {
        const pairKey = [firstTileTypeId, secondTileTypeId].sort().join("|");

        if (createdPairs.has(pairKey)) {
          continue;
        }

        createdPairs.add(pairKey);
        definitions.push({
          id: contentDefinition.id,
          label: contentDefinition.label,
          firstTileTypeId,
          secondTileTypeId,
          resourceBonus: contentDefinition.resourceBonus,
        });
      }
    }
  }

  return definitions;
}

export const TERRITORY_SYNERGY_DEFINITIONS =
  createAdjacencyDefinitions() as readonly TerritoryAdjacencySynergyDefinition[];
