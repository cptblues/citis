import { describe, expect, it } from "vitest";
import { createBoardCellId } from "../engine/board";
import { getHexNeighbor, type HexSide } from "../engine/hex";
import { prototypeBoardCells } from "./prototypeBoard";

function countUniqueEdges(kind: "river" | "major-road"): number {
  const uniqueEdges = new Set<string>();

  for (const cell of prototypeBoardCells) {
    for (const [rawSide, features] of Object.entries(cell.edgeFeatures ?? {})) {
      if (!features?.some((feature) => feature.kind === kind)) {
        continue;
      }

      const side = Number(rawSide) as HexSide;
      const neighbor = getHexNeighbor(cell, side);
      const firstCellId = cell.id;
      const secondCellId = createBoardCellId(neighbor.q, neighbor.r);
      uniqueEdges.add([firstCellId, secondCellId].sort().join("|"));
    }
  }

  return uniqueEdges.size;
}

describe("prototypeBoardCells", () => {
  it("produit une silhouette irrégulière de cinquante-sept cases", () => {
    expect(prototypeBoardCells).toHaveLength(57);
    expect(new Set(prototypeBoardCells.map((cell) => cell.id)).size).toBe(57);
  });

  it("contient le bourg central et six cases bloquées", () => {
    expect(prototypeBoardCells).toContainEqual(
      expect.objectContaining({ id: "cell:0:0", q: 0, r: 0 }),
    );
    expect(
      prototypeBoardCells.filter((cell) => cell.blocked === true),
    ).toHaveLength(6);
  });

  it("matérialise dix-huit segments de rivière", () => {
    expect(countUniqueEdges("river")).toBe(18);
  });

  it("matérialise dix-sept connexions routières majeures", () => {
    expect(countUniqueEdges("major-road")).toBe(17);
  });

  it("ne référence que des voisins présents sur le plateau", () => {
    const cellIds = new Set(prototypeBoardCells.map((cell) => cell.id));

    for (const cell of prototypeBoardCells) {
      for (const rawSide of Object.keys(cell.edgeFeatures ?? {})) {
        const side = Number(rawSide) as HexSide;
        const neighbor = getHexNeighbor(cell, side);
        expect(cellIds).toContain(createBoardCellId(neighbor.q, neighbor.r));
      }
    }
  });
});
