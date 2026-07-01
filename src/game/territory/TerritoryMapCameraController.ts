import Phaser from "phaser";

export const TERRITORY_MAP_CONTAINER_NAME = "territory-map-container";

const INITIAL_ZOOM = 1.42;
const MINIMUM_ZOOM = 1;
const MAXIMUM_ZOOM = 2.25;
const DRAG_THRESHOLD = 7;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;

interface TerritoryMapCameraControllerOptions {
  scene: Phaser.Scene;
  mapContainer: Phaser.GameObjects.Container;
  viewport: Phaser.Geom.Rectangle;
  contentBounds: Phaser.Geom.Rectangle;
  focusPoint: Phaser.Math.Vector2;
  onCellClick: (cellId: string) => void;
  onDragStart: () => void;
}

/**
 * Contrôle la vue de la carte sans déplacer les éléments d'interface Phaser.
 *
 * La carte est contenue dans un Container dédié : le glisser-déposer et le
 * zoom modifient uniquement ce container. Un clic n'est transmis à une case
 * que si le pointeur n'a pas dépassé le seuil de déplacement.
 */
export class TerritoryMapCameraController {
  private readonly scene: Phaser.Scene;
  private readonly mapContainer: Phaser.GameObjects.Container;
  private readonly viewport: Phaser.Geom.Rectangle;
  private readonly contentBounds: Phaser.Geom.Rectangle;
  private readonly onCellClick: (cellId: string) => void;
  private readonly onDragStart: () => void;

  private activePointerId: number | null = null;
  private pressedCellId: string | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private containerStartX = 0;
  private containerStartY = 0;
  private dragging = false;
  private destroyed = false;

  public constructor(options: TerritoryMapCameraControllerOptions) {
    this.scene = options.scene;
    this.mapContainer = options.mapContainer;
    this.viewport = options.viewport;
    this.contentBounds = options.contentBounds;
    this.onCellClick = options.onCellClick;
    this.onDragStart = options.onDragStart;

    this.bindInputEvents();
    this.resetView(options.focusPoint);
  }

  public isDragging(): boolean {
    return this.dragging;
  }

  public registerCellPointerDown(
    pointer: Phaser.Input.Pointer,
    cellId: string,
  ): void {
    this.beginPointerInteraction(pointer, cellId);
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.scene.input.off("pointerdown", this.handleScenePointerDown);
    this.scene.input.off("pointermove", this.handlePointerMove);
    this.scene.input.off("pointerup", this.handlePointerUp);
    this.scene.input.off("gameout", this.handleGameOut);
    this.scene.input.off("wheel", this.handleWheel);
    this.scene.input.setDefaultCursor("default");
  }

  private readonly handleScenePointerDown = (
    pointer: Phaser.Input.Pointer,
  ): void => {
    this.beginPointerInteraction(pointer, null);
  };

  private readonly handlePointerMove = (
    pointer: Phaser.Input.Pointer,
  ): void => {
    if (
      this.activePointerId === null ||
      pointer.id !== this.activePointerId ||
      !pointer.isDown
    ) {
      return;
    }

    const deltaX = pointer.x - this.dragStartX;
    const deltaY = pointer.y - this.dragStartY;

    if (!this.dragging && Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD) {
      this.dragging = true;
      this.pressedCellId = null;
      this.onDragStart();
      this.scene.input.setDefaultCursor("grabbing");
    }

    if (!this.dragging) {
      return;
    }

    this.mapContainer.setPosition(
      this.containerStartX + deltaX,
      this.containerStartY + deltaY,
    );
    this.clampMapPosition();
  };

  private readonly handlePointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (this.activePointerId === null || pointer.id !== this.activePointerId) {
      return;
    }

    const clickedCellId = this.dragging ? null : this.pressedCellId;
    this.clearPointerInteraction();

