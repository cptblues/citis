export interface CameraPoint {
  x: number;
  y: number;
}

export interface CameraRectangle extends CameraPoint {
  width: number;
  height: number;
}

export function calculateFitZoom(
  viewport: CameraRectangle,
  contentBounds: CameraRectangle,
): number {
  if (
    viewport.width <= 0 ||
    viewport.height <= 0 ||
    contentBounds.width <= 0 ||
    contentBounds.height <= 0
  ) {
    return 1;
  }

  return Math.min(
    viewport.width / contentBounds.width,
    viewport.height / contentBounds.height,
  );
}

export function centerMapPointInViewport(
  mapPoint: CameraPoint,
  scale: number,
  viewport: CameraRectangle,
): CameraPoint {
  return {
    x: viewport.x + viewport.width / 2 - mapPoint.x * scale,
    y: viewport.y + viewport.height / 2 - mapPoint.y * scale,
  };
}

export function zoomMapPositionAroundPoint(
  position: CameraPoint,
  previousScale: number,
  nextScale: number,
  anchor: CameraPoint,
): CameraPoint {
  if (previousScale <= 0) {
    return position;
  }

  const localAnchorX = (anchor.x - position.x) / previousScale;
  const localAnchorY = (anchor.y - position.y) / previousScale;

  return {
    x: anchor.x - localAnchorX * nextScale,
    y: anchor.y - localAnchorY * nextScale,
  };
}

export function clampMapPosition(
  position: CameraPoint,
  scale: number,
  viewport: CameraRectangle,
  contentBounds: CameraRectangle,
): CameraPoint {
  const scaledWidth = contentBounds.width * scale;
  const scaledHeight = contentBounds.height * scale;
  const viewportRight = viewport.x + viewport.width;
  const viewportBottom = viewport.y + viewport.height;
  const contentRight = contentBounds.x + contentBounds.width;
  const contentBottom = contentBounds.y + contentBounds.height;

  let x = position.x;
  let y = position.y;

  if (scaledWidth <= viewport.width) {
    x =
      viewport.x +
      viewport.width / 2 -
      (contentBounds.x + contentBounds.width / 2) * scale;
  } else {
    const minimumX = viewportRight - contentRight * scale;
    const maximumX = viewport.x - contentBounds.x * scale;
    x = clamp(x, minimumX, maximumX);
  }

  if (scaledHeight <= viewport.height) {
    y =
      viewport.y +
      viewport.height / 2 -
      (contentBounds.y + contentBounds.height / 2) * scale;
  } else {
    const minimumY = viewportBottom - contentBottom * scale;
    const maximumY = viewport.y - contentBounds.y * scale;
    y = clamp(y, minimumY, maximumY);
  }

  return { x, y };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
