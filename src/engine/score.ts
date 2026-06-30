import type { TerritoryScoringDefinition } from "../content/prototypeScenario";
import type { TerritoryResources } from "./resources";

const RESOURCE_KEYS = [
  "food",
  "energy",
  "nature",
  "happiness",
] as const satisfies readonly (keyof TerritoryResources)[];

export interface TerritoryScoreBreakdown {
  resourceScore: number;
  balanceRatio: number;
  balanceBonus: number;
  totalScore: number;
}

/**
 * Calcule le score d'un territoire sans dépendre de React ni de Phaser.
 *
 * Le score de ressources récompense la quantité produite. Le bonus d'équilibre
 * prend comme référence la ressource la plus éloignée de son objectif afin
 * d'éviter qu'une seule statistique très élevée suffise à gagner.
 */
export function calculateTerritoryScore(
  resources: TerritoryResources,
  scoring: TerritoryScoringDefinition,
): TerritoryScoreBreakdown {
  let resourceScore = 0;
  let balanceRatio = 1;

  for (const resourceKey of RESOURCE_KEYS) {
    resourceScore +=
      resources[resourceKey] * scoring.resourceWeights[resourceKey];

    const target = scoring.balanceTargets[resourceKey];
    const resourceRatio =
      target <= 0 ? 1 : clamp(resources[resourceKey] / target, 0, 1);

    balanceRatio = Math.min(balanceRatio, resourceRatio);
  }

  const roundedResourceScore = Math.round(resourceScore);
  const balanceBonus = Math.round(balanceRatio * scoring.maximumBalanceBonus);

  return {
    resourceScore: roundedResourceScore,
    balanceRatio,
    balanceBonus,
    totalScore: roundedResourceScore + balanceBonus,
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
