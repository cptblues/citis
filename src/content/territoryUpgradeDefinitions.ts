import type { TerritoryUpgradeDefinitions } from "../engine/upgrades";

export const PROTOTYPE_UPGRADE_TYPE_IDS = ["forest-trail"] as const;

export type PrototypeUpgradeTypeId =
  (typeof PROTOTYPE_UPGRADE_TYPE_IDS)[number];

export const TERRITORY_UPGRADE_DEFINITIONS = {
  "forest-trail": {
    id: "forest-trail",
    label: "Sentier forestier",
    description: "Rend la forêt accessible aux habitants.",
    allowedTileTypeIds: ["forest"],
    resourceBonus: {
      food: 0,
      energy: 0,
      nature: 0,
      happiness: 2,
    },
  },
} as const satisfies TerritoryUpgradeDefinitions;
