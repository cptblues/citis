import type { TerrainTypeId } from "./terrain";

export interface GameTile {
  id: string;
  q: number;
  r: number;
  terrainTypeId: TerrainTypeId;
}

export function createTileId(q: number, r: number): string {
  const normalizedQ = q === 0 ? 0 : q;
  const normalizedR = r === 0 ? 0 : r;

  return `tile:${normalizedQ}:${normalizedR}`;
}
