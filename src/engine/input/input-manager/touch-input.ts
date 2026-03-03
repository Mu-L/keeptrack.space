import { Camera } from '@app/engine/camera/camera';
import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { SelectSatManager } from '@app/plugins/select-sat-manager/select-sat-manager';
import { MouseInput } from './mouse-input';

export interface TapTouchEvent {
  x: number;
  y: number;
}

export interface PanTouchEvent {
  x: number;
  y: number;
}

export interface PinchTouchEvent {
  /**
   * The distance between the two fingers
   */
  pinchDistance: number;
}

interface CachedTouch {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
}

export class TouchInput {
  mouse: MouseInput;
  canvasDOM: HTMLCanvasElement;
  lastEvent: TouchEvent | TapTouchEvent | PanTouchEvent | PinchTouchEvent;
  /**
   * Is a pinch gesture currently happening
   */
  isPinching = false;
  /**
   * The distance between the two fingers at the start of the pinch
   */
  startPinchDistance = 0;
  touchSat: number;
  mouseSat: number;
  touchStartTime: number;
  deltaPinchDistance: number;
  /**
   * The maximum distance in pixels that a pinch can be
   */
  maxPinchSize = Math.hypot(window.innerWidth, window.innerHeight);
  dragHasMoved: boolean;
  isPanning: boolean;
  touchX: number;
  touchY: number;
  touchStartX: number;
  touchStartY: number;
  /**
   * The distance in pixels that a tap must move to be considered a pan
   */
  tapMovementThreshold: number = 15;
  /**
   * The time in ms that a tap must be held for to be considered a press
   */
  pressMinTime = 150;

  private touchMoveRafId_ = -1;
  private cachedTouches_: CachedTouch[] = [];

  init(canvasDOM: HTMLCanvasElement) {
    this.canvasDOM = canvasDOM;

    if (settingsManager.isMobileModeEnabled) {
      // Prevent browser gesture interpretation (scroll, bounce, back-swipe)
      canvasDOM.style.touchAction = 'none';

      canvasDOM.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.canvasTouchStart(e);
      }, { passive: false });

      canvasDOM.addEventListener('touchend', (e) => {
        this.canvasTouchEnd(e, ServiceLocator.getMainCamera());
      }, { passive: false });

      canvasDOM.addEventListener('touchmove', (e) => {
        e.preventDefault();
        this.canvasTouchMove(e);
      }, { passive: false });

