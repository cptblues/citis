import type { TerritoryResources } from "../engine/resources";

export interface TerritoryScoringDefinition {
  resourceWeights: TerritoryResources;
  balanceTargets: TerritoryResources;
  maximumBalanceBonus: number;
}

export interface TerritoryScenarioDefinition {
  id: string;
  label: string;
  description: string;
  maximumTurns: number;
  targetScore: number;
  scoring: TerritoryScoringDefinition;
}

/**
 * Première commune jouable du prototype.
 *
 * Les valeurs sont volontairement provisoires : elles servent à obtenir une
 * boucle complète et seront recalibrées après plusieurs parties de test.
 */
export const PROTOTYPE_SCENARIO = {
  id: "saint-verdant-prototype",
  label: "Saint-Verdant",
  description:
    "Développe une commune productive, vivante et équilibrée en quinze tours.",
  maximumTurns: 15,
  targetScore: 4000,
  scoring: {
    resourceWeights: {
      food: 20,
      energy: 100,
      nature: 25,
      happiness: 40,
    },
    balanceTargets: {
      food: 35,
      energy: 6,
      nature: 35,
      happiness: 20,
    },
    maximumBalanceBonus: 1000,
  },
} satisfies TerritoryScenarioDefinition;
