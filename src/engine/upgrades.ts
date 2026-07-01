import type { BoardState, TerritoryTileTypeId } from "./board";
import type { TerritoryResources } from "./resources";

export interface TerritoryUpgradeDefinition {
  id: string;
  label: string;
  description: string;
  cost: number;
  allowedTileTypeIds: readonly TerritoryTileTypeId[];
  resourceBonus: TerritoryResources;
}

export type TerritoryUpgradeDefinitions = Readonly<
  Record<string, TerritoryUpgradeDefinition>
>;

export function canApplyTerritoryUpgrade(
  state: BoardState,
  tileId: string,
  upgradeId: string,
  definitions: TerritoryUpgradeDefinitions,
): boolean {
  const tile = state.placedTiles.find((candidate) => candidate.id === tileId);
  const definition = definitions[upgradeId];

  if (tile === undefined || definition === undefined) {
    return false;
  }

  if (!definition.allowedTileTypeIds.includes(tile.typeId)) {
    return false;
  }

  if (tile.upgradeIds.includes(upgradeId)) {
    return false;
  }

  return tile.upgradeIds.length < 2;
}

export function applyTerritoryUpgrade(
  state: BoardState,
  tileId: string,
  upgradeId: string,
  definitions: TerritoryUpgradeDefinitions,
): BoardState {
  if (!canApplyTerritoryUpgrade(state, tileId, upgradeId, definitions)) {
    return state;
  }

  return {
    ...state,
    placedTiles: state.placedTiles.map((tile) =>
      tile.id === tileId
        ? {
            ...tile,
            upgradeIds: [...tile.upgradeIds, upgradeId],
          }
        : tile,
    ),
  };
}
