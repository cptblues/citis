import { describe, expect, it } from "vitest";

import {
  createInitialTurnState,
  endTurn,
  markPlacementCompleted,
} from "./turn";

describe("turn", () => {
  it("commence au tour un sans placement", () => {
    expect(createInitialTurnState()).toEqual({
      number: 1,
      placementCompleted: false,
    });
  });

  it("refuse de terminer un tour sans placement", () => {
    const state = createInitialTurnState();

    expect(endTurn(state)).toBe(state);
  });

  it("passe au tour suivant après un placement", () => {
    const initialState = createInitialTurnState();

    const completedState = markPlacementCompleted(initialState);

    expect(endTurn(completedState)).toEqual({
      number: 2,
      placementCompleted: false,
    });
  });
});
