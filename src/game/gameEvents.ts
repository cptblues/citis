import type { StructureTypeId } from "../engine/structure";

export const SET_BUILD_MODE_EVENT = "citis:set-build-mode";

export type BuildMode = StructureTypeId | null;

import type { PrototypePlaceableTileTypeId } from "../content/territoryTileDefinitions";

export const SET_SELECTED_TILE_TYPE_EVENT = "citis:set-selected-tile-type";

export type SelectedTileTypeId = PrototypePlaceableTileTypeId | null;
