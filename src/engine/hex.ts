export interface HexPoint {
  x: number;
  y: number;
}

export interface HexCoordinate {
  q: number;
  r: number;
}

export const HEX_SIDES = [0, 1, 2, 3, 4, 5] as const;

export type HexSide = (typeof HEX_SIDES)[number];

export type HexRotation = HexSide;

const HEX_NEIGHBOR_OFFSETS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
] as const satisfies readonly HexCoordinate[];

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
  /**
   * Convertit un angle en radians sans dépendre de Phaser dans le moteur pur.
   */
  degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  },
};

/**
 * Convertit une coordonnée axiale en position pixel pour une grille pointy-top.
 */
export function axialToPixel(
  coordinate: HexCoordinate,
  size: number,
): HexPoint {
  return {
    x: size * Math.sqrt(3) * (coordinate.q + coordinate.r / 2),
    y: size * 1.5 * coordinate.r,
  };
}

/**
 * Mesure la distance hexagonale minimale entre deux coordonnées axiales.
 */
export function getHexDistance(
  first: HexCoordinate,
  second: HexCoordinate,
): number {
  const deltaQ = first.q - second.q;
  const deltaR = first.r - second.r;
  const deltaS = deltaQ + deltaR;

  return (Math.abs(deltaQ) + Math.abs(deltaR) + Math.abs(deltaS)) / 2;
}

/**
 * Filtre des éléments porteurs de coordonnées dans un rayon hexagonal donné.
 */
export function getItemsInHexRadius<T extends HexCoordinate>(
  items: readonly T[],
  center: HexCoordinate,
  radius: number,
): T[] {
  return items.filter((item) => getHexDistance(center, item) <= radius);
}

/**
 * Génère toutes les coordonnées axiales comprises dans un disque hexagonal.
 */
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

export function getHexNeighbor(
  coordinate: HexCoordinate,
  side: HexSide,
): HexCoordinate {
  const offset = HEX_NEIGHBOR_OFFSETS[side];

  return {
    q: coordinate.q + offset.q,
    r: coordinate.r + offset.r,
  };
}

export function getHexSideBetween(
  origin: HexCoordinate,
  neighbor: HexCoordinate,
): HexSide | null {
  for (const side of HEX_SIDES) {
    const coordinate = getHexNeighbor(origin, side);

    if (coordinate.q === neighbor.q && coordinate.r === neighbor.r) {
      return side;
    }
  }

  return null;
}

export function getOppositeHexSide(side: HexSide): HexSide {
  return ((side + 3) % 6) as HexSide;
}

export function rotateHexSide(side: HexSide, rotation: HexRotation): HexSide {
  return ((side + rotation) % 6) as HexSide;
}

export function getNextHexRotation(rotation: HexRotation): HexRotation {
  return ((rotation + 1) % 6) as HexRotation;
}
