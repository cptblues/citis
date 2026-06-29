export const TERRAIN_TYPE_IDS = ["grass", "soil", "rock", "water"] as const;

export type TerrainTypeId = (typeof TERRAIN_TYPE_IDS)[number];
