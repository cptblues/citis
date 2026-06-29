import { describe, expect, it } from "vitest";

import { prototypeTiles } from "./prototypeMap";
import { TERRAIN_TYPE_IDS } from "../engine/terrain";

describe("prototypeTiles", () => {
  it("contient dix-neuf tuiles", () => {
    expect(prototypeTiles).toHaveLength(19);
  });

  it("contient une tuile centrale", () => {
    expect(prototypeTiles).toContainEqual({
      id: "tile:0:0",
      q: 0,
      r: 0,
      terrainTypeId: "water",
    });
  });

  it("possède un identifiant unique pour chaque tuile", () => {
    const ids = prototypeTiles.map((tile) => tile.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(prototypeTiles.length);
  });

  it("attribue un type de terrain valide à chaque tuile", () => {
    for (const tile of prototypeTiles) {
      expect(TERRAIN_TYPE_IDS).toContain(tile.terrainTypeId);
    }
  });
});
