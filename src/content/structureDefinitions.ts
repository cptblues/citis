import type { TerrainTypeId } from "../engine/terrain";
import type { StructureTypeId } from "../engine/structure";

export interface StructureDefinition {
  id: StructureTypeId;
  label: string;
  allowedTerrainTypeIds: readonly TerrainTypeId[];
  wallColor: number;
  roofColor: number;
  doorColor: number;
  populationCapacityByLevel: readonly [number, number, number];
}

export const STRUCTURE_DEFINITIONS = {
  housing: {
    id: "housing",
    label: "Habitation",
    allowedTerrainTypeIds: ["grass", "soil"],
    wallColor: 0xf5e6c8,
    roofColor: 0xb85f45,
    doorColor: 0x6c4835,
    populationCapacityByLevel: [10, 50, 100],
  },
} satisfies Record<StructureTypeId, StructureDefinition>;

export function getStructureDefinition(
  structureTypeId: StructureTypeId,
): StructureDefinition {
  return STRUCTURE_DEFINITIONS[structureTypeId];
}
