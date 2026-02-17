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

### Architecture Direction

The long-term goal is for [camera.ts](src/engine/camera/camera.ts) to act as a **pure orchestrator** with no references to specific view types. The current code has several anti-patterns inherited from the monolithic design:

**Anti-pattern 1: Hardcoded `CameraType` enum** (line 57, has a TODO to fix)
```typescript
export enum CameraType {
  FLAT_MAP = 7,    // Pro-specific — shouldn't be in OSS core
  POLAR_VIEW = 8,  // Pro-specific — shouldn't be in OSS core
}
```
New views currently require adding an enum value here. Future: views should register dynamically, and the enum should only contain the built-in OSS modes.

**Anti-pattern 2: `changeCameraType()` cycling logic** (lines 197-271)
Hardcodes the tab-order of camera modes and skip conditions for FLAT_MAP/POLAR_VIEW:
```typescript
case CameraType.FLAT_MAP:
  this.cameraType = CameraType.FIXED_TO_EARTH; break;
// ...skip if delegate not registered:
if (!this.cameraModeDelegates_.has(CameraType.FLAT_MAP)) this.cameraType++;
```
New views that add enum values also need entries here. Future: cycling should iterate over registered delegates.

**Anti-pattern 3: Pan/zoom state on Camera** (lines 103-111)
```typescript
flatMapPanX = 0;  // Flat-map-specific state polluting core Camera class
polarViewPanX = 0; // Polar-view-specific state polluting core Camera class
```
New views should **keep all pan/zoom state inside the delegate** and expose it to shaders through DotsManager properties rather than Camera properties. See "Part 2" for how to do this.

**Anti-pattern 4: `setCameraType()` validation** (line 621)
```typescript
if (val > 6 || val < 0) { throw new RangeError(); }
```
This rejects any delegate-backed mode (FLAT_MAP=7, POLAR_VIEW=8). Don't use `setCameraType()` — assign `cameraType` directly instead.

**What works well (follow these patterns):**
- Delegate registration via `registerCameraModeDelegate()` (lines 117-123)
- Automatic `onEnter`/`onExit` transition detection in `draw()` (lines 356-361) — just assign `cameraType` and the transitions fire
- `update()` properly delegates to registered modes (lines 766-767)
- `zoomWheel()` properly delegates (line 281)
- `handleDrag()` properly delegates via `updatePitchYawSpeeds_()` (line 1473)

### CameraState ([camera-state.ts](src/engine/camera/state/camera-state.ts))

The `CameraState` class (~400 lines) holds all state for built-in 3D modes: FPS position, satellite snap, local rotation, panning, zoom, etc. **Delegate-backed views should NOT use CameraState** — this state is irrelevant to 2D orthographic views. Keep your view's state in the delegate itself or on dedicated DotsManager properties for shader access.

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

