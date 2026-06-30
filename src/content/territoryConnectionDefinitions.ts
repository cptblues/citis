import type { TerritoryConnectionDefinitions } from "../engine/connections";

export const TERRITORY_CONNECTION_DEFINITIONS = {
  river: {
    connectionType: "river",
    baseSides: [0, 2],
  },
} as const satisfies TerritoryConnectionDefinitions;
