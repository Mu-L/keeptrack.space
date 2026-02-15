/* eslint-disable max-lines */
import { EciArr3, SatCruncherMessageData, SolarBody } from '../core/interfaces';
import { GlUtils } from './gl-utils';
/* eslint-disable camelcase */
/* eslint-disable no-useless-escape */
import { MissileObject } from '@app/app/data/catalog-manager/MissileObject';
import { OemSatellite } from '@app/app/objects/oem-satellite';
import { SelectSatManager } from '@app/plugins/select-sat-manager/select-sat-manager';
import { BaseObject, Kilometers, KilometersPerSecond, Satellite, Seconds, SpaceObjectType, TemeVec3 } from '@ootk/src/main';
import { mat4 } from 'gl-matrix';
import { SettingsManager } from '../../settings/settings';
import { CameraType } from '../camera/camera';
import { PluginRegistry } from '../core/plugin-registry';
import { Scene } from '../core/scene';
import { ServiceLocator } from '../core/service-locator';
import { EventBus } from '../events/event-bus';
import { EventBusEvent } from '../events/event-bus-events';
import { RADIUS_OF_EARTH } from '../utils/constants';
import { glsl } from '../utils/development/formatter';
import { BufferAttribute } from './buffer-attribute';
import { DepthManager } from './depth-manager';
import { WebGlProgramHelper } from './webgl-program';
import { WebGLRenderer } from './webgl-renderer';

declare module '@app/engine/core/interfaces' {
  interface SatShader {
    maxSize: number;
    minSize: number;
  }

  interface SatCruncherMessageData {
    satInSun: Int8Array;
    satInView: Int8Array;
    satPos: Float32Array;
    satVel: Float32Array;
    gmst: number;
  }
}

/**
 * Class representing a manager for dots in a space visualization.
 */
export class DotsManager {
  readonly PICKING_READ_PIXEL_BUFFER_SIZE = 1;

  private pickingColorData: number[] = [];
  /*
   * We draw the picking object bigger than the actual dot to make it easier to select objects
   * glsl code - keep as a string
   */
  private positionBufferOneTime_ = false;
  private affiliationBufferOneTime_ = false;
  private objectTypeBufferOneTime_ = false;
  private settings_: SettingsManager;
  // Array for which colors go to which ids
  private isSizeBufferOneTime_ = false;
  // Sprite atlas texture for symbology
  private symbologyTexture_: WebGLTexture | null = null;
  private symbologyTextureLoaded_ = false;

  buffers = {
    position: <WebGLBuffer><unknown>null,
    size: <WebGLBuffer><unknown>null,
    color: <WebGLBuffer><unknown>null,
    pickability: <WebGLBuffer><unknown>null,
    affiliation: <WebGLBuffer><unknown>null,
    objectType: <WebGLBuffer><unknown>null,
  };

  inSunData: Int8Array;
  inViewData: Int8Array;
  // TODO: Move to settings file
  isReady: boolean;
  pickReadPixelBuffer: Uint8Array;
  pickingBuffers = {
    position: <WebGLBuffer><unknown>null,
    color: <WebGLBuffer><unknown>null,
    pickability: <WebGLBuffer><unknown>null,
  };

  pickingRenderBuffer: WebGLRenderbuffer;
  pickingTexture: WebGLTexture;
  cruncherGmst = 0;
  positionData: Float32Array;
  programs = {
    dots: {
      program: <WebGLProgram><unknown>null,
      attribs: {
        a_position: new BufferAttribute({
          location: 0,
          vertices: 3,
          offset: 0,
        }),
        a_color: new BufferAttribute({
          location: 1,
          vertices: 4,
          offset: 0,
        }),
        a_size: new BufferAttribute({
          location: 2,
          vertices: 1,
          offset: 0,
        }),
        a_pickable: new BufferAttribute({
          location: 3,
          vertices: 1,
          offset: 0,
        }),
        a_affiliation: new BufferAttribute({
          location: 4,
          vertices: 1,
          offset: 0,
        }),
        a_objectType: new BufferAttribute({
          location: 5,
          vertices: 1,
          offset: 0,
        }),
      },
      uniforms: {
        u_pMvCamMatrix: <WebGLUniformLocation><unknown>null,
        u_minSize: <WebGLUniformLocation><unknown>null,
        u_maxSize: <WebGLUniformLocation><unknown>null,
        u_starMinSize: <WebGLUniformLocation><unknown>null,
        worldOffset: <WebGLUniformLocation><unknown>null,
        logDepthBufFC: <WebGLUniformLocation><unknown>null,
        u_symbologyEnabled: <WebGLUniformLocation><unknown>null,
        u_symbologyAtlas: <WebGLUniformLocation><unknown>null,
        u_iconMinSize: <WebGLUniformLocation><unknown>null,
        u_iconFadeRange: <WebGLUniformLocation><unknown>null,
        u_flatMapMode: <WebGLUniformLocation><unknown>null,
        u_gmst: <WebGLUniformLocation><unknown>null,
        u_earthRadius: <WebGLUniformLocation><unknown>null,
        u_flatMapCenterX: <WebGLUniformLocation><unknown>null,
        u_flatMapZoom: <WebGLUniformLocation><unknown>null,
      },
      vao: <WebGLVertexArrayObject><unknown>null,
    },
    picking: {
      program: <WebGLProgram><unknown>null,
      attribs: {
        a_position: new BufferAttribute({
          location: 0,
          vertices: 3,
          offset: 0,
        }),
        a_color: new BufferAttribute({
          location: 1,
          vertices: 4,
          offset: 0,
        }),
        a_pickable: new BufferAttribute({
          location: 2,
          vertices: 1,
          offset: 0,
        }),
      },
      uniforms: {
        u_pMvCamMatrix: <WebGLUniformLocation><unknown>null,
        u_minSize: <WebGLUniformLocation><unknown>null,
        u_maxSize: <WebGLUniformLocation><unknown>null,
        worldOffset: <WebGLUniformLocation><unknown>null,
        logDepthBufFC: <WebGLUniformLocation><unknown>null,
        u_flatMapMode: <WebGLUniformLocation><unknown>null,
        u_gmst: <WebGLUniformLocation><unknown>null,
        u_earthRadius: <WebGLUniformLocation><unknown>null,
        u_flatMapCenterX: <WebGLUniformLocation><unknown>null,
        u_flatMapZoom: <WebGLUniformLocation><unknown>null,
      },
      vao: <WebGLVertexArrayObject><unknown>null,
    },
  };