**Standard orthographic setup pattern** (uses delegate-internal state, not Camera properties):
```typescript
draw(camera: Camera): void {
  const renderer = ServiceLocator.getRenderer();
  camera.projectionMatrix = MyDelegate.calculateOrthoPMatrix_(
    renderer.gl, this.zoom_, this.panX_, this.panY_,
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
onEnter(_camera: Camera): void {
  // 1. Reset delegate-internal view state
  this.panX_ = 0;
  this.panY_ = 0;
  this.zoom_ = this.getDefaultZoom_();
  this.panSpeedX_ = 0;
  this.panSpeedY_ = 0;

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

Called every frame. Apply pan momentum decay using delegate-internal state:
```typescript
update(_camera: Camera, _dt: Milliseconds): void {
  if (!settingsManager.isDragging) {
    this.panX_ += this.panSpeedX_;
    this.panY_ += this.panSpeedY_;
    this.panSpeedX_ *= 0.9;
    this.panSpeedY_ *= 0.9;
    // Clamp or wrap pan values
  }
}
```

### zoomWheel() — Cursor-Relative Zoom

For best UX, zoom toward the cursor position. Uses delegate-internal state:
```typescript
zoomWheel(_camera: Camera, delta: number): boolean {
  const renderer = ServiceLocator.getRenderer();
  const gl = renderer.gl;

  // 1. Get cursor NDC position
  const mouseX = settingsManager.lastMouseX ?? gl.drawingBufferWidth / 2;
  const mouseY = settingsManager.lastMouseY ?? gl.drawingBufferHeight / 2;
  const ndcX = (mouseX / gl.drawingBufferWidth) * 2 - 1;
  const ndcY = 1 - (mouseY / gl.drawingBufferHeight) * 2;

  // 2. World position under cursor BEFORE zoom
  const halfW = VIEW_HALF_WIDTH / this.zoom_;
  const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  const halfH = halfW / aspect;
  const worldX = this.panX_ + ndcX * halfW;
  const worldY = this.panY_ + ndcY * halfH;

  // 3. Apply zoom
  const factor = delta > 0 ? 1.1 : 1 / 1.1;
  this.zoom_ = Math.max(minZoom, Math.min(maxZoom, this.zoom_ * factor));

  // 4. Adjust pan so world point stays under cursor
  const newHalfW = VIEW_HALF_WIDTH / this.zoom_;
  const newHalfH = newHalfW / aspect;
  this.panX_ = worldX - ndcX * newHalfW;
  this.panY_ = worldY - ndcY * newHalfH;

  return true; // Handled
}
```

### handleDrag() — Pan

Uses delegate-internal state. Note: `camera.mouseX`/`mouseY` are the drag origin and live on Camera (shared infrastructure, not view-specific):
```typescript
handleDrag(camera: Camera): boolean {
  const renderer = ServiceLocator.getRenderer();
  const gl = renderer.gl;
  const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  const halfW = VIEW_HALF_WIDTH / this.zoom_;
  const halfH = halfW / aspect;

  // Convert pixel delta to world units
  const pixToWorld = (2 * halfW) / gl.drawingBufferWidth;
  const dx = (settingsManager.lastMouseX - camera.mouseX) * pixToWorld;
  const dy = -(settingsManager.lastMouseY - camera.mouseY) * pixToWorld; // Y inverted

  this.panX_ -= dx;
  this.panY_ -= dy;

  // Store momentum for update()
  this.panSpeedX_ = -dx * 0.75;
  this.panSpeedY_ = -dy * 0.75;

  // Update drag origin (this is Camera shared infrastructure, ok to use)
  camera.mouseX = settingsManager.lastMouseX;
  camera.mouseY = settingsManager.lastMouseY;

  return true; // Handled
}
```

---

## Part 2: View State (Pan/Zoom)

**Preferred: Delegate-internal state** — keep all pan/zoom/momentum state as private fields inside your delegate class. This avoids polluting the core Camera class with view-specific properties:

```typescript
class MyViewCameraDelegate implements ICameraModeDelegate {
  private panX_ = 0;
  private panY_ = 0;
  private zoom_ = 1;
  private panSpeedX_ = 0;
  private panSpeedY_ = 0;

  draw(camera: Camera): void {
    camera.projectionMatrix = this.calculateOrtho_(ServiceLocator.getRenderer().gl);
  }

  private calculateOrtho_(gl: WebGL2RenderingContext): mat4 {
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    const halfW = VIEW_HALF_WIDTH / this.zoom_;
    const halfH = halfW / aspect;
    const pMatrix = mat4.create();
    mat4.ortho(pMatrix, -halfW + this.panX_, halfW + this.panX_,
               -halfH + this.panY_, halfH + this.panY_, -100000, 100000);
    return pMatrix;
  }
}
```

**Exposing state to dots-manager shaders:** The dots-manager shader needs zoom/pan values as uniforms. Set these via DotsManager properties in `draw()` or `update()`:
```typescript
draw(camera: Camera): void {
  // Set projection from internal state
  camera.projectionMatrix = this.calculateOrtho_(ServiceLocator.getRenderer().gl);
  // Expose to shader via DotsManager (avoids putting state on Camera)
  const dm = ServiceLocator.getDotsManager?.();
  if (dm) {
    dm.myViewZoom = this.zoom_;
    dm.myViewPanX = this.panX_;
    dm.myViewPanY = this.panY_;
  }
}
```

**Legacy pattern (existing views):** The flat-map and polar-view delegates currently store state as public properties on Camera (`camera.flatMapPanX`, `camera.polarViewPanX`, etc.). This works but pollutes the core class. New views should use the delegate-internal pattern above. Existing views may be migrated over time.

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

A WebGL program that draws the 2D background (map image, grid lines, etc.). Uses the project's standard helpers:

- `WebGlProgramHelper` from [webgl-program.ts](src/engine/rendering/webgl-program.ts) — compiles shaders, links program, auto-wires uniforms and attributes
- `BufferAttribute` from [buffer-attribute.ts](src/engine/rendering/buffer-attribute.ts) — attribute layout descriptors
- `glsl` tagged template from [formatter.ts](src/engine/utils/development/formatter.ts) — shader source strings

### Complete Skeleton

```typescript
/* eslint-disable camelcase */
import { BufferAttribute } from '@app/engine/rendering/buffer-attribute';
import { WebGlProgramHelper } from '@app/engine/rendering/webgl-program';
import { glsl } from '@app/engine/utils/development/formatter';
import { mat4 } from 'gl-matrix';