      // Recalculate max pinch size on orientation change or resize
      window.addEventListener('resize', () => {
        this.maxPinchSize = Math.hypot(window.innerWidth, window.innerHeight);
      });
    }
  }

  public canvasTouchEnd(evt: TouchEvent, mainCameraInstance: Camera) {
    const touchTime = Date.now() - this.touchStartTime;

    if (!this.isPanning && !this.isPinching) {
      if (touchTime > this.pressMinTime) {
        this.press(evt);
      } else {
        this.tap({
          x: this.touchStartX,
          y: this.touchStartY,
        });
      }
    }

    // Transition from 2 fingers to 1: stop rotation to prevent jerk
    if (evt.touches?.length === 1) {
      this.isPinching = false;
      this.isPanning = false;
      mainCameraInstance.state.isDragging = false;
      mainCameraInstance.state.camPitchSpeed = 0;
      mainCameraInstance.state.camYawSpeed = 0;

      // Record remaining finger position so a new single-finger drag
      // can start cleanly from the next touchmove threshold check
      const remaining = evt.touches[0];

      this.touchStartX = remaining.clientX;
      this.touchStartY = remaining.clientY;
    }

    // Reset if last finger — do NOT zero mouseX/mouseY so momentum uses last known position
    if (evt.touches?.length === 0) {
      this.isPinching = false;
      this.isPanning = false;
      this.dragHasMoved = false;
      mainCameraInstance.state.isDragging = false;
    }
  }

  public canvasTouchMove(evt: TouchEvent): void {
    // Can't move if there is no touch
    if (!evt.touches || evt.touches.length < 1) {
      return;
    }

    // Cache touch data synchronously (browser may recycle TouchEvent after handler returns)
    this.touchX = evt.touches[0].clientX;
    this.touchY = evt.touches[0].clientY;
    this.cachedTouches_ = Array.from(evt.touches).map((t) => ({
      clientX: t.clientX,
      clientY: t.clientY,
      pageX: t.pageX,
      pageY: t.pageY,
    }));

    // Throttle processing to once per animation frame (matches mouse-input pattern)
    if (this.touchMoveRafId_ === -1) {
      this.touchMoveRafId_ = requestAnimationFrame(() => {
        this.processTouchMove_();
        this.touchMoveRafId_ = -1;
      });
    }
  }

  private processTouchMove_(): void {
    const touches = this.cachedTouches_;

    if (this.isPinching && touches.length >= 2) {
      // Pinch zoom only — no rotation during pinch to prevent jerk on finger release
      const dist = Math.hypot(
        touches[0].pageX - touches[1].pageX,
        touches[0].pageY - touches[1].pageY,
      );

      if (!isNaN(dist) && dist > this.tapMovementThreshold) {
        this.pinchMove({ pinchDistance: dist });
      }
    } else if (!this.isPinching) {
      // Single-finger pan
      if (
        Math.abs(this.touchStartX - this.touchX) > this.tapMovementThreshold ||
        Math.abs(this.touchStartY - this.touchY) > this.tapMovementThreshold
      ) {
        this.isPanning = true;
        this.pan({ x: this.touchX, y: this.touchY });
      }
    }
  }

  public canvasTouchStart(evt: TouchEvent): void {
    this.touchStartTime = Date.now();

    if (evt.touches.length > 1) {
      this.isPinching = true;
      this.isPanning = false;
      this.pinchStart({
        pinchDistance: Math.hypot(evt.touches[0].pageX - evt.touches[1].pageX, evt.touches[0].pageY - evt.touches[1].pageY),
      });

      // Stop rotation drag — pinch is zoom-only
      const cam = ServiceLocator.getMainCamera();

      cam.state.isDragging = false;
      cam.state.camPitchSpeed = 0;
      cam.state.camYawSpeed = 0;
    } else {
      this.touchStart({
        x: evt.touches[0].clientX,
        y: evt.touches[0].clientY,
      });
    }
  }

  /**
   * Start of a single finger touch event
   */
  touchStart(evt: TapTouchEvent | PanTouchEvent) {
    this.lastEvent = evt;

    this.touchStartX = evt.x;
    this.touchStartY = evt.y;
    ServiceLocator.getMainCamera().state.mouseX = evt.x;
    ServiceLocator.getMainCamera().state.mouseY = evt.y;

    // If you hit the canvas hide any popups
    ServiceLocator.getInputManager().hidePopUps();

    EventBus.getInstance().emit(EventBusEvent.touchStart, evt);
  }

  tap(evt: TapTouchEvent) {
    this.lastEvent = evt;

    // Stop auto movement
    ServiceLocator.getMainCamera().state.isAutoPitchYawToTarget = false;
    ServiceLocator.getMainCamera().autoRotate(false);

    // Try to select satellite
    const satId = ServiceLocator.getInputManager().getSatIdFromCoord(evt.x, evt.y);

    PluginRegistry.getPlugin(SelectSatManager)?.selectSat(satId);
  }

  pan(evt: PanTouchEvent) {
    this.lastEvent = evt;

    const mainCameraInstance = ServiceLocator.getMainCamera();

    mainCameraInstance.state.mouseX = evt.x;
    mainCameraInstance.state.mouseY = evt.y;
    mainCameraInstance.state.camAngleSnappedOnSat = false;
  }

  swipe(evt: TouchEvent) {
    // TODO: Implement
    this.lastEvent = evt;
  }

  press(evt: TouchEvent) {
    this.lastEvent = evt;

    // Stop auto movement
    ServiceLocator.getMainCamera().state.isAutoPitchYawToTarget = false;
    ServiceLocator.getMainCamera().autoRotate(false);

    ServiceLocator.getInputManager().openRmbMenu();
  }

  pinchStart(evt: PinchTouchEvent) {
    this.startPinchDistance = evt.pinchDistance;
  }

  pinchMove(evt: PinchTouchEvent) {
    this.lastEvent = evt;

    const mainCameraInstance = ServiceLocator.getMainCamera();

    // Ratio-based zoom: spread fingers (ratio > 1) = zoom in, pinch (ratio < 1) = zoom out
    const pinchRatio = evt.pinchDistance / this.startPinchDistance;

    // Reset for next frame's incremental calculation (prevents quadratic accumulation)
    this.startPinchDistance = evt.pinchDistance;

    let zoomTarget = mainCameraInstance.state.zoomTarget;

    // Dampen ratio toward 1.0 to reduce pinch sensitivity (~50%)
    const dampenedRatio = 1 + (pinchRatio - 1) * 0.5;

    // Divide by ratio for logarithmic feel proportional to current zoom level
    zoomTarget /= dampenedRatio;
    zoomTarget = Math.min(Math.max(zoomTarget, 0.0001), 1);
    mainCameraInstance.state.isZoomIn = pinchRatio > 1;
    mainCameraInstance.state.zoomTarget = zoomTarget;
  }

  rotate(evt: TouchEvent) {
    // TODO: Implement
    this.lastEvent = evt;
  }
}