  shaders_ = {
    dots: {
      vert: <string><unknown>null,
      frag: <string><unknown>null,
    },
    picking: {
      vert: <string><unknown>null,
      frag: <string><unknown>null,
    },
  };

  sizeData: Int8Array;
  starIndex1: number;
  starIndex2: number;
  // Start of the planet dots in the object cache
  planetDot1: number;
  // End of the planet dots in the object cache
  planetDot2: number;
  velocityData: Float32Array;
  lastUpdateSimTime = 0;

  /**
   * Draws dots on a WebGLFramebuffer.
   * @param projectionCameraMatrix - The projection matrix.
   * @param tgtBuffer - The WebGLFramebuffer to draw on.
   */
  draw(projectionCameraMatrix: mat4, tgtBuffer: WebGLFramebuffer | null) {
    if (!this.isReady || !settingsManager.cruncherReady) {
      return;
    }
    const colorSchemeManagerInstance = ServiceLocator.getColorSchemeManager();

    if (!colorSchemeManagerInstance.colorBuffer) {
      return;
    }
    if (!projectionCameraMatrix) {
      return;
    }

    const gl = ServiceLocator.getRenderer().gl;

    gl.useProgram(this.programs.dots.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, tgtBuffer);

    gl.uniformMatrix4fv(this.programs.dots.uniforms.u_pMvCamMatrix, false, projectionCameraMatrix);
    gl.uniform3fv(this.programs.dots.uniforms.worldOffset, Scene.getInstance().worldShift ?? [0, 0, 0]);

    const mainCamera = ServiceLocator.getMainCamera();
    const isFlatMap = mainCamera.cameraType === CameraType.FLAT_MAP;

    gl.uniform1i(this.programs.dots.uniforms.u_flatMapMode, isFlatMap ? 1 : 0);
    if (isFlatMap) {
      gl.uniform1f(this.programs.dots.uniforms.u_gmst, ServiceLocator.getTimeManager().gmst);
      gl.uniform1f(this.programs.dots.uniforms.u_earthRadius, RADIUS_OF_EARTH);
      gl.uniform1f(this.programs.dots.uniforms.u_flatMapCenterX, mainCamera.flatMapPanX);
      gl.uniform1f(this.programs.dots.uniforms.u_flatMapZoom, mainCamera.flatMapZoom);
      gl.uniform1f(this.programs.dots.uniforms.logDepthBufFC, 0.0); // disable log depth in ortho
    } else {
      gl.uniform1f(this.programs.dots.uniforms.logDepthBufFC, DepthManager.getConfig().logDepthBufFC);
    }

    if (mainCamera.cameraType === CameraType.PLANETARIUM) {
      gl.uniform1f(this.programs.dots.uniforms.u_minSize, this.settings_.satShader.minSizePlanetarium);
      gl.uniform1f(this.programs.dots.uniforms.u_maxSize, this.settings_.satShader.maxSizePlanetarium);
      gl.uniform1f(this.programs.dots.uniforms.u_starMinSize, this.settings_.satShader.minSizePlanetarium);
    } else {
      gl.uniform1f(this.programs.dots.uniforms.u_minSize, this.settings_.satShader.minSize);
      gl.uniform1f(this.programs.dots.uniforms.u_maxSize, this.settings_.satShader.maxSize);
      gl.uniform1f(this.programs.dots.uniforms.u_starMinSize, this.settings_.satShader.starMinSize);
    }

    // Set symbology enabled uniform
    const symbologyManager = ServiceLocator.getSymbologyManager();
    const symbologyEnabled = symbologyManager?.isEnabled ?? false;

    gl.uniform1i(this.programs.dots.uniforms.u_symbologyEnabled, symbologyEnabled ? 1 : 0);

    gl.bindVertexArray(this.programs.dots.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.enableVertexAttribArray(this.programs.dots.attribs.a_position.location);
    /*
     * Buffering data here reduces the need to bind the buffer twice!
     * Either allocate and assign the data to the buffer
     */
    if (!this.positionBufferOneTime_) {
      gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.DYNAMIC_DRAW);
      this.positionBufferOneTime_ = true;
    } else {
      // Or just update it if we have already allocated it - the length won't change
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positionData);
    }
    gl.vertexAttribPointer(this.programs.dots.attribs.a_position.location, 3, gl.FLOAT, false, 0, 0);