export class MyViewBackground {
  private gl_: WebGL2RenderingContext;
  private program_: WebGLProgram;
  private vao_: WebGLVertexArrayObject;
  private vertPosBuf_: WebGLBuffer;
  private vertUvBuf_: WebGLBuffer;
  private vertIndexBuf_: WebGLBuffer;
  private isLoaded_ = false;

  // Uniform locations — keys must match shader uniform names exactly
  // WebGlProgramHelper auto-fills these via gl.getUniformLocation()
  private uniforms_ = {
    u_pMatrix: null as unknown as WebGLUniformLocation,
    u_camMatrix: null as unknown as WebGLUniformLocation,
    // Add view-specific uniforms here (textures, time, etc.)
  };

  // Attribute layout — location must match shader `layout(location = N)`
  private attribs_ = {
    a_position: new BufferAttribute({ location: 0, vertices: 3, offset: 0 }),
    a_uv: new BufferAttribute({ location: 1, vertices: 2, offset: 0 }),
  };

  init(gl: WebGL2RenderingContext): void {
    this.gl_ = gl;

    this.program_ = new WebGlProgramHelper(
      gl,
      this.shaders_.vert,
      this.shaders_.frag,
      this.attribs_,
      this.uniforms_,
    ).program;

    this.initGeometry_();
    this.isLoaded_ = true;
  }

  private initGeometry_(): void {
    const gl = this.gl_;
    // See "Geometry Conventions" below for position/UV values
    const positions = new Float32Array([/* ... */]);
    const uvs = new Float32Array([/* ... */]);
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    // Position buffer
    this.vertPosBuf_ = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuf_);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // UV buffer
    this.vertUvBuf_ = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertUvBuf_);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    // Index buffer
    this.vertIndexBuf_ = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertIndexBuf_);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // VAO
    this.vao_ = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao_);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuf_);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertUvBuf_);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertIndexBuf_);
    gl.bindVertexArray(null);
  }

  draw(pMatrix: mat4, camMatrix: mat4 /* view-specific params */): void {
    if (!this.isLoaded_) return;
    const gl = this.gl_;

    gl.useProgram(this.program_);
    gl.uniformMatrix4fv(this.uniforms_.u_pMatrix, false, pMatrix);
    gl.uniformMatrix4fv(this.uniforms_.u_camMatrix, false, camMatrix);
    // Set view-specific uniforms here

    // REQUIRED: enable depth so background participates in depth ordering with satellite dots
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);

    gl.bindVertexArray(this.vao_);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }

  dispose(): void {
    if (!this.isLoaded_) return;
    const gl = this.gl_;

    gl.deleteBuffer(this.vertPosBuf_);
    gl.deleteBuffer(this.vertUvBuf_);
    gl.deleteBuffer(this.vertIndexBuf_);
    gl.deleteVertexArray(this.vao_);
    gl.deleteProgram(this.program_);
    this.isLoaded_ = false;
  }

  private shaders_ = {
    vert: glsl`#version 300 es
      precision highp float;

      in vec3 a_position;
      in vec2 a_uv;

      uniform mat4 u_pMatrix;
      uniform mat4 u_camMatrix;

      out vec2 vUv;

      void main(void) {
        vUv = a_uv;
        gl_Position = u_pMatrix * u_camMatrix * vec4(a_position, 1.0);
      }
    `,
    frag: glsl`#version 300 es
      precision highp float;

      in vec2 vUv;
      out vec4 fragColor;

      void main(void) {
        // Your background rendering here
        fragColor = vec4(0.02, 0.02, 0.05, 1.0);
      }
    `,
  };
}
```

### Key Conventions

- `/* eslint-disable camelcase */` at top — uniform names like `u_pMatrix` trigger the linter
- Shaders use GLSL ES 3.0: `#version 300 es`, `in`/`out` (not `attribute`/`varying`), `fragColor` output (not `gl_FragColor`)
- `isLoaded_` guard on `draw()` — prevents draw calls before `init()` completes
- `dispose()` deletes all GPU resources — call when the view is permanently destroyed

