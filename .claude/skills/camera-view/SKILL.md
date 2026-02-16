---
name: camera-view
description: Reference guide and checklist for building, debugging, or modifying camera views (flat map, polar view, or new custom 2D/3D views) in KeepTrack. Use when creating a new camera view plugin, fixing rendering bugs in an existing view, or understanding the camera/projection pipeline.
---

# Camera View Development Guide

Use this skill when working on camera view plugins. `$ARGUMENTS` may be a file path, plugin name, or description of what to build/fix. If no argument is given, ask the user what view they want to work on.

## Architecture Overview

A custom camera view in KeepTrack consists of **four parts**:

1. **Camera delegate** — implements `ICameraModeDelegate` to control projection and interaction
2. **Background renderer** — draws 2D background (map, grid, etc.) via WebGL
3. **Dots-manager shader branch** — transforms satellite ECI positions to 2D screen positions
4. **Plugin wrapper** — registers everything and handles UI toggle

### Rendering Pipeline (execution order per frame)

```
engine.draw_()
  1. camera.draw(sensorPos)          → delegate sets projectionMatrix
  2. renderer.render(scene, camera)
     a. [if screenshot] resizeCanvas → updatePMatrix → OVERWRITES projection!
     b. [if screenshot] camera.draw(sensorPos) → re-invokes delegate to FIX projection
     c. projectionCameraMatrix = projectionMatrix × matrixWorldInverse
     d. scene.render()
        i.   renderBackground()  → EventBus.renderCustomBackground → plugin draws 2D bg
        ii.  renderOpaque()      → dots-manager shader transforms satellites to 2D
        iii. renderTransparent() → skipped for 2D views
  3. EventBus.endOfDraw             → screenshot capture happens here
```

---

## Part 1: Camera Delegate

**Interface**: `ICameraModeDelegate` in [camera.ts](src/engine/camera/camera.ts)

```typescript
export interface ICameraModeDelegate {
  draw(camera: Camera): void;           // Set projectionMatrix (called every frame)
  update(camera: Camera, dt: Milliseconds): void;  // Pan momentum, animation
  zoomWheel(camera: Camera, delta: number): boolean; // Zoom handling
  handleDrag(camera: Camera): boolean;  // Drag/pan handling
  onEnter(camera: Camera): void;        // Mode activation setup
  onExit(camera: Camera): void;         // Mode deactivation cleanup
}
```

### draw() — Projection Matrix

The delegate's `draw()` must set `camera.projectionMatrix` to an orthographic matrix. `matrixWorldInverse` is already reset to identity by `Camera.draw()` before the delegate runs.

**Standard orthographic setup pattern:**
```typescript
draw(camera: Camera): void {
  const renderer = ServiceLocator.getRenderer();
  camera.projectionMatrix = MyDelegate.calculateOrthoPMatrix_(
    renderer.gl, camera.myViewZoom, camera.myViewPanX, camera.myViewPanY,
  );
}

private static calculateOrthoPMatrix_(gl: WebGL2RenderingContext, zoom: number, panX: number, panY: number): mat4 {
  const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  // Calculate half-extents based on your view's coordinate system
  const halfW = VIEW_HALF_WIDTH / zoom;
  const halfH = halfW / aspect;
  const left = -halfW + panX;
  const right = halfW + panX;
  const bottom = -halfH + panY;
  const top = halfH + panY;

  const pMatrix = mat4.create();
  mat4.ortho(pMatrix, left, right, bottom, top, -100000, 100000);
  return pMatrix;
}
```

**Key rules:**
- Use `gl.drawingBufferWidth / gl.drawingBufferHeight` for aspect ratio (NOT `canvas.width`)
- Units should match your shader's coordinate system (km for flat map, Earth radii for polar)
- Do NOT apply the ECI-to-OpenGL transform — that's only for perspective 3D views
- The near/far planes should be wide enough to contain all satellite Z positions in your coordinate system

### onEnter() — Mode Activation

