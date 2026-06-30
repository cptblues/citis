import type { TerritoryAdjacencySynergyDefinition } from "../engine/synergies";

export const TERRITORY_SYNERGY_DEFINITIONS = [
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
] as const satisfies readonly TerritoryAdjacencySynergyDefinition[];
