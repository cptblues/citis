import { describe, expect, it } from "vitest";

import { TERRITORY_CONNECTION_DEFINITIONS } from "../content/territoryConnectionDefinitions";
import { canPlaceTerritoryTileConnections } from "../engine/connections";
import { createInitialBoardState, placeTerritoryTile } from "../engine/board";

describe("river connections", () => {
  it("autorise la première rivière", () => {
    expect(
      canPlaceTerritoryTileConnections(
        createInitialBoardState(),
        { q: 1, r: 0 },
        "river",
        0,
        TERRITORY_CONNECTION_DEFINITIONS,
      ),
    ).toBe(true);
  });

  it("refuse une rivière non connectée", () => {
    const state = placeTerritoryTile(
      [
        { id: "cell:0:0", q: 0, r: 0 },
        { id: "cell:1:0", q: 1, r: 0 },
        { id: "cell:2:0", q: 2, r: 0 },
      ],
      createInitialBoardState(),
      "cell:1:0",
      "river",
      0,
      TERRITORY_CONNECTION_DEFINITIONS,
    );

    expect(
      canPlaceTerritoryTileConnections(
        state,
        { q: 2, r: 0 },
        "river",
        0,
        TERRITORY_CONNECTION_DEFINITIONS,
      ),
    ).toBe(false);
  });

  it("autorise la bonne rotation", () => {
    const state = placeTerritoryTile(
      [
        { id: "cell:0:0", q: 0, r: 0 },
        { id: "cell:1:0", q: 1, r: 0 },
        { id: "cell:2:0", q: 2, r: 0 },
      ],
      createInitialBoardState(),
      "cell:1:0",
      "river",
      0,
      TERRITORY_CONNECTION_DEFINITIONS,
    );

    expect(
      canPlaceTerritoryTileConnections(
        state,
        { q: 2, r: 0 },
        "river",
        3,
        TERRITORY_CONNECTION_DEFINITIONS,
      ),
    ).toBe(true);
  });
});
