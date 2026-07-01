import { describe, expect, it } from "vitest";
import {
  calculateFitZoom,
  centerMapPointInViewport,
  clampMapPosition,
  zoomMapPositionAroundPoint,
} from "./territoryMapCameraMath";

const viewport = {
  x: 20,
  y: 100,
  width: 800,
  height: 400,
};

const contentBounds = {
  x: -500,
  y: -400,
  width: 1000,
  height: 800,
};

describe("territoryMapCameraMath", () => {
  it("calcule un zoom minimum qui affiche tout le territoire", () => {
    expect(calculateFitZoom(viewport, contentBounds)).toBe(0.5);
  });

  it("centre la carte quand elle est plus petite que la zone visible", () => {
    expect(
      clampMapPosition({ x: 999, y: -999 }, 0.4, viewport, contentBounds),
    ).toEqual({ x: 420, y: 300 });
  });

  it("conserve le point sous la souris pendant un zoom", () => {
    const position = centerMapPointInViewport({ x: 100, y: 50 }, 1, viewport);
    const anchor = { x: 260, y: 210 };
    const localXBefore = (anchor.x - position.x) / 1;
    const localYBefore = (anchor.y - position.y) / 1;
    const nextPosition = zoomMapPositionAroundPoint(position, 1, 1.5, anchor);

    expect((anchor.x - nextPosition.x) / 1.5).toBeCloseTo(localXBefore);
    expect((anchor.y - nextPosition.y) / 1.5).toBeCloseTo(localYBefore);
  });
});