```typescript
onEnter(camera: Camera): void {
  // 1. Reset view state
  camera.myViewPanX = 0;
  camera.myViewPanY = 0;
  camera.myViewZoom = this.getDefaultZoom_();

  // 2. Disable Earth centering (REQUIRED for all 2D views)
  Scene.getInstance().worldShiftOverride = [0, 0, 0];

  // 3. Override selected satellite color for visibility on 2D background
  ColorSchemeManager.selectedColorOverride = [1.0, 0.0, 0.0, 1.0];
}
```

### onExit() — Mode Deactivation

```typescript
onExit(camera: Camera): void {
  // 1. Restore perspective projection
  const renderer = ServiceLocator.getRenderer();
  camera.projectionMatrix = Camera.calculatePMatrix(renderer.gl);

  // 2. Clear rendering overrides
  Scene.getInstance().worldShiftOverride = null;
  ColorSchemeManager.selectedColorOverride = null;
}
```

### update() — Momentum / Animation

Called every frame. Apply pan momentum decay:
```typescript
update(camera: Camera, _dt: Milliseconds): void {
  if (!settingsManager.isDragging) {
    camera.myViewPanX += this.panSpeedX_;
    camera.myViewPanY += this.panSpeedY_;
    this.panSpeedX_ *= 0.9;
    this.panSpeedY_ *= 0.9;
    // Clamp or wrap pan values
  }
}
```

### zoomWheel() — Cursor-Relative Zoom

For best UX, zoom toward the cursor position:
```typescript
zoomWheel(camera: Camera, delta: number): boolean {
  const renderer = ServiceLocator.getRenderer();
  const gl = renderer.gl;

  // 1. Get cursor NDC position
  const mouseX = settingsManager.lastMouseX ?? gl.drawingBufferWidth / 2;
  const mouseY = settingsManager.lastMouseY ?? gl.drawingBufferHeight / 2;
  const ndcX = (mouseX / gl.drawingBufferWidth) * 2 - 1;
  const ndcY = 1 - (mouseY / gl.drawingBufferHeight) * 2;

  // 2. World position under cursor BEFORE zoom
  const halfW = VIEW_HALF_WIDTH / camera.myViewZoom;
  const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  const halfH = halfW / aspect;
  const worldX = camera.myViewPanX + ndcX * halfW;
  const worldY = camera.myViewPanY + ndcY * halfH;

  // 3. Apply zoom
  const factor = delta > 0 ? 1.1 : 1 / 1.1;
  camera.myViewZoom = Math.max(minZoom, Math.min(maxZoom, camera.myViewZoom * factor));

  // 4. Adjust pan so world point stays under cursor
  const newHalfW = VIEW_HALF_WIDTH / camera.myViewZoom;
  const newHalfH = newHalfW / aspect;
  camera.myViewPanX = worldX - ndcX * newHalfW;
  camera.myViewPanY = worldY - ndcY * newHalfH;

  return true; // Handled
}
```

### handleDrag() — Pan

```typescript
handleDrag(camera: Camera): boolean {
  const renderer = ServiceLocator.getRenderer();
  const gl = renderer.gl;
  const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  const halfW = VIEW_HALF_WIDTH / camera.myViewZoom;
  const halfH = halfW / aspect;

  // Convert pixel delta to world units
  const pixToWorld = (2 * halfW) / gl.drawingBufferWidth;
  const dx = (settingsManager.lastMouseX - camera.mouseX) * pixToWorld;
  const dy = -(settingsManager.lastMouseY - camera.mouseY) * pixToWorld; // Y inverted

  camera.myViewPanX -= dx;
  camera.myViewPanY -= dy;

  // Store momentum
  this.panSpeedX_ = -dx * 0.75;
  this.panSpeedY_ = -dy * 0.75;

  // Update drag origin
  camera.mouseX = settingsManager.lastMouseX;
  camera.mouseY = settingsManager.lastMouseY;

  return true; // Handled
}
```

---

## Part 2: Camera State Properties

Add pan/zoom state to `Camera` class in [camera.ts](src/engine/camera/camera.ts):

```typescript
// Add alongside existing flatMapPanX/Y/Zoom and polarViewPanX/Y/Zoom
myViewPanX = 0;
myViewPanY = 0;
myViewZoom = 1;
```

These are public so the dots-manager shader can read them as uniforms.

---

## Part 3: CameraType Registration

Add a new enum value in [camera.ts](src/engine/camera/camera.ts):

