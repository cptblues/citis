import { describe, expect, it } from "vitest";
import { formatTerritorySynergyPreviewLabel } from "./placementPreview";
import type { ActiveTerritorySynergy } from "./synergies";

function createSynergy(
  resourceBonus: ActiveTerritorySynergy["resourceBonus"],
): ActiveTerritorySynergy {
  return {
    id: "synergy:test:first|second",
    definitionId: "test",
    label: "Synergie test",
    tileIds: ["first", "second"],
    resourceBonus,
  };
}

describe("formatTerritorySynergyPreviewLabel", () => {
  it("affiche les gains propres à la synergie", () => {
    expect(
      formatTerritorySynergyPreviewLabel(
        createSynergy({
          food: 2,
          energy: 0,
          nature: 1,
          happiness: 0,
        }),
      ),
    ).toBe("Synergie test (+2 Nourriture · +1 Nature)");
  });

  it("conserve le libellé seul lorsque la synergie n'a aucun bonus", () => {
    expect(
      formatTerritorySynergyPreviewLabel(
        createSynergy({
          food: 0,
          energy: 0,
          nature: 0,
          happiness: 0,
        }),
      ),
    ).toBe("Synergie test");
  });
});
