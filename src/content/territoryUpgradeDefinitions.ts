import type {
  TerritoryUpgradeDefinition,
  TerritoryUpgradeDefinitions,
} from "../engine/upgrades";
import {
  TERRITORY_CONTENT,
  TERRITORY_UPGRADE_TYPE_IDS,
  type TerritoryUpgradeRendererKey,
  type TerritoryUpgradeTypeId,
} from "./territoryContentCatalog";
import { getTerritoryTileTypeIdsWithTags } from "./territoryTileDefinitions";

export type PrototypeUpgradeTypeId = TerritoryUpgradeTypeId;

export interface PrototypeTerritoryUpgradeDefinition extends TerritoryUpgradeDefinition {
  renderer: TerritoryUpgradeRendererKey;
  targetLabel: string;
  ui: {
    selectionMessage: string;
    unavailableMessage: string;
    appliedMessage: string;
  };
}

export const PROTOTYPE_UPGRADE_TYPE_IDS = TERRITORY_UPGRADE_TYPE_IDS;

export const TERRITORY_UPGRADE_DEFINITIONS = Object.fromEntries(
  PROTOTYPE_UPGRADE_TYPE_IDS.map((upgradeTypeId) => {
    const contentDefinition = TERRITORY_CONTENT.upgrades[upgradeTypeId];

    const definition: PrototypeTerritoryUpgradeDefinition = {
      id: upgradeTypeId,
      label: contentDefinition.label,
      description: contentDefinition.description,
      allowedTileTypeIds: getTerritoryTileTypeIdsWithTags(
        contentDefinition.target.requiredTags,
      ),
      resourceBonus: contentDefinition.resourceBonus,
      renderer: contentDefinition.renderer,
      targetLabel: contentDefinition.target.label,
      ui: contentDefinition.ui,
    };

    return [upgradeTypeId, definition] as const;
  }),
) as unknown as Readonly<
  Record<PrototypeUpgradeTypeId, PrototypeTerritoryUpgradeDefinition>
> &
  TerritoryUpgradeDefinitions;

export function getTerritoryUpgradeDefinition(
  upgradeTypeId: PrototypeUpgradeTypeId,
): PrototypeTerritoryUpgradeDefinition {
  return TERRITORY_UPGRADE_DEFINITIONS[upgradeTypeId];
}
