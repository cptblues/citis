import { describe, expect, it } from "vitest";

import {
  axialToPixel,
  getHexCoordinatesInRadius,
  getHexCorners,
  getHexDistance,
  getItemsInHexRadius,
} from "./hex";

describe("getHexCorners", () => {
  it("génère six sommets", () => {
    const corners = getHexCorners(100, 100, 50);

    expect(corners).toHaveLength(6);
  });

  it("place le premier sommet au-dessus du centre", () => {
    const corners = getHexCorners(100, 100, 50);
    const firstCorner = corners[0];

    expect(firstCorner?.x).toBeCloseTo(100);
    expect(firstCorner?.y).toBeCloseTo(50);
  });

  it("place le quatrième sommet sous le centre", () => {
    const corners = getHexCorners(100, 100, 50);
    const bottomCorner = corners[3];

    expect(bottomCorner?.x).toBeCloseTo(100);
    expect(bottomCorner?.y).toBeCloseTo(150);
  });
});

describe("axialToPixel", () => {
  it("place la coordonnée centrale à l’origine", () => {
    const position = axialToPixel({ q: 0, r: 0 }, 50);

    expect(position.x).toBeCloseTo(0);
    expect(position.y).toBeCloseTo(0);
  });

  it("convertit une coordonnée voisine en position", () => {
    const position = axialToPixel({ q: 1, r: 0 }, 50);

    expect(position.x).toBeCloseTo(50 * Math.sqrt(3));
    expect(position.y).toBeCloseTo(0);
  });
});

describe("getHexCoordinatesInRadius", () => {
  it("génère uniquement la tuile centrale au rayon zéro", () => {
    const coordinates = getHexCoordinatesInRadius(0);

    expect(coordinates).toEqual([{ q: 0, r: 0 }]);
  });

  it("génère sept tuiles au rayon un", () => {
    const coordinates = getHexCoordinatesInRadius(1);

    expect(coordinates).toHaveLength(7);
  });

  it("génère dix-neuf tuiles au rayon deux", () => {
    const coordinates = getHexCoordinatesInRadius(2);

    expect(coordinates).toHaveLength(19);
  });
});

describe("getHexDistance", () => {
  it("retourne zéro pour la même coordonnée", () => {
    expect(getHexDistance({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(0);
  });

  it("retourne un pour une tuile voisine", () => {
    expect(getHexDistance({ q: 0, r: 0 }, { q: 1, r: 0 })).toBe(1);
  });

  it("retourne deux pour une tuile du second anneau", () => {
    expect(getHexDistance({ q: 0, r: 0 }, { q: 2, r: -1 })).toBe(2);
  });
});

describe("getItemsInHexRadius", () => {
  const items = [
    { id: "center", q: 0, r: 0 },
    { id: "neighbor-a", q: 1, r: 0 },
    { id: "neighbor-b", q: 0, r: 1 },
    { id: "far", q: 2, r: 0 },
  ];

  it("retourne le centre et ses voisins au rayon un", () => {
    const result = getItemsInHexRadius(items, items[0]!, 1);

    expect(result.map((item) => item.id)).toEqual([
      "center",
      "neighbor-a",
      "neighbor-b",
    ]);
  });
});