```typescript
export enum CameraType {
  // ... existing values ...
  MY_VIEW = 9,          // Use the next available number
  MAX_CAMERA_TYPES = 10, // Bump this
}
```

**Existing values**: CURRENT=0, FIXED_TO_EARTH=1, FIXED_TO_SAT=2, FPS=3, PLANETARIUM=4, SATELLITE=5, ASTRONOMY=6, FLAT_MAP=7, POLAR_VIEW=8, MAX=9

---

## Part 4: Background Renderer

A WebGL program that draws the 2D background (map image, grid lines, etc.).

### Structure

```typescript
export class MyViewBackground {
  private program_: WebGLProgram;
  private vao_: WebGLVertexArrayObject;
  private uniforms_: Record<string, WebGLUniformLocation>;

  init(gl: WebGL2RenderingContext): void {
    // Create shader program, VAO, upload geometry
  }

  draw(pMatrix: mat4, camMatrix: mat4, /* view-specific params */): void {
    const gl = this.gl_;
    gl.useProgram(this.program_);
    gl.uniformMatrix4fv(this.uniforms_.u_pMatrix, false, pMatrix);
    gl.uniformMatrix4fv(this.uniforms_.u_camMatrix, false, camMatrix);
    // Set view-specific uniforms
    gl.bindVertexArray(this.vao_);
    gl.drawElements(gl.TRIANGLES, this.indexCount_, gl.UNSIGNED_SHORT, 0);
  }
}
```

### Geometry Conventions

- **Flat map**: Quad spanning `[-3*halfW, -halfH, 0]` to `[3*halfW, halfH, 0]` (3x width for wrapping)
- **Polar view**: Quad spanning `[-r*1.2, -r*1.2, -0.1]` to `[r*1.2, r*1.2, -0.1]`
- **Z position**: Place background at Z = 0 or slightly negative (behind satellites at Z = 0+)

### Projection / Camera Matrix Usage

The background renderer receives the same `pMatrix` and `camMatrix` from the camera delegate:
```typescript
this.myBackground_.draw(
  camera.projectionMatrix,      // Orthographic projection set by delegate
  camera.matrixWorldInverse,    // Identity for 2D views
  /* other params */
);
```

---

## Part 5: Dots-Manager Shader Integration

Satellite positions are transformed from ECI to screen space in the vertex shader of [dots-manager.ts](src/engine/rendering/dots-manager.ts).

### Adding a New View Mode

**1. Add uniforms to dots-manager:**

In the uniforms object (around line 120):
```typescript
u_myViewMode: WebGLUniformLocation,
u_myViewParam1: WebGLUniformLocation,
// ... view-specific uniforms
```

**2. Add uniform properties to DotsManager class:**
```typescript
myViewData: Float32Array = new Float32Array(N); // Precomputed on CPU
```

**3. Set uniforms in draw() method** (around line 234):
```typescript
const isMyView = mainCamera.cameraType === CameraType.MY_VIEW;
gl.uniform1i(this.programs.dots.uniforms.u_myViewMode, isMyView ? 1 : 0);
if (isMyView) {
  gl.uniform1f(this.programs.dots.uniforms.u_myViewParam1, mainCamera.myViewZoom);
  // ...
}
```

**4. Add vertex shader branch:**

The vertex shader has this structure:
```glsl
if (u_flatMapMode) {
  // ... flat map transform ...
} else if (u_polarViewMode) {
  // ... polar view transform ...
} else if (u_myViewMode) {
  // YOUR TRANSFORM HERE
  // Input: eciPos (vec3, km), eciDist (float, km from origin)
  // Must output: position = u_pMvCamMatrix * vec4(viewPos, 1.0)

  // Example: ECI → your coordinate system
  vec3 viewPos = transformEciToMyView(eciPos);
  position = u_pMvCamMatrix * vec4(viewPos, 1.0);

  // Cull objects outside view
  if (shouldCull) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
}
```

### Shader Transform Patterns

**ECI to Lat/Lon (flat map pattern):**
```glsl
float lon = atan(eciPos.y, eciPos.x) - u_gmst;  // Subtract GMST for Earth-fixed
lon = mod(lon + PI, 2.0 * PI) - PI;               // Normalize to [-π, π]
float lat = atan(eciPos.z, length(eciPos.xy));
```

