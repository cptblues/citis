import Phaser from "phaser";
import {
  calculateFitZoom,
  centerMapPointInViewport,
  clampMapPosition,
  zoomMapPositionAroundPoint,
} from "./territoryMapCameraMath";

export const TERRITORY_MAP_CONTAINER_NAME = "territory-map-container";

const INITIAL_ZOOM_MULTIPLIER = 1.18;
const INITIAL_ZOOM_LIMIT = 1.22;
const BUTTON_ZOOM_FACTOR = 1.16;
const MAXIMUM_ZOOM = 2.25;
const DRAG_THRESHOLD = 8;
const WHEEL_ZOOM_SENSITIVITY = 0.00135;
const MAXIMUM_WHEEL_DELTA = 160;
const ZOOM_EPSILON = 0.0005;

interface TerritoryMapCameraControllerOptions {
  scene: Phaser.Scene;
  mapContainer: Phaser.GameObjects.Container;
  viewport: Phaser.Geom.Rectangle;
  contentBounds: Phaser.Geom.Rectangle;
  focusPoint: Phaser.Math.Vector2;
  canPanWithPrimaryPointer: () => boolean;
  onCellClick: (cellId: string) => void;
  onViewInteraction: () => void;
}

interface PointerInteraction {
  pointerId: number;
  pressedCellId: string | null;
  allowClick: boolean;
  allowPan: boolean;
  explicitPan: boolean;
  startX: number;
  startY: number;
  containerStartX: number;
  containerStartY: number;
  movedBeyondThreshold: boolean;
  dragging: boolean;
}

interface BeginInteractionOptions {
  cellId: string | null;
  allowClick: boolean;
  allowPan: boolean;
  explicitPan: boolean;
}

/**
 * Contrôle le zoom et le déplacement du conteneur de carte.
 *
 * À la souris, le clic gauche reste réservé au placement lorsqu'une action est
 * sélectionnée. La carte se déplace avec le clic droit, le clic molette ou
 * Espace + clic gauche. Sans action sélectionnée, un glisser gauche reste
 * possible. Au tactile, un appui bref clique et un glisser déplace la carte.
 */
export class TerritoryMapCameraController {
  private readonly scene: Phaser.Scene;
  private readonly mapContainer: Phaser.GameObjects.Container;
  private readonly viewport: Phaser.Geom.Rectangle;
  private readonly contentBounds: Phaser.Geom.Rectangle;
  private readonly initialFocusPoint: Phaser.Math.Vector2;
  private readonly canPanWithPrimaryPointer: () => boolean;
  private readonly onCellClick: (cellId: string) => void;
  private readonly onViewInteraction: () => void;
  private readonly spaceKey: Phaser.Input.Keyboard.Key | null;

  private interaction: PointerInteraction | null = null;
  private minimumZoom = 1;
  private maximumZoom = MAXIMUM_ZOOM;
  private fitViewActive = false;
  private destroyed = false;

  public constructor(options: TerritoryMapCameraControllerOptions) {
    this.scene = options.scene;
    this.mapContainer = options.mapContainer;
    this.viewport = Phaser.Geom.Rectangle.Clone(options.viewport);
    this.contentBounds = Phaser.Geom.Rectangle.Clone(options.contentBounds);
    this.initialFocusPoint = options.focusPoint.clone();
    this.canPanWithPrimaryPointer = options.canPanWithPrimaryPointer;
    this.onCellClick = options.onCellClick;
    this.onViewInteraction = options.onViewInteraction;
    this.spaceKey =
      this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) ??
      null;

