import { describe, expect, it } from "vitest";

import {
  calculateGlobalMetrics,
  type StructureMetricDefinitions,
} from "./metrics";
import type { GameState } from "./structure";

const definitions = {
  housing: {
    populationCapacityByLevel: [10, 50, 100],
  },
} satisfies StructureMetricDefinitions;

describe("calculateGlobalMetrics", () => {
  it("retourne une capacité nulle sans structure", () => {
    const state: GameState = {
      structures: [],
    };

    const metrics = calculateGlobalMetrics(state, definitions);

    expect(metrics.populationCapacity).toBe(0);
  });

  it("additionne les capacités des habitations", () => {
    const state: GameState = {
      structures: [
        {
          id: "structure:housing:first",
          typeId: "housing",
          tileId: "tile:0:0",
          level: 1,
        },
        {
          id: "structure:housing:second",
          typeId: "housing",
          tileId: "tile:1:0",
          level: 2,
        },
      ],
    };

    const metrics = calculateGlobalMetrics(state, definitions);

    expect(metrics.populationCapacity).toBe(60);
  });
});
