import type { PrototypePlaceableTileTypeId } from "../content/territoryTileDefinitions";
import type { PrototypeUpgradeTypeId } from "../content/territoryUpgradeDefinitions";
import type { HexRotation } from "../engine/hex";
import type { TerritoryResources } from "../engine/resources";

/**
 * Événement envoyé par React pour synchroniser la proposition sélectionnée.
 */
export const SET_SELECTED_TILE_TYPE_EVENT = "citis:set-selected-tile-type";
export type SelectedTileTypeId = PrototypePlaceableTileTypeId | null;

/** Événement envoyé par React pour autoriser ou bloquer le placement. */
export const SET_PLACEMENT_ENABLED_EVENT = "citis:set-placement-enabled";

/**
 * Événement émis par Phaser lorsqu'une tuile de territoire est posée.
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

export const SET_SELECTED_TILE_ROTATION_EVENT =
  "citis:set-selected-tile-rotation";

/** Commandes React vers la caméra interne du territoire. */
export const TERRITORY_MAP_ZOOM_IN_EVENT = "citis:territory-map-zoom-in";
export const TERRITORY_MAP_ZOOM_OUT_EVENT = "citis:territory-map-zoom-out";
export const TERRITORY_MAP_FIT_EVENT = "citis:territory-map-fit";

/**
 * Résumé émis par la scène après chaque changement de ressources.
 */
export const TERRITORY_SUMMARY_CHANGED_EVENT =
  "citis:territory-summary-changed";
export interface TerritorySummaryChangedPayload {
  resources: TerritoryResources;
  placedTileCount: number;
}

/**
 * Émis lorsque le joueur survole ou quitte une case pendant un placement.
 *
 * `null` signifie qu'aucune case n'est actuellement prévisualisée.
 */
export const TERRITORY_PLACEMENT_PREVIEW_CHANGED_EVENT =
  "citis:territory-placement-preview-changed";
export interface TerritoryPlacementPreviewPayload {
  valid: boolean;
  message: string;
  synergyLabels: readonly string[];
}
export type TerritoryPlacementPreviewChangedPayload =
  TerritoryPlacementPreviewPayload | null;