**ECI to ECEF (polar view pattern):**
```glsl
float cg = cos(u_gmst);
float sg = sin(u_gmst);
vec3 ecef = vec3(
  eciPos.x * cg + eciPos.y * sg,
  -eciPos.x * sg + eciPos.y * cg,
  eciPos.z
);
```

**ECEF to ENU (sensor-relative):**
```glsl
vec3 d = ecef - u_sensorEcef;
vec3 enu = u_ecefToEnu * d;  // mat3 × vec3
float az = atan(enu.x, enu.y);
float el = atan(enu.z, length(enu.xy));
```

**Point size scaling for 2D views:**
```glsl
gl_PointSize = baseSize * sqrt(u_myViewZoom);
```

### Culling Conventions

Objects outside the view should be sent to clip space `(2, 2, 2, 1)` which is outside the frustum:
```glsl
if (shouldCull) {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = 0.0;
  return;
}
```

---

## Part 6: Plugin Wrapper

### Registration Pattern

```typescript
export class MyView extends KeepTrackPlugin {
  readonly id = 'MyView';
  dependencies_: string[] = [];

  private background_: MyViewBackground | null = null;
  private cameraDelegate_ = new MyViewCameraDelegate();

  addJs(): void {
    super.addJs();

    // 1. Register camera delegate
    const camera = ServiceLocator.getMainCamera();
    camera.registerCameraModeDelegate(CameraType.MY_VIEW, this.cameraDelegate_);

    const eventBus = EventBus.getInstance();

    // 2. Render custom background
    eventBus.on(EventBusEvent.renderCustomBackground, () => {
      if (camera.cameraType !== CameraType.MY_VIEW) return false;

      if (!this.background_) {
        this.background_ = new MyViewBackground();
        this.background_.init(ServiceLocator.getRenderer().gl);
      }

      this.background_.draw(camera.projectionMatrix, camera.matrixWorldInverse, ...);
      return true;  // MUST return true to skip default background
    });

    // 3. Skip 3D elements
    eventBus.on(EventBusEvent.shouldSkipEarthDraw, () => camera.cameraType === CameraType.MY_VIEW);
    eventBus.on(EventBusEvent.shouldSkipSatelliteModels, () => camera.cameraType === CameraType.MY_VIEW);
    eventBus.on(EventBusEvent.shouldSkipTransparentObjects, () => camera.cameraType === CameraType.MY_VIEW);

    // 4. Keep icon state in sync
    eventBus.on(EventBusEvent.updateLoop, () => {
      const isActive = camera.cameraType === CameraType.MY_VIEW;
      if (isActive && !this.isMenuButtonActive) this.setBottomIconToSelected();
      else if (!isActive && this.isMenuButtonActive) this.setBottomIconToUnselected();
    });
  }

  // 5. Toggle handler
  bottomIconCallback = (): void => {
    ServiceLocator.getSoundManager()?.play(SoundNames.TOGGLE_ON);
    ServiceLocator.getMainCamera().cameraType = CameraType.MY_VIEW;
    this.setBottomIconToSelected();
  };
}
```

### Plugin Manifest Entry

In [plugin-manifest.ts](src/plugins/plugin-manifest.ts):
```typescript
{
  configKey: 'myView',
  proImport: () => import('../plugins-pro/my-view/my-view'),
  proClassName: 'MyView',
  defaultConfig: { enabled: true, order: 99 },
},
```

In [keeptrack-plugins-configuration.ts](src/plugins/keeptrack-plugins-configuration.ts):
```typescript
myView?: PluginEnabledConfig;
```

---

## Known Pitfalls and Solutions

### Pitfall 1: Screenshot Projection Overwrite

**Problem**: Screenshots resize the canvas, which calls `updatePMatrix()` → `Camera.calculatePMatrix()` → overwrites delegate's orthographic projection with perspective.

**How it's solved**: [webgl-renderer.ts](src/engine/rendering/webgl-renderer.ts) re-invokes `camera.draw(this.sensorPos)` after resize so the delegate can recompute its projection for the new canvas dimensions.

**When adding a new view**: No action needed — the fix is in the renderer and works for all delegates automatically.

