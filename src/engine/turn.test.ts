import { describe, expect, it } from "vitest";

import {
  createInitialTurnState,
  endTurn,
  markImprovementCompleted,
  markPlacementCompleted,
} from "./turn";

describe("turn", () => {
  it("commence au tour un sans placement", () => {
    expect(createInitialTurnState()).toEqual({
      number: 1,
      placementCompleted: false,
      improvementCompleted: false,
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
      improvementCompleted: false,
    });
  });
});

it("autorise une amélioration après le placement", () => {
  const placementState = markPlacementCompleted(createInitialTurnState());

  expect(markImprovementCompleted(placementState)).toEqual({
    number: 1,
    placementCompleted: true,
    improvementCompleted: true,
  });
});
