import type { TerritoryConnectionDefinitions } from "../engine/connections";
import {
  TERRITORY_TILE_DEFINITIONS,
  PROTOTYPE_PLACEABLE_TILE_TYPE_IDS,
} from "./territoryTileDefinitions";

const connectionEntries = PROTOTYPE_PLACEABLE_TILE_TYPE_IDS.flatMap(
  (tileTypeId) => {
    const connection =
      TERRITORY_TILE_DEFINITIONS[tileTypeId].placement.connection;

    if (connection === null) {
      return [];
    }

    return [
      [
        tileTypeId,
        {
          connectionType: connection.connectionType,
          baseSides: connection.baseSides,
        },
      ],
    ] as const;
  },
);

export const TERRITORY_CONNECTION_DEFINITIONS = Object.fromEntries(
  connectionEntries,
) as TerritoryConnectionDefinitions;
