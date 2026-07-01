import {
  createBoardCellId,
  type BoardCell,
  type BoardEdgeFeature,
} from "../engine/board";
import {
  getHexNeighbor,
  getOppositeHexSide,
  type HexSide,
} from "../engine/hex";
import {
  PROTOTYPE_SCENARIO,
  type TerritoryScenarioBoardDefinition,
  type TerritoryScenarioEdgeDefinition,
} from "./prototypeScenario";

interface MutableBoardCell extends BoardCell {
  edgeFeatures: Partial<Record<HexSide, BoardEdgeFeature[]>>;
}

export function createScenarioBoardCells(
  definition: TerritoryScenarioBoardDefinition,
): BoardCell[] {
  const overridesByCellId = new Map(
    definition.cellOverrides.map((override) => [
      createBoardCellId(override.q, override.r),
      override,
    ]),
  );
  const cells: MutableBoardCell[] = [];

  for (const row of definition.rows) {
    for (let q = row.minimumQ; q <= row.maximumQ; q += 1) {
      const id = createBoardCellId(q, row.r);
      const override = overridesByCellId.get(id);

      cells.push({
        id,
        q,
        r: row.r,
        blocked: override?.blocked,
        edgeFeatures: {},
      });
    }
  }

  const cellsById = new Map(cells.map((cell) => [cell.id, cell]));

  for (const edge of definition.edges) {
    attachEdgeFeature(cellsById, edge);
  }

  return cells;
}

export const prototypeBoardCells = createScenarioBoardCells(
  PROTOTYPE_SCENARIO.board,
);

function attachEdgeFeature(
  cellsById: ReadonlyMap<string, MutableBoardCell>,
  edge: TerritoryScenarioEdgeDefinition,
): void {
  const originCellId = createBoardCellId(edge.from.q, edge.from.r);
  const originCell = cellsById.get(originCellId);

  if (originCell === undefined) {
    throw new Error(`Arête de scénario sans case d'origine : ${originCellId}`);
  }

  const neighborCoordinate = getHexNeighbor(edge.from, edge.side);
  const neighborCellId = createBoardCellId(
    neighborCoordinate.q,
    neighborCoordinate.r,
  );
  const neighborCell = cellsById.get(neighborCellId);

  if (neighborCell === undefined) {
    throw new Error(
      `Arête de scénario ${originCellId}/${edge.side} sans case voisine : ${neighborCellId}`,
    );
  }

  const feature: BoardEdgeFeature = {
    kind: edge.kind,
    bridge: edge.bridge,
    blocksExpansion: edge.blocksExpansion,
  };

  addFeatureToCellSide(originCell, edge.side, feature);
  addFeatureToCellSide(neighborCell, getOppositeHexSide(edge.side), feature);
}

function addFeatureToCellSide(
  cell: MutableBoardCell,
  side: HexSide,
  feature: BoardEdgeFeature,
): void {
  const currentFeatures = cell.edgeFeatures[side] ?? [];
  cell.edgeFeatures[side] = [...currentFeatures, feature];
}
