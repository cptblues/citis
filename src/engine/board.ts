import type {
  PlaceableTerritoryTileTypeId,
  TerritoryTileTypeId,
} from "../content/territoryContentCatalog";
import {
  canPlaceTerritoryTileConnections,
  type TerritoryConnectionDefinitions,
} from "./connections";
import {
  getHexDistance,
  getHexSideBetween,
  getOppositeHexSide,
  type HexCoordinate,
  type HexRotation,
  type HexSide,
} from "./hex";

export { TERRITORY_TILE_TYPE_IDS } from "../content/territoryContentCatalog";
export type {
  PlaceableTerritoryTileTypeId,
  TerritoryTileTypeId,
} from "../content/territoryContentCatalog";

export type BoardEdgeFeatureKind = "river" | "major-road";

export interface BoardEdgeFeature {
  kind: BoardEdgeFeatureKind;
  bridge?: boolean;
  blocksExpansion?: boolean;
}

export interface BoardCell extends HexCoordinate {
  id: string;
  blocked?: boolean;
  edgeFeatures?: Partial<Record<HexSide, readonly BoardEdgeFeature[]>>;
}

export interface PlacedTerritoryTile extends HexCoordinate {
  id: string;
  typeId: TerritoryTileTypeId;
  rotation: HexRotation;
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
 * Liste les cases libres atteignables depuis au moins une tuile déjà posée.
 *
 * Une rivière définie sur l'arête partagée bloque la propagation du territoire,
 * sauf lorsqu'un pont est explicitement présent sur cette traversée.
 */
export function getAvailablePlacementCells(
  cells: readonly BoardCell[],
  state: BoardState,
): BoardCell[] {
  return cells.filter((cell) => {
    if (cell.blocked === true || getPlacedTileAt(state, cell) !== undefined) {
      return false;
    }

    return state.placedTiles.some((placedTile) => {
      if (getHexDistance(cell, placedTile) !== 1) {
        return false;
      }

      return !edgeBlocksTerritoryExpansion(cells, placedTile, cell);
    });
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
  rotation: HexRotation = 0,
  connectionDefinitions: TerritoryConnectionDefinitions = {},
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

  if (
    !canPlaceTerritoryTileConnections(
      state,
      cell,
      tileTypeId,
      rotation,
      connectionDefinitions,
    )
  ) {
    return state;
  }

  const placedTile: PlacedTerritoryTile = {
    id: `territory:${tileTypeId}:${cell.q}:${cell.r}`,
    typeId: tileTypeId,
    q: cell.q,
    r: cell.r,
    rotation,
    upgradeIds: [],
  };

  return {
    ...state,
    placedTiles: [...state.placedTiles, placedTile],
  };
}

function edgeBlocksTerritoryExpansion(
  cells: readonly BoardCell[],
  origin: HexCoordinate,
  destination: BoardCell,
): boolean {
  const originCell = cells.find(
    (cell) => cell.q === origin.q && cell.r === origin.r,
  );

  if (originCell === undefined) {
    return false;
  }

  const originSide = getHexSideBetween(originCell, destination);

  if (originSide === null) {
    return false;
  }

  const destinationSide = getOppositeHexSide(originSide);
  const features = [
    ...(originCell.edgeFeatures?.[originSide] ?? []),
    ...(destination.edgeFeatures?.[destinationSide] ?? []),
  ];

  return features.some(
    (feature) => feature.blocksExpansion === true && feature.bridge !== true,
  );
}