### Geometry Conventions

Background is a simple quad. Geometry design depends on the view type:

**Horizontal wrapping (flat map pattern):**
- Make the quad 3x wider than the map: positions span `[-3*hw, -hh, 0]` to `[3*hw, hh, 0]`
- UVs range from `[-1, 1]` to `[2, 0]` (3 tiles)
- Fragment shader uses `fract(vUv.x)` to wrap the texture seamlessly
- Why 3x: ensures at least one full tile is always visible regardless of pan position

**Circular view with fade (polar grid pattern):**
- Quad extends 20% beyond the grid: positions span `[-r*1.2, -r*1.2, -0.1]` to `[r*1.2, r*1.2, -0.1]`
- UVs match: `[-1.2, -1.2]` to `[1.2, 1.2]`, so UV `length(vUv) == 1.0` is the grid edge
- Fragment shader uses `discard` for `r > 1.05` and `smoothstep` for outer fade
- Z = -0.1 puts the grid slightly behind satellite dots at Z = 0

**Z position rule:** Background at Z ≤ 0, satellite dots rendered at Z ≥ 0. Depth test ensures correct ordering.

### Accessing Earth Textures

For textured backgrounds (like the flat Earth map), get textures from the 3D Earth object:

```typescript
const scene = Scene.getInstance();
const sm = settingsManager;
const dayTex = scene.earth.textureDay[sm.earthTextureStyle + sm.earthDayTextureQuality] ?? null;
const nightTex = scene.earth.textureNight[sm.earthTextureStyle + sm.earthNightTextureQuality] ?? null;
```

Bind to separate texture units in `draw()`:
```typescript
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, dayTexture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // For horizontal wrapping
gl.uniform1i(this.uniforms_.uDayMap, 0);

gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, nightTexture ?? dayTexture); // Fall back to day if unavailable
gl.uniform1i(this.uniforms_.uNightMap, 1);
```

### Lazy Initialization

Background renderers are created lazily in the `renderCustomBackground` handler:
```typescript
if (!this.background_) {
  this.background_ = new MyViewBackground();
  this.background_.init(ServiceLocator.getRenderer().gl);
}
```
**Why lazy:** The WebGL context may not exist when `addJs()` runs. Deferring to first render guarantees the GL context is ready. This also avoids allocating GPU resources for views the user may never activate.

### Fragment Shader Recipes

**Day/night blending with GMST rotation** (from [flat-earth-map.ts](src/plugins-pro/flat-map-view/flat-earth-map.ts)):
```glsl
float u = fract(vUv.x);                         // Wrap UV horizontally
float lon = (u - 0.5) * 2.0 * PI;               // UV → longitude [-π, π]
float lat = (0.5 - vUv.y) * PI;                 // UV → latitude [-π/2, π/2]
float eciLon = lon + u_gmst;                     // Earth-fixed → inertial
vec3 surfaceNormal = vec3(cos(lat) * cos(eciLon), cos(lat) * sin(eciLon), sin(lat));
float diffuse = max(dot(surfaceNormal, uLightDirection), 0.0);
vec3 dayColor = texture(uDayMap, vUv).rgb * diffuse * 1.3;
vec3 nightColor = texture(uNightMap, vUv).rgb * pow(1.0 - diffuse, 2.0);
fragColor = vec4(dayColor + nightColor, 1.0);
```
Note: texture sampling uses raw `vUv` (not `fract(vUv)`) because `gl.TEXTURE_WRAP_S = gl.REPEAT` handles wrapping without the derivative discontinuity that `fract()` causes at seam boundaries.

