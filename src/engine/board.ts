import { getHexDistance, type HexCoordinate } from "./hex";

export const TERRITORY_TILE_TYPE_IDS = [
  "town",
  "prairie",
  "forest",
  "river",
  "field",
  "orchard",
  "farm",
] as const;

export type TerritoryTileTypeId = (typeof TERRITORY_TILE_TYPE_IDS)[number];

export type PlaceableTerritoryTileTypeId = Exclude<TerritoryTileTypeId, "town">;

export interface BoardCell extends HexCoordinate {
  id: string;
}

export interface PlacedTerritoryTile extends HexCoordinate {
  id: string;
  typeId: TerritoryTileTypeId;
  rotation: number;
  upgradeIds: string[];
}

export interface BoardState {
  placedTiles: PlacedTerritoryTile[];
}

/**
 * Produit l'identifiant stable d'une case du plateau depuis ses coordonnées.
 */
export function createBoardCellId(q: number, r: number): string {
  const normalizedQ = q === 0 ? 0 : q;
  const normalizedR = r === 0 ? 0 : r;

  return `cell:${normalizedQ}:${normalizedR}`;
}

/**
 * Démarre le plateau avec le bourg central déjà posé.
 */
export function createInitialBoardState(): BoardState {
  return {
    placedTiles: [
      {
        id: "territory:town:0:0",
        typeId: "town",
        q: 0,
        r: 0,
        rotation: 0,
        upgradeIds: [],
      },
    ],
  };
}

/**
 * Retrouve la tuile de territoire occupant une coordonnée donnée.
 */
export function getPlacedTileAt(
  state: BoardState,
  coordinate: HexCoordinate,
): PlacedTerritoryTile | undefined {
  return state.placedTiles.find(
    (tile) => tile.q === coordinate.q && tile.r === coordinate.r,
  );
}

/**
 * Liste les cases libres adjacentes à au moins une tuile déjà posée.
 */
export function getAvailablePlacementCells(
  cells: readonly BoardCell[],
  state: BoardState,
): BoardCell[] {
  return cells.filter((cell) => {
    const isOccupied = getPlacedTileAt(state, cell) !== undefined;

    if (isOccupied) {
      return false;
    }

    return state.placedTiles.some(
      (placedTile) => getHexDistance(cell, placedTile) === 1,
    );
  });
}

/**
 * Place une tuile de territoire si la case existe et respecte les règles.
 */
export function placeTerritoryTile(
  cells: readonly BoardCell[],
  state: BoardState,
  cellId: string,
  tileTypeId: PlaceableTerritoryTileTypeId,
): BoardState {
  const cell = cells.find((candidate) => candidate.id === cellId);

  if (cell === undefined) {
    return state;
  }

  const availableCells = getAvailablePlacementCells(cells, state);

  const placementIsAvailable = availableCells.some(
    (availableCell) => availableCell.id === cell.id,
  );

  if (!placementIsAvailable) {
    return state;
  }

  const placedTile: PlacedTerritoryTile = {
    id: `territory:${tileTypeId}:${cell.q}:${cell.r}`,
    typeId: tileTypeId,
    q: cell.q,
    r: cell.r,
    rotation: 0,
    upgradeIds: [],
  };

  return {
    ...state,
    placedTiles: [...state.placedTiles, placedTile],
  };
}