### Pitfall 2: GMST Desync After Time Jump

**Problem**: `timeManager.changeStaticOffset()` updates simulation time but NOT `timeManager.gmst`. GMST is only recalculated in `timeManager.update()` which runs in the render loop. If your view plugin calls `camera.lookAtLatLon()` synchronously after `changeStaticOffset()`, it uses stale GMST and targets the wrong longitude.

**Solution**: Wrap camera positioning in `requestAnimationFrame`:
```typescript
timeManager.changeStaticOffset(targetTime - Date.now());
requestAnimationFrame(() => {
  camera.lookAtLatLon(lat, lon, 0, new Date(targetTime));
});
```

### Pitfall 3: ECI-to-OpenGL Transform

**Problem**: `Camera.calculatePMatrix()` applies an ECI-to-OpenGL axis swap (Y↔Z) that's required for 3D views but wrong for 2D orthographic views.

**Rule**: Custom delegates must compute their own orthographic matrix via `mat4.ortho()` — never call or build on `Camera.calculatePMatrix()`. The `onExit()` method must restore perspective by calling `Camera.calculatePMatrix()`.

### Pitfall 4: worldShiftOverride

**Problem**: Without `worldShiftOverride = [0, 0, 0]`, the scene shifts all positions to center on the viewed body. In 2D views, this offsets everything incorrectly.

**Rule**: Always set `Scene.getInstance().worldShiftOverride = [0, 0, 0]` in `onEnter()` and clear it (`= null`) in `onExit()`.

### Pitfall 5: Sensor-Dependent Views

**Problem**: Views that depend on a sensor (like polar view) must handle sensor changes while the view is active, and must validate that a sensor is selected before activating.

**Pattern**: Guard activation in `bottomIconCallback`:
```typescript
if (!sensorManager.isSensorSelected()) {
  errorManagerInstance.warn('Select a sensor first.');
  return;
}
```

Update sensor-derived uniforms in the `updateLoop` handler with memoization:
```typescript
const hash = `${sensor.lat}_${sensor.lon}_${sensor.alt}`;
if (hash === this.lastHash_) return;
this.lastHash_ = hash;
// Recompute sensor ECEF, ENU matrix, etc.
```

### Pitfall 6: lon2yaw Uses Wall-Clock Time

**Problem**: `lon2yaw()` in [transforms.ts](src/engine/utils/transforms.ts) uses `new Date()` (browser wall clock), NOT simulation time. This means longitude-to-yaw conversion is independent of time warp/pause state but sensitive to when it's called.

**Rule**: Always pass an explicit date to `lookAtLatLon` (4th param) rather than relying on defaults. Use falsy `0` for the zoom param to skip it (ESLint rejects explicit `undefined`).

### Pitfall 7: Aspect Ratio Source

**Problem**: Using `canvas.width / canvas.height` vs `gl.drawingBufferWidth / gl.drawingBufferHeight` can differ when the canvas CSS size doesn't match its buffer size (e.g., during hi-res screenshot mode).

**Rule**: Always use `gl.drawingBufferWidth / gl.drawingBufferHeight` for projection matrix aspect ratio calculations.

---

## Coordinate System Reference

### ECI (Earth-Centered Inertial)
- Origin: Earth center
- X: Vernal equinox direction
- Y: 90 degrees east in equatorial plane
- Z: North pole
- Units: km
- Satellites stored in this frame

### ECEF (Earth-Centered Earth-Fixed)
- Same origin as ECI, rotates with Earth
- Conversion: rotate by -GMST around Z axis
- Used as intermediate for sensor-relative views

### ENU (East-North-Up)
- Origin: sensor location on Earth surface
- E (x): East, N (y): North, U (z): Up
- Conversion from ECEF: subtract sensor ECEF position, multiply by 3x3 rotation matrix

### OpenGL Clip Space
- After projection: X,Y in [-1, 1], Z in [-1, 1] (WebGL2)
- Anything outside is clipped

### Flat Map Coordinates
- X: longitude * R_earth (km), wraps at ±π * R_earth
- Y: latitude * R_earth (km), clamped at ±π/2 * R_earth
- Z: altitude * 0.001 (scaled down, used for depth ordering)

