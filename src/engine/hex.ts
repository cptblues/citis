export interface HexPoint {
  x: number;
  y: number;
}

export interface HexCoordinate {
  q: number;
  r: number;
}

/**
 * Calcule les six sommets d'un hexagone ayant une pointe en haut.
 */
export function getHexCorners(
  centerX: number,
  centerY: number,
  size: number,
): HexPoint[] {
  const corners: HexPoint[] = [];

  for (let index = 0; index < 6; index += 1) {
    const angleDegrees = -90 + index * 60;
    const angleRadians = PhaserMath.degreesToRadians(angleDegrees);

    corners.push({
      x: centerX + size * Math.cos(angleRadians),
      y: centerY + size * Math.sin(angleRadians),
    });
  }

  return corners;
}

const PhaserMath = {
  degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  },
};

export function axialToPixel(
  coordinate: HexCoordinate,
  size: number,
): HexPoint {
  return {
    x: size * Math.sqrt(3) * (coordinate.q + coordinate.r / 2),
    y: size * 1.5 * coordinate.r,
  };
}

export function getHexDistance(
  first: HexCoordinate,
  second: HexCoordinate,
): number {
  const deltaQ = first.q - second.q;
  const deltaR = first.r - second.r;
  const deltaS = deltaQ + deltaR;

  return (Math.abs(deltaQ) + Math.abs(deltaR) + Math.abs(deltaS)) / 2;
}

export function getItemsInHexRadius<T extends HexCoordinate>(
  items: readonly T[],
  center: HexCoordinate,
  radius: number,
): T[] {
  return items.filter((item) => getHexDistance(center, item) <= radius);
}

export function getHexCoordinatesInRadius(radius: number): HexCoordinate[] {
  const coordinates: HexCoordinate[] = [];

  for (let q = -radius; q <= radius; q += 1) {
    const minimumR = Math.max(-radius, -q - radius);
    const maximumR = Math.min(radius, -q + radius);

    for (let r = minimumR; r <= maximumR; r += 1) {
      coordinates.push({
        q: q === 0 ? 0 : q,
        r: r === 0 ? 0 : r,
      });
    }
  }

  return coordinates;
}
