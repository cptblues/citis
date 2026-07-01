import type {
  PlaceableTerritoryTileTypeId,
  TerritoryTileTypeId,
} from "./territoryContentCatalog";
import type { BoardEdgeFeatureKind } from "../engine/board";
import type { HexCoordinate, HexRotation, HexSide } from "../engine/hex";
import type { TerritoryResources } from "../engine/resources";

export interface TerritoryScoringDefinition {
  resourceWeights: TerritoryResources;
  balanceTargets: TerritoryResources;
  maximumBalanceBonus: number;
}

export interface TerritoryScenarioBoardRow {
  r: number;
  minimumQ: number;
  maximumQ: number;
}

export interface TerritoryScenarioCellOverride extends HexCoordinate {
  blocked?: boolean;
}

export interface TerritoryScenarioEdgeDefinition {
  from: HexCoordinate;
  side: HexSide;
  kind: BoardEdgeFeatureKind;
  bridge?: boolean;
  blocksExpansion?: boolean;
}

export interface TerritoryScenarioInitialTileDefinition extends HexCoordinate {
  typeId: TerritoryTileTypeId;
  rotation: HexRotation;
}

export interface TerritoryScenarioBoardDefinition {
  rows: readonly TerritoryScenarioBoardRow[];
  cellOverrides: readonly TerritoryScenarioCellOverride[];
  edges: readonly TerritoryScenarioEdgeDefinition[];
  initialTiles: readonly TerritoryScenarioInitialTileDefinition[];
  proposalTileTypeIds: readonly PlaceableTerritoryTileTypeId[];
}

export interface TerritoryScenarioDefinition {
  id: string;
  label: string;
  description: string;
  maximumTurns: number;
  targetScore: number;
  scoring: TerritoryScoringDefinition;
  board: TerritoryScenarioBoardDefinition;
}

/**
 * Première commune jouable du prototype.
 *
 * Le territoire est volontairement inspiré de Toulouse sans chercher une
 * reproduction géographique exacte : silhouette allongée, fleuve structurant,
 * trois franchissements et quelques grands axes déjà présents.
 */
export const PROTOTYPE_SCENARIO = {
  id: "saint-verdant-metropole-fluviale",
  label: "Saint-Verdant",
  description:
    "Développe une métropole fluviale inspirée de Toulouse en composant avec son fleuve, ses ponts et ses grands axes.",
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
  board: {
    rows: [
      { r: -5, minimumQ: 2, maximumQ: 3 },
      { r: -4, minimumQ: 1, maximumQ: 4 },
      { r: -3, minimumQ: 0, maximumQ: 5 },
      { r: -2, minimumQ: -1, maximumQ: 5 },
      { r: -1, minimumQ: -2, maximumQ: 5 },
      { r: 0, minimumQ: -3, maximumQ: 4 },
      { r: 1, minimumQ: -3, maximumQ: 3 },
      { r: 2, minimumQ: -4, maximumQ: 1 },
      { r: 3, minimumQ: -4, maximumQ: 0 },
      { r: 4, minimumQ: -3, maximumQ: -1 },
      { r: 5, minimumQ: -3, maximumQ: -3 },
    ],
    cellOverrides: [
      { q: 3, r: -3, blocked: true },
      { q: 4, r: -1, blocked: true },
      { q: 2, r: 1, blocked: true },
      { q: -3, r: 2, blocked: true },
      { q: -4, r: 3, blocked: true },
      { q: -1, r: 4, blocked: true },
    ],
    initialTiles: [{ typeId: "town", q: 0, r: 0, rotation: 0 }],
    proposalTileTypeIds: ["prairie", "forest", "field", "orchard", "farm"],
    edges: [
      // Garonne abstraite : une ligne continue d'arêtes du nord au sud.
      {
        from: { q: 2, r: -5 },
        side: 5,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: 1, r: -4 },
        side: 0,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: 1, r: -3 },
        side: 1,
        kind: "river",
        bridge: true,
        blocksExpansion: true,
      },
      {
        from: { q: 1, r: -3 },
        side: 0,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: 1, r: -3 },
        side: 5,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: 0, r: -2 },
        side: 0,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: 0, r: -2 },
        side: 5,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: -1, r: -1 },
        side: 0,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: -1, r: 0 },
        side: 1,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: -1, r: 0 },
        side: 0,
        kind: "river",
        bridge: true,
        blocksExpansion: true,
      },
      {
        from: { q: -1, r: 1 },
        side: 1,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: -1, r: 1 },
        side: 0,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: -1, r: 1 },
        side: 5,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: -2, r: 2 },
        side: 0,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: -2, r: 3 },
        side: 1,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: -2, r: 3 },
        side: 0,
        kind: "river",
        bridge: true,
        blocksExpansion: true,
      },
      {
        from: { q: -2, r: 3 },
        side: 5,
        kind: "river",
        blocksExpansion: true,
      },
      {
        from: { q: -3, r: 4 },
        side: 0,
        kind: "river",
        blocksExpansion: true,
      },

      // Axe principal ouest-est, avec franchissement du fleuve au centre.
      { from: { q: -3, r: 0 }, side: 0, kind: "major-road" },
      { from: { q: -2, r: 0 }, side: 0, kind: "major-road" },
      { from: { q: -1, r: 0 }, side: 0, kind: "major-road" },
      { from: { q: 0, r: 0 }, side: 0, kind: "major-road" },
      { from: { q: 1, r: 0 }, side: 0, kind: "major-road" },
      { from: { q: 2, r: 0 }, side: 0, kind: "major-road" },
      { from: { q: 3, r: 0 }, side: 0, kind: "major-road" },

      // Axe nord sur la rive droite.
      { from: { q: 0, r: 0 }, side: 2, kind: "major-road" },
      { from: { q: 0, r: -1 }, side: 1, kind: "major-road" },
      { from: { q: 1, r: -2 }, side: 2, kind: "major-road" },
      { from: { q: 1, r: -3 }, side: 1, kind: "major-road" },
      { from: { q: 2, r: -4 }, side: 2, kind: "major-road" },

      // Axe sud, qui emprunte le troisième pont.
      { from: { q: 0, r: 0 }, side: 5, kind: "major-road" },
      { from: { q: 0, r: 1 }, side: 4, kind: "major-road" },
      { from: { q: -1, r: 2 }, side: 4, kind: "major-road" },
      { from: { q: -2, r: 3 }, side: 0, kind: "major-road" },
      { from: { q: -1, r: 3 }, side: 4, kind: "major-road" },
    ],
  },
} as const satisfies TerritoryScenarioDefinition;
