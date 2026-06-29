import { describe, expect, it } from "vitest";

import { prototypeBoardCells } from "../content/prototypeBoard";
import {
  createInitialBoardState,
  getAvailablePlacementCells,
  getPlacedTileAt,
  placeTerritoryTile,
} from "./board";

describe("createInitialBoardState", () => {
  it("commence avec uniquement le bourg central", () => {
    const state = createInitialBoardState();

    expect(state.placedTiles).toHaveLength(1);

    expect(state.placedTiles[0]).toMatchObject({
      typeId: "town",
      q: 0,
      r: 0,
    });
  });
});

describe("getPlacedTileAt", () => {
  it("retrouve le bourg central", () => {
    const state = createInitialBoardState();

    const tile = getPlacedTileAt(state, {
      q: 0,
      r: 0,
    });

    expect(tile?.typeId).toBe("town");
  });
});

describe("getAvailablePlacementCells", () => {
  it("propose les six voisines du bourg au départ", () => {
    const state = createInitialBoardState();

    const availableCells = getAvailablePlacementCells(
      prototypeBoardCells,
      state,
    );

    expect(availableCells).toHaveLength(6);
  });
});

describe("placeTerritoryTile", () => {
  it("place une prairie à côté du bourg", () => {
    const initialState = createInitialBoardState();

    const nextState = placeTerritoryTile(
      prototypeBoardCells,
      initialState,
      "cell:1:0",
      "prairie",
    );

    expect(nextState.placedTiles).toHaveLength(2);

    expect(nextState.placedTiles).toContainEqual({
      id: "territory:prairie:1:0",
      typeId: "prairie",
      q: 1,
      r: 0,
      rotation: 0,
      upgradeIds: [],
    });
  });

  it("refuse une tuile éloignée du territoire", () => {
    const initialState = createInitialBoardState();

    const nextState = placeTerritoryTile(
      prototypeBoardCells,
      initialState,
      "cell:2:0",
      "forest",
    );

    expect(nextState).toBe(initialState);
  });
});
