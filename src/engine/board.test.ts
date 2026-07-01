import { describe, expect, it } from "vitest";
import { prototypeBoardCells } from "../content/prototypeBoard";
import {
  createInitialBoardState,
  getAvailablePlacementCells,
  getPlacedTileAt,
  placeTerritoryTile,
  type BoardCell,
} from "./board";

function getCell(cellId: string): BoardCell {
  const cell = prototypeBoardCells.find((candidate) => candidate.id === cellId);

  if (cell === undefined) {
    throw new Error(`Case de test introuvable : ${cellId}`);
  }

  return cell;
}

describe("createInitialBoardState", () => {
  it("commence avec uniquement le bourg central", () => {
    const state = createInitialBoardState();

    expect(state.placedTiles).toHaveLength(1);
    expect(state.placedTiles[0]).toMatchObject({
      typeId: "town",
      q: 0,
      r: 0,
    });
  });
});

describe("getPlacedTileAt", () => {
  it("retrouve le bourg central", () => {
    const state = createInitialBoardState();
    const tile = getPlacedTileAt(state, { q: 0, r: 0 });

    expect(tile?.typeId).toBe("town");
  });
});

describe("getAvailablePlacementCells", () => {
  it("propose les cinq voisines accessibles du bourg au départ", () => {
    const state = createInitialBoardState();
    const availableCells = getAvailablePlacementCells(
      prototypeBoardCells,
      state,
    );

    expect(availableCells).toHaveLength(5);
  });

  it("autorise le franchissement de la rivière sur le pont central", () => {
    const availableCellIds = new Set(
      getAvailablePlacementCells(
        prototypeBoardCells,
        createInitialBoardState(),
      ).map((cell) => cell.id),
    );

    expect(availableCellIds).toContain("cell:-1:0");
  });

  it("bloque la propagation directe au travers de la rivière sans pont", () => {
    const availableCellIds = new Set(
      getAvailablePlacementCells(
        prototypeBoardCells,
        createInitialBoardState(),
      ).map((cell) => cell.id),
    );

    expect(availableCellIds).not.toContain("cell:-1:1");
  });

  it("ignore les cases déclarées non constructibles", () => {
    const state = {
      placedTiles: [
        {
          id: "territory:town:0:0",
          typeId: "town" as const,
          q: 0,
          r: 0,
          rotation: 0 as const,
          upgradeIds: [],
        },
      ],
    };
    const cells: BoardCell[] = [
      { id: "cell:0:0", q: 0, r: 0 },
      { id: "cell:1:0", q: 1, r: 0, blocked: true },
    ];

    expect(getAvailablePlacementCells(cells, state)).toHaveLength(0);
  });
});

describe("placeTerritoryTile", () => {
  it("place une prairie à côté du bourg", () => {
    const initialState = createInitialBoardState();
    const nextState = placeTerritoryTile(
      prototypeBoardCells,
      initialState,
      getCell("cell:1:0").id,
      "prairie",
    );
    const placedPrairie = getPlacedTileAt(nextState, { q: 1, r: 0 });

    expect(nextState.placedTiles).toHaveLength(2);
    expect(placedPrairie).toMatchObject({
      id: "territory:prairie:1:0",
      typeId: "prairie",
      q: 1,
      r: 0,
      rotation: 0,
      upgradeIds: [],
    });
  });

  it("conserve les caractéristiques d'arêtes de la case sur la tuile posée", () => {
    const initialState = createInitialBoardState();
    const targetCell = getCell("cell:1:0");
    const nextState = placeTerritoryTile(
      prototypeBoardCells,
      initialState,
      targetCell.id,
      "forest",
    );
    const placedForest = getPlacedTileAt(nextState, targetCell);

    expect(placedForest?.edgeFeatures).toBe(targetCell.edgeFeatures);
  });

  it("refuse une tuile éloignée du territoire", () => {
    const initialState = createInitialBoardState();
    const nextState = placeTerritoryTile(
      prototypeBoardCells,
      initialState,
      getCell("cell:2:0").id,
      "forest",
    );

    expect(nextState).toBe(initialState);
  });
});
