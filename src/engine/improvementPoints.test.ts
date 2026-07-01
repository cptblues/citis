import { describe, expect, it } from "vitest";

import {
  canSpendImprovementPoints,
  createInitialImprovementPoints,
  getImprovementPointsGrantedAtTurn,
  getNextImprovementPointGrantTurn,
  grantImprovementPointsForTurn,
  spendImprovementPoints,
  type ImprovementPointSchedule,
} from "./improvementPoints";

const schedule: ImprovementPointSchedule = {
  initialPoints: 2,
  pointsPerGrant: 1,
  pointsGrantedAtTurns: [4, 7, 10, 13],
};

describe("improvement points", () => {
  it("initialise la réserve du scénario", () => {
    expect(createInitialImprovementPoints(schedule)).toBe(2);
  });

  it("accorde un point uniquement aux tours prévus", () => {
    expect(getImprovementPointsGrantedAtTurn(3, schedule)).toBe(0);
    expect(getImprovementPointsGrantedAtTurn(4, schedule)).toBe(1);
  });

  it("conserve les points non dépensés", () => {
    expect(grantImprovementPointsForTurn(2, 4, schedule)).toBe(3);
    expect(grantImprovementPointsForTurn(3, 5, schedule)).toBe(3);
  });

  it("refuse une dépense trop élevée", () => {
    expect(canSpendImprovementPoints(1, 2)).toBe(false);
    expect(spendImprovementPoints(1, 2)).toBe(1);
  });

  it("déduit le coût d’une amélioration abordable", () => {
    expect(canSpendImprovementPoints(2, 2)).toBe(true);
    expect(spendImprovementPoints(2, 2)).toBe(0);
  });

  it("retrouve le prochain tour qui accorde un point", () => {
    expect(getNextImprovementPointGrantTurn(1, schedule)).toBe(4);
    expect(getNextImprovementPointGrantTurn(4, schedule)).toBe(7);
    expect(getNextImprovementPointGrantTurn(13, schedule)).toBeNull();
  });
});
