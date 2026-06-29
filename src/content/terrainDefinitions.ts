import type { TerrainTypeId } from "../engine/terrain";

export interface TerrainDefinition {
  label: string;
  fillColor: number;
  hoverColor: number;
}

export const TERRAIN_DEFINITIONS = {
  grass: {
    label: "Herbe",
    fillColor: 0xa8c97f,
    hoverColor: 0xc4dda4,
  },
  soil: {
    label: "Terre",
    fillColor: 0xd8b07b,
    hoverColor: 0xe7c89e,
  },
  rock: {
    label: "Roche",
    fillColor: 0xa8adb1,
    hoverColor: 0xc5c9cc,
  },
  water: {
    label: "Eau",
    fillColor: 0x78b8d6,
    hoverColor: 0x9bcce2,
  },
} satisfies Record<TerrainTypeId, TerrainDefinition>;

export function getTerrainDefinition(
  terrainTypeId: TerrainTypeId,
): TerrainDefinition {
  return TERRAIN_DEFINITIONS[terrainTypeId];
}
