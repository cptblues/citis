import { createBoardCellId, type BoardCell } from "../engine/board";
import { getHexCoordinatesInRadius } from "../engine/hex";

export const PROTOTYPE_BOARD_RADIUS = 2;

export const prototypeBoardCells: BoardCell[] = getHexCoordinatesInRadius(
  PROTOTYPE_BOARD_RADIUS,
).map(({ q, r }) => ({
  id: createBoardCellId(q, r),
  q,
  r,
}));
