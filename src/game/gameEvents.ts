import type { PrototypePlaceableTileTypeId } from "../content/territoryTileDefinitions";
import type { StructureTypeId } from "../engine/structure";
import type { PrototypeUpgradeTypeId } from "../content/territoryUpgradeDefinitions";

/**
 * Evénement historique utilisé par PrototypeScene pour changer de mode bâtiment.
 */
export const SET_BUILD_MODE_EVENT = "citis:set-build-mode";

export type BuildMode = StructureTypeId | null;

/**
 * Evénement envoyé par React pour synchroniser la proposition sélectionnée.
 */
export const SET_SELECTED_TILE_TYPE_EVENT = "citis:set-selected-tile-type";

export type SelectedTileTypeId = PrototypePlaceableTileTypeId | null;

/**
 * Evénement envoyé par React pour autoriser ou bloquer le placement.
 */
export const SET_PLACEMENT_ENABLED_EVENT = "citis:set-placement-enabled";

/**
 * Evénement émis par Phaser lorsqu'une tuile de territoire est posée.
 */
export const TERRITORY_TILE_PLACED_EVENT = "citis:territory-tile-placed";

export interface TerritoryTilePlacedPayload {
  cellId: string;
  tileTypeId: PrototypePlaceableTileTypeId;
  rotation: HexRotation;
}

export const SET_SELECTED_UPGRADE_TYPE_EVENT =
  "citis:set-selected-upgrade-type";

export const SET_IMPROVEMENT_ENABLED_EVENT = "citis:set-improvement-enabled";

export const TERRITORY_UPGRADE_APPLIED_EVENT =
  "citis:territory-upgrade-applied";

export type SelectedUpgradeTypeId = PrototypeUpgradeTypeId | null;

export interface TerritoryUpgradeAppliedPayload {
  tileId: string;
  upgradeTypeId: PrototypeUpgradeTypeId;
}

import type { HexRotation } from "../engine/hex";
export const SET_SELECTED_TILE_ROTATION_EVENT =
  "citis:set-selected-tile-rotation";