    // Update affiliation buffer if symbology is enabled
    if (symbologyEnabled && symbologyManager) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.affiliation);
      const affiliationData = symbologyManager.getAffiliationData();

      if (affiliationData.length > 0) {
        if (!this.affiliationBufferOneTime_) {
          gl.bufferData(gl.ARRAY_BUFFER, affiliationData, gl.DYNAMIC_DRAW);
          this.affiliationBufferOneTime_ = true;
        } else {
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, affiliationData);
        }
      }

      // Update object type buffer (static after catalog load)
      const objectTypeData = symbologyManager.getObjectTypeData();

      if (objectTypeData.length > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.objectType);
        if (!this.objectTypeBufferOneTime_) {
          gl.bufferData(gl.ARRAY_BUFFER, objectTypeData, gl.STATIC_DRAW);
          this.objectTypeBufferOneTime_ = true;
        }
      }

      // Bind sprite atlas texture if available
      if (this.symbologyTextureLoaded_ && this.symbologyTexture_) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.symbologyTexture_);
        gl.uniform1i(this.programs.dots.uniforms.u_symbologyAtlas, 0);
        gl.uniform1f(this.programs.dots.uniforms.u_iconMinSize, 16.0);
        gl.uniform1f(this.programs.dots.uniforms.u_iconFadeRange, 4.0);
      } else {
        // No atlas available - set iconMinSize to 0 to trigger SDF fallback
        gl.uniform1f(this.programs.dots.uniforms.u_iconMinSize, 0.0);
        gl.uniform1f(this.programs.dots.uniforms.u_iconFadeRange, 0.0);
      }
    }

    /*
     * DEBUG:
     * gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
     */
    gl.enable(gl.BLEND);
    gl.depthMask(false); // Disable depth writing

    // Should not be relying on sizeData -- but temporary
    gl.drawArrays(gl.POINTS, 0, settingsManager.dotsOnScreen);
    gl.bindVertexArray(null);

    gl.depthMask(true);
    gl.disable(gl.BLEND);

    // Draw GPU Picking Overlay -- This is what lets us pick a satellite
    this.drawGpuPickingFrameBuffer(projectionCameraMatrix, ServiceLocator.getMainCamera().state.mouseX, ServiceLocator.getMainCamera().state.mouseY);
  }

  /**
   * Draws the GPU picking frame buffer.
   * @param pMvCamMatrix - The projection, model view, and camera matrix.
   * @param mouseX - The x-coordinate of the mouse.
   * @param mouseY - The y-coordinate of the mouse.
   */
  drawGpuPickingFrameBuffer(pMvCamMatrix: mat4, mouseX: number, mouseY: number) {
    if (!this.isReady || !settingsManager.cruncherReady) {
      return;
    }
    const colorSchemeManagerInstance = ServiceLocator.getColorSchemeManager();

    if (!colorSchemeManagerInstance.colorBuffer) {
      return;
    }
    const gl = ServiceLocator.getRenderer().gl;

    gl.depthMask(true);

    gl.useProgram(this.programs.picking.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, ServiceLocator.getScene().frameBuffers.gpuPicking);

    gl.uniformMatrix4fv(this.programs.picking.uniforms.u_pMvCamMatrix, false, pMvCamMatrix);
    gl.uniform3fv(this.programs.picking.uniforms.worldOffset, Scene.getInstance().worldShift ?? [0, 0, 0]);

    const isFlatMapPick = ServiceLocator.getMainCamera().cameraType === CameraType.FLAT_MAP;

    gl.uniform1i(this.programs.picking.uniforms.u_flatMapMode, isFlatMapPick ? 1 : 0);
    if (isFlatMapPick) {
      gl.uniform1f(this.programs.picking.uniforms.u_gmst, ServiceLocator.getTimeManager().gmst);
      gl.uniform1f(this.programs.picking.uniforms.u_earthRadius, RADIUS_OF_EARTH);
      gl.uniform1f(this.programs.picking.uniforms.u_flatMapCenterX, ServiceLocator.getMainCamera().flatMapPanX);
      gl.uniform1f(this.programs.picking.uniforms.u_flatMapZoom, ServiceLocator.getMainCamera().flatMapZoom);
      gl.uniform1f(this.programs.picking.uniforms.logDepthBufFC, 0.0);
    } else {
      gl.uniform1f(this.programs.picking.uniforms.logDepthBufFC, DepthManager.getConfig().logDepthBufFC);
    }

    // no reason to render 100000s of pixels when we're only going to read one
    if (!settingsManager.isMobileModeEnabled) {
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(mouseX, gl.drawingBufferHeight - mouseY, this.PICKING_READ_PIXEL_BUFFER_SIZE, this.PICKING_READ_PIXEL_BUFFER_SIZE);
    }

    gl.bindVertexArray(this.programs.picking.vao);
    // Should not be relying on sizeData -- but temporary
    gl.drawArrays(gl.POINTS, 0, settingsManager.dotsOnScreen);
    gl.bindVertexArray(null);

    if (!settingsManager.isMobileModeEnabled) {
      gl.disable(gl.SCISSOR_TEST);
    }
  }

  /**
   * Returns the current position of the dot at the specified index.
   * @param i - The index of the dot.
   * @returns An object containing the x, y, and z coordinates of the dot's position.
   */
  getCurrentPosition(i: number) {
    return {
      x: <Kilometers>this.positionData[i * 3],
      y: <Kilometers>this.positionData[i * 3 + 1],
      z: <Kilometers>this.positionData[i * 3 + 2],
    };
  }

  getPositionArray(i: number): EciArr3 {
    return [this.positionData[i * 3], this.positionData[i * 3 + 1], this.positionData[i * 3 + 2]] as EciArr3;
  }

  /**
   * Returns the ID of the satellite closest to the given ECI coordinates.
   * @param eci - The ECI coordinates to search for.
   * @param maxDots - The maximum number of satellites to search through.
   * @returns The ID of the closest satellite, or null if no satellite is found within 100km.
   */
  getIdFromEci(eci: { x: number; y: number; z: number }, maxDots = this.positionData.length): number | null {
    const possibleMatches: { id: number; distance: number }[] = [];

    // loop through all the satellites
    for (let id = 0; id < maxDots; id++) {
      const x = this.positionData[id * 3];
      const y = this.positionData[id * 3 + 1];
      const z = this.positionData[id * 3 + 2];

      if (x > eci.x - 100 && x < eci.x + 100 && y > eci.y - 100 && y < eci.y + 100 && z > eci.z - 100 && z < eci.z + 100) {
        // if within 1km of the satellite, return it
        if (Math.sqrt((x - eci.x) ** 2 + (y - eci.y) ** 2 + (z - eci.z) ** 2) < 1) {
          return id;
        }

        // otherwise, add it to the list of possible matches
        possibleMatches.push({ id, distance: Math.sqrt((x - eci.x) ** 2 + (y - eci.y) ** 2 + (z - eci.z) ** 2) });
      }
    }

    // if there are possible matches, return the closest one
    if (possibleMatches.length > 0) {
      possibleMatches.sort((a, b) => a.distance - b.distance);

      return possibleMatches[0].id;
    }

    return null;
  }

  /**
   * Returns the inSunData array if it exists, otherwise returns an empty Int8Array.
   * @returns {Int8Array} The inSunData array or an empty Int8Array.
   */
  getSatInSun(): Int8Array {
    return this.inSunData ? this.inSunData : new Int8Array();
  }

  /**
   * Returns an Int8Array containing the satellites in view.
   * If there are no satellites in view, an empty Int8Array is returned.
   * @returns {Int8Array} An Int8Array containing the satellites in view.
   */
  getSatInView(): Int8Array {
    return this.inViewData ? this.inViewData : new Int8Array();
  }

  /**
   * Returns the velocity data if it exists, otherwise returns an empty Float32Array.
   * @returns {Float32Array} The velocity data or an empty Float32Array.
   */
  getSatVel(): Float32Array {
    return this.velocityData ? this.velocityData : new Float32Array();
  }

  /**
   * Initializes the dots manager with the given user settings.
   * @param settings - The user settings to use for initialization.
   */
  init(settings: SettingsManager) {
    const renderer = ServiceLocator.getRenderer();

    this.settings_ = settings;

    this.initShaders_();
    this.programs.dots.program = new WebGlProgramHelper(
      renderer.gl,
      this.shaders_.dots.vert,
      this.shaders_.dots.frag,
      this.programs.dots.attribs,
      this.programs.dots.uniforms,
    ).program;

    // Make buffers for satellite positions and size -- color and pickability are created in ColorScheme class
    this.buffers.position = renderer.gl.createBuffer();
    this.buffers.size = renderer.gl.createBuffer();

    this.initProgramPicking();

    EventBus.getInstance().on(EventBusEvent.update, this.update.bind(this));
    EventBus.getInstance().on(EventBusEvent.staticOffsetChange, this.interpolatePositionsOfOemSatellites.bind(this));
  }

  /**
   * Initializes the buffers required for rendering the dots and picking.
   * @param colorBuffer The color buffer to be shared between the color manager and the dots manager.
   */
  initBuffers(colorBuffer: WebGLBuffer) {
    const catalogManagerInstance = ServiceLocator.getCatalogManager();

    this.setupPickingBuffer(catalogManagerInstance.objectCache.length);
    this.updateSizeBuffer(catalogManagerInstance.objectCache.length);
    this.initColorBuffer(colorBuffer);
    this.initAffiliationBuffer();
    this.initObjectTypeBuffer();
    this.initVao(); // Needs ColorBuffer first

    // Load symbology texture asynchronously (non-blocking)
    this.loadSymbologyTexture();
  }

  /**
   * Initialize the affiliation buffer for symbology rendering
   */
  initAffiliationBuffer(): void {
    const gl = ServiceLocator.getRenderer().gl;

    this.buffers.affiliation = gl.createBuffer();
  }

  /**
   * Initialize the object type buffer for sprite atlas rendering
   */
  initObjectTypeBuffer(): void {
    const gl = ServiceLocator.getRenderer().gl;

    this.buffers.objectType = gl.createBuffer();
  }

  /**
   * Load the symbology sprite atlas texture.
   * This should be called after the WebGL context is available.
   */
  async loadSymbologyTexture(): Promise<void> {
    const gl = ServiceLocator.getRenderer().gl;

    try {
      this.symbologyTexture_ = await GlUtils.initTexture(
        gl,
        `${settingsManager.installDirectory}textures/symbology-atlas.png`,
      );
      this.symbologyTextureLoaded_ = true;
    } catch (e) {
      console.warn('Failed to load symbology atlas texture:', e);
      this.symbologyTextureLoaded_ = false;
    }
  }

  /**
   * Check if symbology texture is loaded and ready
   */
  get isSymbologyTextureLoaded(): boolean {
    return this.symbologyTextureLoaded_;
  }

  /**
   * We need to share the color buffer between the color manager and the dots manager
   * TODO: colorManager should be part of dots manager
   */
  initColorBuffer(colorBuffer: WebGLBuffer) {
    this.buffers.color = colorBuffer;
  }

  /**
   * Initializes the GPU Picking program.
   *
   * This function creates a program from the picking shaders, assigns attributes and uniforms,
   * creates a framebuffer, texture, and renderbuffer for picking, and initializes a pixel buffer.
   */
  initProgramPicking() {
    const gl = ServiceLocator.getRenderer().gl;

    this.programs.picking.program = new WebGlProgramHelper(gl, this.shaders_.picking.vert, this.shaders_.picking.frag).program;

    GlUtils.assignAttributes(this.programs.picking.attribs, gl, this.programs.picking.program, ['a_position', 'a_color', 'a_pickable']);
    GlUtils.assignUniforms(this.programs.picking.uniforms, gl, this.programs.picking.program, ['u_pMvCamMatrix', 'worldOffset', 'logDepthBufFC', 'u_flatMapMode', 'u_gmst', 'u_earthRadius', 'u_flatMapCenterX', 'u_flatMapZoom']);

    ServiceLocator.getScene().frameBuffers.gpuPicking = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, ServiceLocator.getScene().frameBuffers.gpuPicking);

    this.pickingTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.pickingTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // makes clearing work
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    this.pickingRenderBuffer = gl.createRenderbuffer(); // create RB to store the depth buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.pickingRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32F, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pickingTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.pickingRenderBuffer);

    this.pickReadPixelBuffer = new Uint8Array(4 * this.PICKING_READ_PIXEL_BUFFER_SIZE * this.PICKING_READ_PIXEL_BUFFER_SIZE);
  }

  /**
   * Initializes the vertex array objects for the dots and picking programs.
   */
  initVao(): void {
    const gl = ServiceLocator.getRenderer().gl;

    // Dots Program
    this.programs.dots.vao = gl.createVertexArray();
    gl.bindVertexArray(this.programs.dots.vao);

    const colorSchemeManagerInstance = ServiceLocator.getColorSchemeManager();

    gl.bindBuffer(gl.ARRAY_BUFFER, colorSchemeManagerInstance.colorBuffer);
    gl.enableVertexAttribArray(this.programs.dots.attribs.a_color.location);
    gl.vertexAttribPointer(this.programs.dots.attribs.a_color.location, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.size);
    gl.enableVertexAttribArray(this.programs.dots.attribs.a_size.location);
    gl.vertexAttribPointer(this.programs.dots.attribs.a_size.location, 1, gl.UNSIGNED_BYTE, false, 0, 0);

    // Affiliation buffer for symbology
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.affiliation);
    gl.enableVertexAttribArray(this.programs.dots.attribs.a_affiliation.location);
    gl.vertexAttribPointer(this.programs.dots.attribs.a_affiliation.location, 1, gl.UNSIGNED_BYTE, false, 0, 0);

    // Object type buffer for sprite atlas rendering
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.objectType);
    gl.enableVertexAttribArray(this.programs.dots.attribs.a_objectType.location);
    gl.vertexAttribPointer(this.programs.dots.attribs.a_objectType.location, 1, gl.UNSIGNED_BYTE, false, 0, 0);

    gl.bindVertexArray(null);

    // Picking Program
    this.programs.picking.vao = gl.createVertexArray();
    gl.bindVertexArray(this.programs.picking.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.enableVertexAttribArray(this.programs.picking.attribs.a_position.location);
    gl.vertexAttribPointer(this.programs.picking.attribs.a_position.location, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.pickingBuffers.color);
    gl.enableVertexAttribArray(this.programs.picking.attribs.a_color.location);
    gl.vertexAttribPointer(this.programs.picking.attribs.a_color.location, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorSchemeManagerInstance.pickableBuffer);
    gl.enableVertexAttribArray(this.programs.picking.attribs.a_pickable.location);
    gl.vertexAttribPointer(this.programs.picking.attribs.a_pickable.location, 1, gl.UNSIGNED_BYTE, false, 0, 0);

    gl.bindVertexArray(null);
  }

  /**
   * Resets the inSunData array to all zeros.
   */
  resetSatInSun(): void {
    if (!this.inSunData) {
      return;
    }

    this.inSunData = new Int8Array(this.inSunData.length);
    this.inSunData.fill(0);
  }

  /**
   * Resets the inViewData array to all zeroes.
   */
  resetSatInView(): void {
    if (!this.inViewData) {
      return;
    }

    this.inViewData = new Int8Array(this.inViewData.length);
    this.inViewData.fill(0);
  }

  /**
   * Sets up the picking buffer with colors assigned to ids in hex order.
   * @param satDataLen The length of the satellite data.
   */
  setupPickingBuffer(satDataLen = 1): void {
    // assign colors to ids in hex order
    let byteB: number, byteG: number, byteR: number; // reuse color variables

    for (let i = 0; i < satDataLen; i++) {
      byteR = (i + 1) & 0xff;
      byteG = ((i + 1) & 0xff00) >> 8;
      byteB = ((i + 1) & 0xff0000) >> 16;

      // Normalize colors to 1 and flatten them
      this.pickingColorData.push(byteR / 255.0);
      this.pickingColorData.push(byteG / 255.0);
      this.pickingColorData.push(byteB / 255.0);
    }

    const renderer = ServiceLocator.getRenderer();

    this.pickingBuffers.color = GlUtils.createArrayBuffer(renderer.gl, new Float32Array(this.pickingColorData));
  }

  /**
   * Updates the position, velocity, in-view and in-sun data buffers with the data received from the SatCruncher worker.
   * @param mData The data received from the SatCruncher worker.
   */
  updateCruncherBuffers(mData: SatCruncherMessageData) {
    if (typeof mData.gmst === 'number') {
      this.cruncherGmst = mData.gmst;
    }

    if (mData.satPos) {
      if (typeof this.positionData === 'undefined') {
        this.positionData = new Float32Array(mData.satPos);
        this.isReady = true;
      } else {
        this.positionData.set(mData.satPos, 0);
      }
    }

    if (mData.satVel) {
      if (typeof this.velocityData === 'undefined') {
        this.velocityData = new Float32Array(mData.satVel);
      } else {
        this.velocityData.set(mData.satVel, 0);
      }
    }

    if (mData.satInView?.length > 0) {
      if (typeof this.inViewData === 'undefined' || this.inViewData.length !== mData.satInView.length) {
        this.inViewData = new Int8Array(mData.satInView);
      } else {
        this.inViewData.set(mData.satInView, 0);
      }
    }

    if (mData.satInSun?.length > 0) {
      if (typeof this.inSunData === 'undefined' || this.inSunData.length !== mData.satInSun.length) {
        this.inSunData = new Int8Array(mData.satInSun);
      } else {
        this.inSunData.set(mData.satInSun, 0);
      }
    }
  }

  /**
   * Updates the position and velocity of a satellite object based on the data stored in the `positionData` and `velocityData` arrays.
   * @param object The satellite object to update.
   * @param i The index of the satellite in the `positionData` and `velocityData` arrays.
   */
  updatePosVel(object: BaseObject, i: number): void {
    if (!this.velocityData) {
      return;
    }

    /*
     * Fix for https://github.com/thkruz/keeptrack.space/issues/834
     * TODO: Remove this once we figure out why this is happening
     */

    // Type assertion: only SpaceObject and its subclasses have velocity and position
    const spaceObject = object as unknown as { velocity: TemeVec3<KilometersPerSecond>; position: TemeVec3 };

    spaceObject.velocity = { x: 0, y: 0, z: 0 } as TemeVec3<KilometersPerSecond>;

    const isChanged = spaceObject.velocity.x !== this.velocityData[i * 3] || spaceObject.velocity.y !== this.velocityData[i * 3 + 1] || spaceObject.velocity.z !== this.velocityData[i * 3 + 2];

    spaceObject.velocity.x = (this.velocityData[i * 3] as KilometersPerSecond) || (0 as KilometersPerSecond);
    spaceObject.velocity.y = (this.velocityData[i * 3 + 1] as KilometersPerSecond) || (0 as KilometersPerSecond);
    spaceObject.velocity.z = (this.velocityData[i * 3 + 2] as KilometersPerSecond) || (0 as KilometersPerSecond);

    // Missiles have their own mutable totalVelocity that needs smoothing
    // Other SpaceObjects use a computed getter that auto-calculates from velocity
    if (object.type === SpaceObjectType.BALLISTIC_MISSILE) {
      const missile = object as MissileObject;
      const newVel = Math.sqrt(missile.velocity.x ** 2 + missile.velocity.y ** 2 + missile.velocity.z ** 2);

      if (missile.totalVelocity === 0) {
        missile.totalVelocity = newVel;
      } else if (isChanged) {
        missile.totalVelocity = missile.totalVelocity * 0.9 + newVel * 0.1;
      }
    }

    spaceObject.position = {
      x: <Kilometers>this.positionData[i * 3],
      y: <Kilometers>this.positionData[i * 3 + 1],
      z: <Kilometers>this.positionData[i * 3 + 2],
    };
  }

  /**
   * Updates the position buffer for the dots manager. This method interpolates the position of the satellites
   * based on their velocity and updates the position buffer accordingly. It also updates the position of active missiles.
   */
  update(): void {
    // Don't update positions until positionCruncher finishes its first loop and creates data in position and velocity data arrays
    if (!this.positionData || !this.velocityData) {
      return;
    }

    const renderer = ServiceLocator.getRenderer();
    const simTime = ServiceLocator.getTimeManager().simulationTimeObj.getTime();

    // TODO: Decouple OEM logic from TLE logic

    if (!settingsManager.lowPerf && (renderer.dtAdjusted > settingsManager.minimumDrawDt || Math.abs(this.lastUpdateSimTime - simTime) > 1000)) {
      if (Number(PluginRegistry.getPlugin(SelectSatManager)?.selectedSat ?? -1) > -1) {
        const obj = ServiceLocator.getCatalogManager().objectCache[PluginRegistry.getPlugin(SelectSatManager)!.selectedSat] as Satellite | MissileObject;

        if (obj instanceof Satellite) {
          const sat = obj as Satellite;
          const now = ServiceLocator.getTimeManager().simulationTimeObj;
          const pv = sat.eci(now);

          if (!pv) {
            return;
          }
          this.positionData[Number(sat.id) * 3] = pv.position.x;
          this.positionData[Number(sat.id) * 3 + 1] = pv.position.y;
          this.positionData[Number(sat.id) * 3 + 2] = pv.position.z;
          this.velocityData[Number(sat.id) * 3] = pv.velocity.x;
          this.velocityData[Number(sat.id) * 3 + 1] = pv.velocity.y;
          this.velocityData[Number(sat.id) * 3 + 2] = pv.velocity.z;
        } else if (obj instanceof OemSatellite) {
          const sat = obj as OemSatellite;
          const now = ServiceLocator.getTimeManager().simulationTimeObj.getTime() / 1000 as Seconds;
          // WARN: Necessary for orbit history
          const pv = sat.updatePosAndVel(now);

          if (!pv) {
            return;
          }
          this.positionData[Number(sat.id) * 3] = pv[0];
          this.positionData[Number(sat.id) * 3 + 1] = pv[1];
          this.positionData[Number(sat.id) * 3 + 2] = pv[2];
          this.velocityData[Number(sat.id) * 3] = pv[3];
          this.velocityData[Number(sat.id) * 3 + 1] = pv[4];
          this.velocityData[Number(sat.id) * 3 + 2] = pv[5];
        }
      }

      if (settingsManager.centerBody === SolarBody.Earth || settingsManager.centerBody === SolarBody.Moon) {
        this.interpolatePositionsOfTleSatellites_(renderer);
      }
    }

    this.interpolatePositionsOfOemSatellites();

    this.lastUpdateSimTime = simTime;
  }

  getSize(i: number): number {
    // Check if the index is part of lastSearchResults
    if (settingsManager.lastSearchResults.includes(i)) {
      return 1.0; // Return size for search results
    }

    // Stars use distance-based sizing (size 0) — at 3e10 km they naturally get u_minSize

    // If a planet and we aren't centered on Earth or Moon
    if ((i >= this.planetDot1 && i <= this.planetDot2) &&
      // TODO: This is hacky. We need better logic for determining when to show planet dots
      (settingsManager.maxZoomDistance > (2e6 as Kilometers) || (settingsManager.centerBody !== SolarBody.Earth && settingsManager.centerBody !== SolarBody.Moon))) {
      return 1.0; // Return size for planets
    }

    // Check if the index is the selected satellite
    const selectedSat = PluginRegistry.getPlugin(SelectSatManager)?.selectedSat ?? -1;

    if (i === selectedSat) {
      return 1.0; // Return size for selected satellite
    }

    // Default size for other satellites
    return 0.0;
  }

  /**
   * Updates the size buffer used for rendering the dots.
   * @param bufferLen The length of the buffer.
   */
  updateSizeBuffer(bufferLen: number = 3) {
    const gl = ServiceLocator.getRenderer().gl;

    if (!this.isSizeBufferOneTime_) {
      this.sizeData = new Int8Array(bufferLen);
    }

    // Reset everything to 0 (distance-based sizing).
    // Stars stay at 0 — at 3e10 km they naturally get u_minSize in the shader.
    for (let i = 0; i < bufferLen; i++) {
      this.sizeData[i] = 0.0;
    }

    const selectedSat = PluginRegistry.getPlugin(SelectSatManager)?.selectedSat ?? -1;

    if (Number(selectedSat) > -1) {
      this.sizeData[Number(selectedSat)] = 1.0;
    }

    /*
     * Pretend Satellites that are currently being searched are stars
     * The shaders will display these "stars" like close satellites
     * because the distance from the center of the earth is too close to
     * be a star. dotsManager method is so there are less buffers needed but as
     * computers get faster it should be replaced
     */
    for (const lastSearchResult of settingsManager.lastSearchResults) {
      this.sizeData[lastSearchResult] = 1.0;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.size);
    if (!this.isSizeBufferOneTime_) {
      gl.bufferData(gl.ARRAY_BUFFER, this.sizeData, gl.DYNAMIC_DRAW);
      this.isSizeBufferOneTime_ = true;
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.sizeData);
    }
  }

  /**
   * Initializes the shaders used by the dots manager.
   */
  // eslint-disable-next-line max-lines-per-function
  private initShaders_() {
    this.shaders_ = {
      dots: {
        frag: glsl`#version 300 es
            #extension GL_EXT_frag_depth : enable
            precision highp float;

            uniform float logDepthBufFC;
            uniform bool u_symbologyEnabled;
            uniform sampler2D u_symbologyAtlas;
            uniform float u_iconMinSize;
            uniform float u_iconFadeRange;

            in vec4 vColor;
            in float vSize;
            in float vDist;
            in float vAffiliation;
            in float vObjectType;
            in float vPointSize;

            out vec4 fragColor;

            float when_lt(float x, float y) {
              return max(sign(y - x), 0.0);
            }
            float when_ge(float x, float y) {
              return 1.0 - when_lt(x, y);
            }

            // SDF for circle (Friend shape)
            float sdCircle(vec2 p, float r) {
              return length(p) - r;
            }

            // SDF for diamond (Hostile shape)
            float sdDiamond(vec2 p, float size) {
              return (abs(p.x) + abs(p.y)) - size;
            }

            // SDF for square (Neutral shape)
            float sdSquare(vec2 p, float size) {
              vec2 d = abs(p) - vec2(size);
              return max(d.x, d.y);
            }

            // SDF for quatrefoil - four overlapping circles (Unknown shape)
            float sdQuatrefoil(vec2 p, float size) {
              float r = size * 0.55;
              float d = size * 0.35;
              float d1 = length(p - vec2(d, 0.0)) - r;
              float d2 = length(p - vec2(-d, 0.0)) - r;
              float d3 = length(p - vec2(0.0, d)) - r;
              float d4 = length(p - vec2(0.0, -d)) - r;
              return min(min(d1, d2), min(d3, d4));
            }

            // Get shape SDF based on affiliation
            float getShapeSDF(vec2 p, float affiliation) {
              float size = 0.95;

              if (affiliation < 0.5) {
                // FRIEND (0) - Circle
                return sdCircle(p, size * 0.7);
              } else if (affiliation < 1.5) {
                // HOSTILE (1) - Diamond
                return sdDiamond(p, size * 0.7);
              } else if (affiliation < 2.5) {
                // NEUTRAL (2) - Square
                return sdSquare(p, size * 0.55);
              } else {
                // UNKNOWN (3) - Quatrefoil
                return sdQuatrefoil(p, size);
              }
            }

            // Get color based on affiliation (MIL-STD-2525 inspired)
            vec3 getAffiliationColor(float affiliation) {
              if (affiliation < 0.5) {
                // FRIEND - Cyan
                return vec3(0.0, 0.784, 1.0);
              } else if (affiliation < 1.5) {
                // HOSTILE - Red
                return vec3(1.0, 0.196, 0.196);
              } else if (affiliation < 2.5) {
                // NEUTRAL - Green
                return vec3(0.0, 0.902, 0.302);
              } else {
                // UNKNOWN - Yellow
                return vec3(1.0, 1.0, 0.0);
              }
            }

            // Sample from sprite atlas (8x8 grid, 16 icons per affiliation)
            vec4 sampleSpriteAtlas(vec2 uv, float affiliation, float objectType) {
              float atlasIndex = affiliation * 16.0 + objectType;
              float col = mod(atlasIndex, 8.0);
              float row = floor(atlasIndex / 8.0);
              vec2 cellUV = (uv + vec2(col, row)) / 8.0;
              return texture(u_symbologyAtlas, cellUV);
            }

            // Render simple colored dot (fallback)
            vec4 renderSimpleDot(vec2 ptCoord) {
              float r = (${settingsManager.satShader.blurFactor1} - min(abs(length(ptCoord)), 1.0));
              float alpha = (2.0 * r + ${settingsManager.satShader.blurFactor2});
              alpha = min(alpha, 1.0);
              if (alpha < 0.01) return vec4(0.0);
              return vec4(vColor.rgb, vColor.a * alpha);
            }

            // Render SDF shape (intermediate fallback when no atlas)
            vec4 renderSdfShape(vec2 ptCoord) {
              float sdf = getShapeSDF(ptCoord, vAffiliation);
              float strokeWidth = 0.12;
              float alpha = 1.0 - smoothstep(0.0, 0.06, abs(sdf) - strokeWidth);
              if (alpha < 0.01) return vec4(0.0);
              vec3 color = getAffiliationColor(vAffiliation);
              return vec4(color, vColor.a * alpha);
            }

            void main(void) {
              vec2 ptCoord = gl_PointCoord * 2.0 - vec2(1.0, 1.0);
              vec2 uv = gl_PointCoord;

              vec4 finalColor;

              if (u_symbologyEnabled) {
                // Check if sprite atlas is available and point is large enough
                if (u_iconMinSize > 0.0 && vPointSize >= u_iconMinSize) {
                  // Full sprite atlas rendering
                  vec4 texColor = sampleSpriteAtlas(uv, vAffiliation, vObjectType);
                  if (texColor.a < 0.1) discard;
                  finalColor = texColor;
                } else if (u_iconMinSize > 0.0 && vPointSize >= (u_iconMinSize - u_iconFadeRange)) {
                  // Blend zone: crossfade between sprite and SDF
                  float blendFactor = (vPointSize - (u_iconMinSize - u_iconFadeRange)) / u_iconFadeRange;
                  vec4 iconColor = sampleSpriteAtlas(uv, vAffiliation, vObjectType);
                  vec4 sdfColor = renderSdfShape(ptCoord);
                  finalColor = mix(sdfColor, iconColor, blendFactor);
                  if (finalColor.a < 0.01) discard;
                } else {
                  // SDF shape fallback (no atlas or too small)
                  finalColor = renderSdfShape(ptCoord);
                  if (finalColor.a < 0.01) discard;
                }
              } else {
                // Original circular dot rendering
                finalColor = renderSimpleDot(ptCoord);
                if (finalColor.a < 0.01) discard;
              }

              fragColor = finalColor;

              ${DepthManager.getLogDepthFragCode()}
            }
          `,
        vert: glsl`#version 300 es
          precision highp float;
          in vec3 a_position;
          in vec4 a_color;
          in float a_size;
          in float a_affiliation;
          in float a_objectType;

          uniform float u_minSize;
          uniform float u_maxSize;
          uniform float u_starMinSize;
          uniform vec3 worldOffset;
          uniform mat4 u_pMvCamMatrix;
          uniform float logDepthBufFC;
          uniform bool u_symbologyEnabled;
          uniform bool u_flatMapMode;
          uniform float u_gmst;
          uniform float u_earthRadius;
          uniform float u_flatMapCenterX;
          uniform float u_flatMapZoom;

          out vec4 vColor;
          out float vSize;
          out float vDist;
          out float vAffiliation;
          out float vObjectType;
          out float vPointSize;

          float when_lt(float x, float y) {
              return max(sign(y - x), 0.0);
          }
          float when_ge(float x, float y) {
              return 1.0 - when_lt(x, y);
          }

          void main(void) {
              vec3 eciPos = a_position + worldOffset;
              vec4 position;

              if (u_flatMapMode) {
                  float PI = 3.14159265359;
                  float eciDist = length(eciPos);

                  // Filter out stars and distant objects
                  if (eciDist > 1.0e7) {
                      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
                      gl_PointSize = 0.0;
                      vColor = vec4(0.0);
                      vSize = 0.0;
                      vDist = eciDist;
                      vAffiliation = a_affiliation;
                      vObjectType = a_objectType;
                      vPointSize = 0.0;
                      return;
                  }

                  float lon = atan(eciPos.y, eciPos.x) - u_gmst;
                  lon = mod(lon + PI, 2.0 * PI) - PI;
                  float lat = atan(eciPos.z, length(eciPos.xy));
                  float alt = eciDist - u_earthRadius;
                  vec3 flatPos = vec3(lon * u_earthRadius, lat * u_earthRadius, alt * 0.001);

                  // Wrap X to nearest copy of camera center for seamless scrolling
                  float mapW = 2.0 * PI * u_earthRadius;
                  flatPos.x = u_flatMapCenterX + mod(flatPos.x - u_flatMapCenterX + mapW * 0.5, mapW) - mapW * 0.5;

                  position = u_pMvCamMatrix * vec4(flatPos, 1.0);
              } else {
                  position = u_pMvCamMatrix * vec4(eciPos, 1.0);
              }

              gl_Position = position;

              ${DepthManager.getLogDepthVertCode()}

              float dist = distance(vec3(0.0, 0.0, 0.0), a_position.xyz);

              if (u_flatMapMode) {
                // Scale dot size with zoom so dots remain visible when zoomed in
                float zoomScale = sqrt(u_flatMapZoom);
                float flatSize = mix(u_minSize, float(${settingsManager.satShader.starSize}), step(0.5, a_size));
                float symbologyScale = u_symbologyEnabled ? 2.0 : 1.0;
                gl_PointSize = flatSize * zoomScale * symbologyScale;
                vPointSize = gl_PointSize;
                vColor = a_color;
                vSize = a_size * 1.0;
                vDist = dist;
                vAffiliation = a_affiliation;
                vObjectType = a_objectType;
                return;
              }

              float drawSize = 0.0;
              float baseSize = pow(${settingsManager.satShader.distanceBeforeGrow} \/ position.z, 2.1);

              // Use star min size for objects beyond 1e8 km (stars), regular min size for satellites
              float effectiveMinSize = mix(u_minSize, u_starMinSize, step(1.0e8, dist));

              // Satellite / Star
              drawSize +=
              when_lt(a_size, 0.5) *
              (min(max(baseSize, effectiveMinSize), u_maxSize) * 1.0);

              // Something on the ground
              drawSize +=
              when_lt(a_size, 0.5) * when_lt(dist, 6421.0) *
              (min(max(baseSize, u_minSize * 0.5), u_maxSize) * 1.0);

              // Searched Object
              drawSize += when_ge(a_size, 0.5) * ${settingsManager.satShader.starSize};

              // Increase size when symbology is enabled for better visibility of outline shapes
              float symbologyScale = u_symbologyEnabled ? 2.0 : 1.0;
              gl_PointSize = drawSize * symbologyScale;
              vPointSize = gl_PointSize;
              vColor = a_color;
              vSize = a_size * 1.0;
              vDist = dist;
              vAffiliation = a_affiliation;
              vObjectType = a_objectType;
          }
        `,
      },
      picking: {
        vert: `#version 300 es
                precision mediump float;
                in vec3 a_position;
                in vec3 a_color;
                in float a_pickable;

                uniform mat4 u_pMvCamMatrix;
                uniform vec3 worldOffset;
                uniform float logDepthBufFC;
                uniform bool u_flatMapMode;
                uniform float u_gmst;
                uniform float u_earthRadius;
                uniform float u_flatMapCenterX;
                uniform float u_flatMapZoom;

                out vec3 vColor;

                void main(void) {
                vec3 eciPos = a_position + worldOffset;
                vec4 position;

                if (u_flatMapMode) {
                    float PI = 3.14159265359;
                    float eciDist = length(eciPos);
                    if (eciDist > 1.0e7) {
                        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
                        gl_PointSize = 0.0;
                        vColor = vec3(0.0);
                        return;
                    }
                    float lon = atan(eciPos.y, eciPos.x) - u_gmst;
                    lon = mod(lon + PI, 2.0 * PI) - PI;
                    float lat = atan(eciPos.z, length(eciPos.xy));
                    float alt = eciDist - u_earthRadius;
                    vec3 flatPos = vec3(lon * u_earthRadius, lat * u_earthRadius, alt * 0.001);

                    // Wrap X to nearest copy of camera center for seamless scrolling
                    float mapW = 2.0 * PI * u_earthRadius;
                    flatPos.x = u_flatMapCenterX + mod(flatPos.x - u_flatMapCenterX + mapW * 0.5, mapW) - mapW * 0.5;

                    position = u_pMvCamMatrix * vec4(flatPos, 1.0);
                } else {
                    position = u_pMvCamMatrix * vec4(eciPos, 1.0);
                }

                gl_Position = position;
                ${DepthManager.getLogDepthVertCode()}
                float pickZoomScale = u_flatMapMode ? sqrt(u_flatMapZoom) : 1.0;
                gl_PointSize = ${settingsManager.pickingDotSize} * a_pickable * pickZoomScale;
                vColor = a_color * a_pickable;
                }
            `,
        frag: `#version 300 es
                #extension GL_EXT_frag_depth : enable
                precision mediump float;

                in vec3 vColor;

                uniform float logDepthBufFC;

                out vec4 fragColor;

                void main(void) {
                    fragColor = vec4(vColor, 1.0);
                    ${DepthManager.getLogDepthFragCode()}
                }
            `,
      },
    };
  }

  /**
   * Updates the velocities of the dots based on the renderer's time delta and the current position data.
   * @param renderer - The WebGL renderer used to calculate the time delta.
   */
  private interpolatePositionsOfTleSatellites_(renderer: WebGLRenderer) {
    const catalogManagerInstance = ServiceLocator.getCatalogManager();
    const orbitalSats3 = catalogManagerInstance.orbitalSats * 3;

    for (let i = 0; i < orbitalSats3; i++) {
      this.positionData[i] += this.velocityData[i] * renderer.dtAdjusted;
    }
  }

  interpolatePositionsOfOemSatellites() {
    const catalogManagerInstance = ServiceLocator.getCatalogManager();
    const simTime = (ServiceLocator.getTimeManager().simulationTimeObj.getTime() / 1000) as Seconds;

    for (let i = 0; i < settingsManager.maxOemSatellites; i++) {
      const oemSat = catalogManagerInstance.objectCache[catalogManagerInstance.numSatellites + i];

      if (!oemSat || !(oemSat instanceof OemSatellite)) {
        continue;
      }

      const pv = oemSat.updatePosAndVel(simTime);

      if (!pv) {
        continue;
      }

      this.positionData[Number(oemSat.id) * 3] = pv[0];
      this.positionData[Number(oemSat.id) * 3 + 1] = pv[1];
      this.positionData[Number(oemSat.id) * 3 + 2] = pv[2];
      this.velocityData[Number(oemSat.id) * 3] = pv[3];
      this.velocityData[Number(oemSat.id) * 3 + 1] = pv[4];
      this.velocityData[Number(oemSat.id) * 3 + 2] = pv[5];
    }
  }
}
