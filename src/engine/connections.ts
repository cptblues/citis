import type {
  BoardState,
  PlacedTerritoryTile,
  TerritoryTileTypeId,
} from "./board";
import {
  getHexSideBetween,
  getOppositeHexSide,
  rotateHexSide,
  type HexCoordinate,
  type HexRotation,
  type HexSide,
} from "./hex";

export interface TerritoryConnectionDefinition {
  connectionType: string;
  baseSides: readonly HexSide[];
}

export type TerritoryConnectionDefinitions = Partial<
  Record<TerritoryTileTypeId, TerritoryConnectionDefinition>
>;

export function getRotatedConnectionSides(
  tileTypeId: TerritoryTileTypeId,
  rotation: HexRotation,
  definitions: TerritoryConnectionDefinitions,
): HexSide[] {
  const definition = definitions[tileTypeId];

  if (definition === undefined) {
    return [];
  }

  return definition.baseSides.map((side) => rotateHexSide(side, rotation));
}

export function canPlaceTerritoryTileConnections(
  state: BoardState,
  coordinate: HexCoordinate,
  tileTypeId: TerritoryTileTypeId,
  rotation: HexRotation,
  definitions: TerritoryConnectionDefinitions,
): boolean {
  const definition = definitions[tileTypeId];

  if (definition === undefined) {
    return true;
  }

  const networkTiles = state.placedTiles.filter((tile) => {
    const tileDefinition = definitions[tile.typeId];

    return tileDefinition?.connectionType === definition.connectionType;
  });

  if (networkTiles.length === 0) {
    return true;
  }

  const adjacentNetworkTiles: Array<{
    tile: PlacedTerritoryTile;
    side: HexSide;
  }> = [];

  for (const tile of networkTiles) {
    const side = getHexSideBetween(coordinate, tile);

    if (side !== null) {
      adjacentNetworkTiles.push({
        tile,
        side,
      });
    }
  }

  if (adjacentNetworkTiles.length === 0) {
    return false;
  }

  const candidateSides = getRotatedConnectionSides(
    tileTypeId,
    rotation,
    definitions,
  );

  return adjacentNetworkTiles.every(({ tile, side }) => {
    const existingSides = getRotatedConnectionSides(
      tile.typeId,
      tile.rotation as HexRotation,
      definitions,
    );

    return (
      candidateSides.includes(side) &&
      existingSides.includes(getOppositeHexSide(side))
    );
  });
}