### Polar View Coordinates
- Azimuth: 0 = North (+Y), 90 = East (+X), measured clockwise
- Elevation: 90 = zenith (center), 0 = horizon (edge)
- Radius: r = (π/2 - el) / (π/2), so zenith=0, horizon=1
- Cartesian: x = r * sin(az) * gridRadius, y = r * cos(az) * gridRadius

---

## File Reference

| Component | File | Key Lines |
|---|---|---|
| CameraType enum | [camera.ts](src/engine/camera/camera.ts) | 58-71 |
| ICameraModeDelegate | [camera.ts](src/engine/camera/camera.ts) | 78-91 |
| registerCameraModeDelegate | [camera.ts](src/engine/camera/camera.ts) | 117-123 |
| Camera.draw() flow | [camera.ts](src/engine/camera/camera.ts) | 345-431 |
| Camera.calculatePMatrix() | [camera.ts](src/engine/camera/camera.ts) | 1622-1634 |
| projectionCameraMatrix composition | [webgl-renderer.ts](src/engine/rendering/webgl-renderer.ts) | 98 |
| updatePMatrix() | [webgl-renderer.ts](src/engine/rendering/webgl-renderer.ts) | 72-78 |
| Screenshot resize + delegate fix | [webgl-renderer.ts](src/engine/rendering/webgl-renderer.ts) | 87-98 |
| Flat map delegate | [flat-map-camera-delegate.ts](src/plugins-pro/flat-map-view/flat-map-camera-delegate.ts) | full |
| Polar view delegate | [polar-view-camera-delegate.ts](src/plugins-pro/polar-view/polar-view-camera-delegate.ts) | full |
| Flat map background | [flat-earth-map.ts](src/plugins-pro/flat-map-view/flat-earth-map.ts) | full |
| Polar grid background | [polar-grid.ts](src/plugins-pro/polar-view/polar-grid.ts) | full |
| Flat map plugin | [flat-map-view.ts](src/plugins-pro/flat-map-view/flat-map-view.ts) | full |
| Polar view plugin | [polar-view.ts](src/plugins-pro/polar-view/polar-view.ts) | full |
| Dots shader (flat map) | [dots-manager.ts](src/engine/rendering/dots-manager.ts) | ~1156-1194 |
| Dots shader (polar view) | [dots-manager.ts](src/engine/rendering/dots-manager.ts) | ~1195-1238 |
| Scene render events | [scene.ts](src/engine/core/scene.ts) | 249-464 |
| worldShiftOverride | [scene.ts](src/engine/core/scene.ts) | 191-197 |
| lon2yaw | [transforms.ts](src/engine/utils/transforms.ts) | 23-45 |

---

## Checklist for New Camera Views

Before shipping a new camera view, verify all of these:

- [ ] CameraType enum value added, MAX_CAMERA_TYPES bumped
- [ ] Camera state properties added (panX, panY, zoom) — public for shader access
- [ ] Delegate implements all 6 ICameraModeDelegate methods
- [ ] `onEnter` sets `worldShiftOverride = [0, 0, 0]` and `selectedColorOverride`
- [ ] `onExit` restores perspective via `Camera.calculatePMatrix()` and clears overrides
- [ ] Orthographic projection uses `gl.drawingBufferWidth/Height` for aspect ratio
- [ ] Background renderer draws behind satellites (Z ≤ 0)
- [ ] `renderCustomBackground` handler returns `true` when active
- [ ] `shouldSkipEarthDraw`, `shouldSkipSatelliteModels`, `shouldSkipTransparentObjects` registered
- [ ] Dots-manager shader branch added with appropriate ECI transform
- [ ] Shader culls out-of-view objects to `(2, 2, 2, 1)`
- [ ] Point size scales with `sqrt(zoom)` for consistent dot appearance
- [ ] Plugin registered in manifest with `configKey`, import, className, `defaultConfig`
- [ ] Config type added to `keeptrack-plugins-configuration.ts`
- [ ] Keyboard shortcut assigned (next available number key)
- [ ] Bottom icon syncs with camera state in `updateLoop`
- [ ] Screenshots work correctly (verified — delegate projection survives resize)
- [ ] Sensor validation present if view is sensor-dependent