    if (clickedCellId !== null) {
      this.onCellClick(clickedCellId);
    }
  };

  private readonly handleGameOut = (): void => {
    this.clearPointerInteraction();
  };

  private readonly handleWheel = (
    pointer: Phaser.Input.Pointer,
    _gameObjects: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number,
  ): void => {
    if (!this.viewport.contains(pointer.x, pointer.y)) {
      return;
    }

    const previousScale = this.mapContainer.scaleX;
    const zoomFactor = Math.exp(-deltaY * WHEEL_ZOOM_SENSITIVITY);
    const nextScale = Phaser.Math.Clamp(
      previousScale * zoomFactor,
      MINIMUM_ZOOM,
      MAXIMUM_ZOOM,
    );

    if (Math.abs(nextScale - previousScale) < 0.001) {
      return;
    }

    const localPointerX = (pointer.x - this.mapContainer.x) / previousScale;
    const localPointerY = (pointer.y - this.mapContainer.y) / previousScale;

    this.mapContainer.setScale(nextScale);
    this.mapContainer.setPosition(
      pointer.x - localPointerX * nextScale,
      pointer.y - localPointerY * nextScale,
    );
    this.clampMapPosition();
  };

  private bindInputEvents(): void {
    this.scene.input.on("pointerdown", this.handleScenePointerDown);
    this.scene.input.on("pointermove", this.handlePointerMove);
    this.scene.input.on("pointerup", this.handlePointerUp);
    this.scene.input.on("gameout", this.handleGameOut);
    this.scene.input.on("wheel", this.handleWheel);
    this.scene.input.setDefaultCursor("grab");

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private beginPointerInteraction(
    pointer: Phaser.Input.Pointer,
    cellId: string | null,
  ): void {
    if (
      !pointer.isDown ||
      pointer.button === 2 ||
      !this.viewport.contains(pointer.x, pointer.y)
    ) {
      return;
    }

    if (this.activePointerId === pointer.id) {
      if (!this.dragging && cellId !== null) {
        this.pressedCellId = cellId;
      }

      return;
    }

    if (this.activePointerId !== null) {
      return;
    }

    this.activePointerId = pointer.id;
    this.pressedCellId = cellId;
    this.dragStartX = pointer.x;
    this.dragStartY = pointer.y;
    this.containerStartX = this.mapContainer.x;
    this.containerStartY = this.mapContainer.y;
    this.dragging = false;
  }

  private clearPointerInteraction(): void {
    this.activePointerId = null;
    this.pressedCellId = null;
    this.dragging = false;
    this.scene.input.setDefaultCursor("grab");
  }

  private resetView(focusPoint: Phaser.Math.Vector2): void {
    const scale = Phaser.Math.Clamp(INITIAL_ZOOM, MINIMUM_ZOOM, MAXIMUM_ZOOM);

    this.mapContainer.setScale(scale);
    this.mapContainer.setPosition(
      this.viewport.centerX - focusPoint.x * scale,
      this.viewport.centerY - focusPoint.y * scale,
    );
    this.clampMapPosition();
  }

  private clampMapPosition(): void {
    const scale = this.mapContainer.scaleX;
    const scaledWidth = this.contentBounds.width * scale;
    const scaledHeight = this.contentBounds.height * scale;

    let nextX = this.mapContainer.x;
    let nextY = this.mapContainer.y;

    if (scaledWidth <= this.viewport.width) {
      nextX = this.viewport.centerX - this.contentBounds.centerX * scale;
    } else {
      const minimumX = this.viewport.right - this.contentBounds.right * scale;
      const maximumX = this.viewport.left - this.contentBounds.left * scale;
      nextX = Phaser.Math.Clamp(nextX, minimumX, maximumX);
    }

    if (scaledHeight <= this.viewport.height) {
      nextY = this.viewport.centerY - this.contentBounds.centerY * scale;
    } else {
      const minimumY = this.viewport.bottom - this.contentBounds.bottom * scale;
      const maximumY = this.viewport.top - this.contentBounds.top * scale;
      nextY = Phaser.Math.Clamp(nextY, minimumY, maximumY);
    }

    this.mapContainer.setPosition(nextX, nextY);
  }
}
