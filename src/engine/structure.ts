import type { GameTile } from "./gameTile";
import type { TerrainTypeId } from "./terrain";

export const STRUCTURE_TYPE_IDS = ["housing"] as const;

export type StructureTypeId = (typeof STRUCTURE_TYPE_IDS)[number];

export interface PlacedStructure {
  id: string;
  typeId: StructureTypeId;
  tileId: string;
  level: 1 | 2 | 3;
}

export interface GameState {
  structures: PlacedStructure[];
}

export interface PlaceStructureAction {
  type: "place-structure";
  structureTypeId: StructureTypeId;
  tileId: string;
}

export interface StructurePlacementRule {
  allowedTerrainTypeIds: readonly TerrainTypeId[];
}

export function createInitialGameState(): GameState {
  return {
    structures: [],
  };
}

export function canPlaceStructure(
  state: GameState,
  tile: GameTile,
  rule: StructurePlacementRule,
): boolean {
  const tileIsOccupied = state.structures.some(
    (structure) => structure.tileId === tile.id,
  );

  const terrainIsAllowed = rule.allowedTerrainTypeIds.includes(
    tile.terrainTypeId,
  );

  return !tileIsOccupied && terrainIsAllowed;
}

export function applyPlaceStructure(
  state: GameState,
  action: PlaceStructureAction,
): GameState {
  const tileIsOccupied = state.structures.some(
    (structure) => structure.tileId === action.tileId,
  );

  if (tileIsOccupied) {
    return state;
  }

  const structure: PlacedStructure = {
    id: `structure:${action.structureTypeId}:${action.tileId}`,
    typeId: action.structureTypeId,
    tileId: action.tileId,
    level: 1,
  };

  return {
    ...state,
    structures: [...state.structures, structure],
  };
}