**Procedural grid lines with smoothstep** (from [polar-grid.ts](src/plugins-pro/polar-view/polar-grid.ts)):
```glsl
float r = length(vUv);                          // Polar radius (0=center, 1=edge)
if (r > 1.05) discard;                          // Outside grid

// Concentric rings every N steps
float ringStep = 1.0 / 9.0;                     // 9 rings for 15° elevation steps
float ringFrac = mod(r, ringStep);
float ringDist = min(ringFrac, ringStep - ringFrac);
float ringLine = 1.0 - smoothstep(0.0, 0.003, ringDist);

// Radial lines every M degrees
float angle = atan(vUv.y, vUv.x);
float azStep = PI / 6.0;                        // 12 lines at 30° spacing
float azFrac = mod(angle + PI, azStep);
float azDist = min(azFrac, azStep - azFrac);
float azLine = 1.0 - smoothstep(0.0, (0.003 + 0.01 * (1.0 - r)) * r + 0.001, azDist * r);
azLine *= smoothstep(0.02, 0.08, r);            // Fade near center to avoid clutter

// Combine with background
vec3 gridColor = vec3(0.3);
vec3 color = mix(bgColor, gridColor, max(ringLine * 0.35, azLine * 0.25));
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

The delegate exposes its state via DotsManager properties (see Part 2), and DotsManager passes them to the shader:
```typescript
const isMyView = mainCamera.cameraType === CameraType.MY_VIEW;
gl.uniform1i(this.programs.dots.uniforms.u_myViewMode, isMyView ? 1 : 0);
if (isMyView) {
  gl.uniform1f(this.programs.dots.uniforms.u_myViewZoom, this.myViewZoom);
  gl.uniform1f(this.programs.dots.uniforms.u_myViewPanX, this.myViewPanX);
  gl.uniform1f(this.programs.dots.uniforms.u_myViewPanY, this.myViewPanY);
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

### Pitfall 8: GPU Text Label Spacing vs Aspect Ratio

**Problem**: Instanced-glyph label managers (e.g., `ConstellationLabelManager`, `CardinalLabels`) render text as billboard quads sized by `u_glyphSize`. If `u_glyphSize` scales with `drawingBufferWidth` but character spacing (`a_charOffset`) is a fixed pixel value, wider aspect ratios make glyphs larger while spacing stays constant — causing letters to overlap.

**Rules for instanced-glyph labels:**
1. **Base `u_glyphSize` on `min(width, height)`** — height is stable across aspect ratios:
   ```typescript
   gl.uniform1f(uniforms.u_glyphSize, Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight) * 0.012);
   ```
2. **Express character offsets in glyph-size units** (not pixels). Use a `charStep` fraction (~0.55) per character:
   ```typescript
   const charStep = 0.55;
   const totalWidth = label.length * charStep;
   const startOffset = -totalWidth / 2;
   charOffsetData[idx] = startOffset + c * charStep;
   ```
3. **Multiply by `u_glyphSize` in the shader** so spacing scales with glyph size:
   ```glsl
   screenPos.x += a_charOffset * u_glyphSize;  // NOT just a_charOffset
   ```

**Reference implementations**: [constellation-labels.ts](src/plugins-pro/stars/constellation-labels.ts), [cardinal-labels.ts](src/plugins-pro/ground-view/cardinal-labels.ts)

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
| WebGlProgramHelper | [webgl-program.ts](src/engine/rendering/webgl-program.ts) | 24-78 |
| BufferAttribute | [buffer-attribute.ts](src/engine/rendering/buffer-attribute.ts) | 1-28 |
| Dots shader (flat map) | [dots-manager.ts](src/engine/rendering/dots-manager.ts) | ~1156-1194 |
| Dots shader (polar view) | [dots-manager.ts](src/engine/rendering/dots-manager.ts) | ~1195-1238 |
| Scene render events | [scene.ts](src/engine/core/scene.ts) | 249-464 |
| worldShiftOverride | [scene.ts](src/engine/core/scene.ts) | 191-197 |
| lon2yaw | [transforms.ts](src/engine/utils/transforms.ts) | 23-45 |

---

## Checklist for New Camera Views

Before shipping a new camera view, verify all of these:

- [ ] CameraType enum value added, MAX_CAMERA_TYPES bumped
- [ ] Pan/zoom state kept as private fields inside the delegate (not on Camera class)
- [ ] Delegate exposes zoom/pan to DotsManager for shader uniform access
- [ ] Delegate implements all 6 ICameraModeDelegate methods
- [ ] `onEnter` sets `worldShiftOverride = [0, 0, 0]` and `selectedColorOverride`
- [ ] `onExit` restores perspective via `Camera.calculatePMatrix()` and clears overrides
- [ ] Orthographic projection uses `gl.drawingBufferWidth/Height` for aspect ratio
- [ ] Background renderer uses `WebGlProgramHelper` + `BufferAttribute` + `glsl` template
- [ ] Background renderer has `isLoaded_` guard, lazy init, and `dispose()` cleanup
- [ ] Background renderer calls `gl.enable(gl.DEPTH_TEST); gl.depthMask(true)` in draw
- [ ] Background geometry Z ≤ 0 (behind satellite dots at Z ≥ 0)
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
