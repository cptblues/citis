import type { HexSide } from "../engine/hex";
import type { TerritoryResources } from "../engine/resources";

interface TerritoryConnectionContentDefinition {
  connectionType: string;
  baseSides: readonly HexSide[];
}

interface TerritoryPlacementContentDefinition {
  placeable: boolean;
  rotationEnabled: boolean;
  previewContentEnabled: boolean;
  invalidMessage: string | null;
  connection: TerritoryConnectionContentDefinition | null;
}

interface TerritoryProposalContentDefinition {
  enabled: boolean;
  order: number;
}

interface TerritoryTileContentDefinition {
  label: string;
  fillColor: number;
  hoverColor: number;
  strokeColor: number;
  baseResources: TerritoryResources;
  tags: readonly string[];
  renderer: string;
  placement: TerritoryPlacementContentDefinition;
  proposals: TerritoryProposalContentDefinition;
}

interface TerritoryUpgradeTargetDefinition {
  requiredTags: readonly string[];
  label: string;
}

interface TerritoryUpgradeUiDefinition {
  selectionMessage: string;
  unavailableMessage: string;
  appliedMessage: string;
}

interface TerritoryUpgradeContentDefinition {
  label: string;
  description: string;
  target: TerritoryUpgradeTargetDefinition;
  resourceBonus: TerritoryResources;
  renderer: string;
  ui: TerritoryUpgradeUiDefinition;
}

interface TerritoryAdjacencyTagCondition {
  kind: "adjacent-tags";
  firstTag: string;
  secondTag: string;
}

interface TerritorySynergyContentDefinition {
  id: string;
  label: string;
  condition: TerritoryAdjacencyTagCondition;
  resourceBonus: TerritoryResources;
}

interface TerritoryContentCatalog {
  proposalCount: number;
  tiles: Readonly<Record<string, TerritoryTileContentDefinition>>;
  upgrades: Readonly<Record<string, TerritoryUpgradeContentDefinition>>;
  synergies: readonly TerritorySynergyContentDefinition[];
}

/**
 * Catalogue de contenu du prototype.
 *
 * Ce fichier ne contient que des données sérialisables. Il peut donc être
 * déplacé vers du JSON plus tard sans déplacer les règles du moteur ni le
 * rendu Phaser.
 */
export const TERRITORY_CONTENT = {
  proposalCount: 3,

  tiles: {
    town: {
      label: "Bourg",
      fillColor: 0xf2d492,
      hoverColor: 0xf7dfaa,
      strokeColor: 0x18351f,
      baseResources: {
        food: 0,
        energy: 0,
        nature: 0,
        happiness: 0,
      },
      tags: ["settlement"],
      renderer: "town",
      placement: {
        placeable: false,
        rotationEnabled: false,
        previewContentEnabled: false,
        invalidMessage: null,
        connection: null,
      },
      proposals: {
        enabled: false,
        order: 0,
      },
    },

    prairie: {
      label: "Prairie",
      fillColor: 0xa9cf7c,
      hoverColor: 0xc1df9d,
      strokeColor: 0x4b793d,
      baseResources: {
        food: 0,
        energy: 0,
        nature: 2,
        happiness: 2,
      },
      tags: ["natural", "grassland"],
      renderer: "prairie",
      placement: {
        placeable: true,
        rotationEnabled: false,
        previewContentEnabled: false,
        invalidMessage: null,
        connection: null,
      },
      proposals: {
        enabled: true,
        order: 1,
      },
    },

    forest: {
      label: "Forêt",
      fillColor: 0x659765,
      hoverColor: 0x7ead7e,
      strokeColor: 0x28563a,
      baseResources: {
        food: 0,
        energy: 0,
        nature: 4,
        happiness: 1,
      },
      tags: ["natural", "forest"],
      renderer: "forest",
      placement: {
        placeable: true,
        rotationEnabled: false,
        previewContentEnabled: false,
        invalidMessage: null,
        connection: null,
      },
      proposals: {
        enabled: true,
        order: 2,
      },
    },

    river: {
      label: "Rivière",
      fillColor: 0x78bfd2,
      hoverColor: 0xa1dbe5,
      strokeColor: 0x2e7185,
      baseResources: {
        food: 0,
        energy: 0,
        nature: 3,
        happiness: 1,
      },
      tags: ["natural", "water"],
      renderer: "river",
      placement: {
        placeable: true,
        rotationEnabled: true,
        previewContentEnabled: true,
        invalidMessage:
          "Connexion invalide · tourne la Rivière pour prolonger le cours d’eau.",
        connection: {
          connectionType: "river",
          baseSides: [0, 2],
        },
      },
      proposals: {
        enabled: true,
        order: 3,
      },
    },
  },

  upgrades: {
    "forest-trail": {
      label: "Sentier forestier",
      description: "Rend la forêt accessible aux habitants.",
      target: {
        requiredTags: ["forest"],
        label: "Forêt",
      },
      resourceBonus: {
        food: 0,
        energy: 0,
        nature: 0,
        happiness: 2,
      },
      renderer: "forest-trail",
      ui: {
        selectionMessage: "Sélectionne une Forêt à améliorer",
        unavailableMessage:
          "Sentier forestier : nécessite une Forêt disponible",
        appliedMessage: "Le sentier améliore désormais cette Forêt.",
      },
    },
  },

  synergies: [
    {
      id: "connected-forests",
      label: "Forêts connectées",
      condition: {
        kind: "adjacent-tags",
        firstTag: "forest",
        secondTag: "forest",
      },
      resourceBonus: {
        food: 0,
        energy: 0,
        nature: 2,
        happiness: 0,
      },
    },
  ],
} as const satisfies TerritoryContentCatalog;

export type TerritoryTileTypeId = keyof typeof TERRITORY_CONTENT.tiles;

export type PlaceableTerritoryTileTypeId = {
  [TileTypeId in TerritoryTileTypeId]: (typeof TERRITORY_CONTENT.tiles)[TileTypeId]["placement"]["placeable"] extends true
    ? TileTypeId
    : never;
}[TerritoryTileTypeId];

export type TerritoryUpgradeTypeId = keyof typeof TERRITORY_CONTENT.upgrades;

export type TerritoryTileRendererKey =
  (typeof TERRITORY_CONTENT.tiles)[TerritoryTileTypeId]["renderer"];

export type TerritoryUpgradeRendererKey =
  (typeof TERRITORY_CONTENT.upgrades)[TerritoryUpgradeTypeId]["renderer"];

export type TerritoryTileTag =
  (typeof TERRITORY_CONTENT.tiles)[TerritoryTileTypeId]["tags"][number];

export const TERRITORY_TILE_TYPE_IDS = Object.keys(
  TERRITORY_CONTENT.tiles,
) as TerritoryTileTypeId[];

export const TERRITORY_UPGRADE_TYPE_IDS = Object.keys(
  TERRITORY_CONTENT.upgrades,
) as TerritoryUpgradeTypeId[];