    this.recalculateZoomLimits();
    this.bindInputEvents();
    this.resetView();
  }

  public isDragging(): boolean {
    return this.interaction?.dragging === true;
  }

  public zoomIn(): void {
    this.zoomAroundViewportCenter(BUTTON_ZOOM_FACTOR);
  }

  public zoomOut(): void {
    this.zoomAroundViewportCenter(1 / BUTTON_ZOOM_FACTOR);
  }

  /** Affiche le territoire entier avec sa marge de sécurité. */
  public fitView(): void {
    if (this.destroyed) {
      return;
    }

    this.onViewInteraction();
    this.clearPointerInteraction();
    this.fitViewActive = true;
    this.applyFitView();
  }

  public registerCellPointerDown(
    pointer: Phaser.Input.Pointer,
    cellId: string,
  ): void {
    if (!this.isPointerInsideViewport(pointer)) {
      return;
    }

    const explicitPan = this.isExplicitPanGesture(pointer);

    if (explicitPan) {
      this.beginOrMergeInteraction(pointer, {
        cellId: null,
        allowClick: false,
        allowPan: true,
        explicitPan: true,
      });
      return;
    }

    const allowPrimaryPan = pointer.wasTouch || this.canPanWithPrimaryPointer();

    this.beginOrMergeInteraction(pointer, {
      cellId,
      allowClick: true,
      allowPan: allowPrimaryPan,
      explicitPan: false,
    });
  }

  public updateViewport(viewport: Phaser.Geom.Rectangle): void {
    const currentScale = Math.max(this.mapContainer.scaleX, ZOOM_EPSILON);
    const currentViewportCenter = new Phaser.Math.Vector2(
      this.viewport.centerX,
      this.viewport.centerY,
    );
    const mapPointAtViewportCenter = new Phaser.Math.Vector2(
      (currentViewportCenter.x - this.mapContainer.x) / currentScale,
      (currentViewportCenter.y - this.mapContainer.y) / currentScale,
    );

    this.viewport.setTo(
      viewport.x,
      viewport.y,
      viewport.width,
      viewport.height,
    );
    this.recalculateZoomLimits();

    if (this.fitViewActive) {
      this.applyFitView();
      this.refreshCursor();
      return;
    }

    const nextScale = Phaser.Math.Clamp(
      currentScale,
      this.minimumZoom,
      this.maximumZoom,
    );
    const nextPosition = centerMapPointInViewport(
      mapPointAtViewportCenter,
      nextScale,
      this.viewport,
    );

    this.mapContainer.setScale(nextScale);
    this.mapContainer.setPosition(nextPosition.x, nextPosition.y);
    this.clampCurrentPosition();
    this.refreshCursor();
  }

  public refreshCursor(): void {
    if (this.destroyed) {
      return;
    }

    if (this.interaction?.dragging === true) {
      this.scene.input.setDefaultCursor("grabbing");
      return;
    }

    if (this.spaceKey?.isDown === true || this.canPanWithPrimaryPointer()) {
      this.scene.input.setDefaultCursor("grab");
      return;
    }

    this.scene.input.setDefaultCursor("default");
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.scene.input.off("pointerdown", this.handleScenePointerDown);
    this.scene.input.off("pointermove", this.handlePointerMove);
    this.scene.input.off("pointerup", this.handlePointerUp);
    this.scene.input.off("pointerupoutside", this.handlePointerUp);
    this.scene.input.off("wheel", this.handleWheel);
    this.spaceKey?.off("down", this.handleSpaceKeyChanged);
    this.spaceKey?.off("up", this.handleSpaceKeyChanged);
    this.scene.input.setDefaultCursor("default");
  }

  private readonly handleScenePointerDown = (
    pointer: Phaser.Input.Pointer,
  ): void => {
    if (!this.isPointerInsideViewport(pointer)) {
      return;
    }

    const explicitPan = this.isExplicitPanGesture(pointer);

    if (explicitPan) {
      this.beginOrMergeInteraction(pointer, {
        cellId: null,
        allowClick: false,
        allowPan: true,
        explicitPan: true,
      });
      return;
    }

    if (pointer.wasTouch || this.canPanWithPrimaryPointer()) {
      this.beginOrMergeInteraction(pointer, {
        cellId: null,
        allowClick: false,
        allowPan: true,
        explicitPan: false,
      });
    }
  };

  private readonly handlePointerMove = (
    pointer: Phaser.Input.Pointer,
  ): void => {
    const interaction = this.interaction;

    if (
      interaction === null ||
      pointer.id !== interaction.pointerId ||
      !pointer.isDown
    ) {
      return;
    }

    const deltaX = pointer.x - interaction.startX;
    const deltaY = pointer.y - interaction.startY;
    const movedBeyondThreshold = Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD;

    if (movedBeyondThreshold && !interaction.movedBeyondThreshold) {
      interaction.movedBeyondThreshold = true;
      interaction.pressedCellId = null;

      if (interaction.allowPan) {
        interaction.dragging = true;
        this.fitViewActive = false;
        this.onViewInteraction();
        this.scene.input.setDefaultCursor("grabbing");
      }
    }

    if (!interaction.dragging) {
      return;
    }

    this.mapContainer.setPosition(
      interaction.containerStartX + deltaX,
      interaction.containerStartY + deltaY,
    );
    this.clampCurrentPosition();
  };

  private readonly handlePointerUp = (pointer: Phaser.Input.Pointer): void => {
    const interaction = this.interaction;

    if (interaction === null || pointer.id !== interaction.pointerId) {
      return;
    }

    const clickedCellId =
      interaction.allowClick && !interaction.movedBeyondThreshold
        ? interaction.pressedCellId
        : null;

    this.clearPointerInteraction();

    if (clickedCellId !== null) {
      this.onCellClick(clickedCellId);
    }
  };

  private readonly handleWheel = (
    pointer: Phaser.Input.Pointer,
    _gameObjects: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number,
  ): void => {
    if (!this.isPointerInsideViewport(pointer)) {
      return;
    }

    const previousScale = this.mapContainer.scaleX;
    const boundedDeltaY = Phaser.Math.Clamp(
      deltaY,
      -MAXIMUM_WHEEL_DELTA,
      MAXIMUM_WHEEL_DELTA,
    );
    const zoomFactor = Math.exp(-boundedDeltaY * WHEEL_ZOOM_SENSITIVITY);
    const nextScale = Phaser.Math.Clamp(
      previousScale * zoomFactor,
      this.minimumZoom,
      this.maximumZoom,
    );

    this.applyZoomAroundPoint(pointer, previousScale, nextScale);
  };

  private readonly handleSpaceKeyChanged = (): void => {
    this.refreshCursor();
  };

  private bindInputEvents(): void {
    this.scene.input.on("pointerdown", this.handleScenePointerDown);
    this.scene.input.on("pointermove", this.handlePointerMove);
    this.scene.input.on("pointerup", this.handlePointerUp);
    this.scene.input.on("pointerupoutside", this.handlePointerUp);
    this.scene.input.on("wheel", this.handleWheel);
    this.spaceKey?.on("down", this.handleSpaceKeyChanged);
    this.spaceKey?.on("up", this.handleSpaceKeyChanged);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.refreshCursor();
  }

  private beginOrMergeInteraction(
    pointer: Phaser.Input.Pointer,
    options: BeginInteractionOptions,
  ): void {
    if (!pointer.isDown || !this.isPointerInsideViewport(pointer)) {
      return;
    }

    if (this.interaction?.pointerId === pointer.id) {
      if (options.explicitPan) {
        this.interaction.explicitPan = true;
        this.interaction.allowClick = false;
        this.interaction.allowPan = true;
        this.interaction.pressedCellId = null;
        return;
      }

      if (!this.interaction.explicitPan) {
        this.interaction.allowPan ||= options.allowPan;
        this.interaction.allowClick ||= options.allowClick;

        if (options.allowClick && options.cellId !== null) {
          this.interaction.pressedCellId = options.cellId;
        }
      }

      return;
    }

    if (this.interaction !== null) {
      return;
    }

    this.interaction = {
      pointerId: pointer.id,
      pressedCellId: options.allowClick ? options.cellId : null,
      allowClick: options.allowClick,
      allowPan: options.allowPan,
      explicitPan: options.explicitPan,
      startX: pointer.x,
      startY: pointer.y,
      containerStartX: this.mapContainer.x,
      containerStartY: this.mapContainer.y,
      movedBeyondThreshold: false,
      dragging: false,
    };

    this.refreshCursor();
  }

  private clearPointerInteraction(): void {
    this.interaction = null;
    this.refreshCursor();
  }

  private resetView(): void {
    const requestedZoom = Math.min(
      INITIAL_ZOOM_LIMIT,
      this.minimumZoom * INITIAL_ZOOM_MULTIPLIER,
    );
    const scale = Phaser.Math.Clamp(
      requestedZoom,
      this.minimumZoom,
      this.maximumZoom,
    );
    const position = centerMapPointInViewport(
      this.initialFocusPoint,
      scale,
      this.viewport,
    );

    this.fitViewActive = false;
    this.mapContainer.setScale(scale);
    this.mapContainer.setPosition(position.x, position.y);
    this.clampCurrentPosition();
  }

  private zoomAroundViewportCenter(factor: number): void {
    if (this.destroyed) {
      return;
    }

    const previousScale = this.mapContainer.scaleX;
    const nextScale = Phaser.Math.Clamp(
      previousScale * factor,
      this.minimumZoom,
      this.maximumZoom,
    );
    const anchor = new Phaser.Math.Vector2(
      this.viewport.centerX,
      this.viewport.centerY,
    );

    this.applyZoomAroundPoint(anchor, previousScale, nextScale);
  }

  private applyZoomAroundPoint(
    anchor: Phaser.Types.Math.Vector2Like,
    previousScale: number,
    nextScale: number,
  ): void {
    if (Math.abs(nextScale - previousScale) < ZOOM_EPSILON) {
      return;
    }

    if (nextScale <= this.minimumZoom + ZOOM_EPSILON) {
      this.fitView();
      return;
    }

    this.fitViewActive = false;
    this.onViewInteraction();

    const nextPosition = zoomMapPositionAroundPoint(
      this.mapContainer,
      previousScale,
      nextScale,
      anchor,
    );

    this.mapContainer.setScale(nextScale);
    this.mapContainer.setPosition(nextPosition.x, nextPosition.y);
    this.clampCurrentPosition();
    this.refreshCursor();
  }

  private applyFitView(): void {
    const center = new Phaser.Math.Vector2(
      this.contentBounds.centerX,
      this.contentBounds.centerY,
    );
    const position = centerMapPointInViewport(
      center,
      this.minimumZoom,
      this.viewport,
    );

    this.mapContainer.setScale(this.minimumZoom);
    this.mapContainer.setPosition(position.x, position.y);
    this.clampCurrentPosition();
  }

  private recalculateZoomLimits(): void {
    const fitZoom = calculateFitZoom(this.viewport, this.contentBounds);
    this.minimumZoom = Math.min(1, fitZoom);
    this.maximumZoom = Math.max(MAXIMUM_ZOOM, this.minimumZoom);
  }

  private clampCurrentPosition(): void {
    const nextPosition = clampMapPosition(
      this.mapContainer,
      this.mapContainer.scaleX,
      this.viewport,
      this.contentBounds,
    );

    this.mapContainer.setPosition(nextPosition.x, nextPosition.y);
  }

  private isExplicitPanGesture(pointer: Phaser.Input.Pointer): boolean {
    return (
      pointer.rightButtonDown() ||
      pointer.middleButtonDown() ||
      (pointer.leftButtonDown() && this.spaceKey?.isDown === true)
    );
  }

  private isPointerInsideViewport(pointer: Phaser.Input.Pointer): boolean {
    return this.viewport.contains(pointer.x, pointer.y);
  }
}
