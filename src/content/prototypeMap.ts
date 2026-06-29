import type { GameTile } from "../engine/gameTile";
import { createTileId } from "../engine/gameTile";
import { getHexCoordinatesInRadius } from "../engine/hex";
import type { TerrainTypeId } from "../engine/terrain";

export const PROTOTYPE_MAP_RADIUS = 2;

const PROTOTYPE_TERRAIN_BY_TILE_ID: Partial<Record<string, TerrainTypeId>> = {
  "tile:-2:0": "water",
  "tile:-1:0": "water",
  "tile:0:0": "water",
  "tile:1:0": "water",
  "tile:2:0": "water",

  "tile:-2:1": "rock",
  "tile:-1:1": "rock",
  "tile:0:2": "rock",

  "tile:1:-2": "soil",
  "tile:1:-1": "soil",
  "tile:2:-1": "soil",
};

export const prototypeTiles: GameTile[] = getHexCoordinatesInRadius(
  PROTOTYPE_MAP_RADIUS,
).map(({ q, r }) => {
  const id = createTileId(q, r);

  return {
    id,
    q,
    r,
    terrainTypeId: PROTOTYPE_TERRAIN_BY_TILE_ID[id] ?? "grass",
  };
});
