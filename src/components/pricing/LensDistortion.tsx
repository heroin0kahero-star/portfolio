/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PointerSquareLensDistortion — a full-screen shader background for the
 * Pricing section. A grayscale image covers the screen. A colour image shows
 * only inside a square that follows the pointer. The colour inside gets a
 * CC-lens bulge and a radial RGB shift. The grey outside gets a wave and grain.
 *
 * Based on:
 *   Codrops tutorial: https://tympanus.net/codrops/2026/08/25/building-a-mouse-following-square-lens-effect-with-three-js-and-glsl/
 *   MIT repo: https://github.com/tomoyukinakata/mouse-following-square-lens-effect
 *   (MIT license notice retained)
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface LensDistortionProps {
  /** Inside texture (colour image) */
  insideSrc: string;
  /** Outside texture (grayscale image) */
  outsideSrc: string;
  /** Square half-side in -1..1 units. Default 0.4. */
  squareSize?: number;
  /** Lens distortion amount. Default 1.5. */
  lensDistortion?: number;
  /** RGB shift red channel. Default 0.01. */
  rgbShiftR?: number;
  /** RGB shift green channel. Default 0. */
  rgbShiftG?: number;
  /** RGB shift blue channel. Default -0.01. */
  rgbShiftB?: number;
  /** Wave frequency. Default 10. */
  waveFrequency?: number;
  /** Wave strength. Default 0.01. */
  waveStrength?: number;
  /** Wave speed. Default 1. */
  waveSpeed?: number;
  /** Random frequency. Default 1. */
  randomFrequency?: number;
  /** Random strength. Default 0.02. */
  randomStrength?: number;
  /** Random speed. Default 0.2. */
  randomSpeed?: number;
  /** Pointer ease factor. Default 0.1. */
  pointerEase?: number;
  /** Whether to desaturate the outside image in the shader. Default true. */
  desaturateOutside?: boolean;
}

const vertexShader = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform sampler2D u_texture1;   // inside: colour
  uniform sampler2D u_texture2;   // outside: grayscale
  uniform vec2 u_meshSize;        // canvas size in CSS px
  uniform vec2 u_textureSize1;
  uniform vec2 u_textureSize2;
  uniform vec2 u_mouse;           // -1..1, eased in JS
  uniform float u_time;
  uniform float u_squareSize;     // half side, in -1..1 units
  uniform float u_lensDistortion;
  uniform float u_rgbShiftR;
  uniform float u_rgbShiftG;
  uniform float u_rgbShiftB;
  uniform float u_waveFrequency;
  uniform float u_waveSpeed;
  uniform float u_waveStrength;
  uniform float u_randomFrequency;
  uniform float u_randomSpeed;
  uniform float u_randomStrength;
  uniform float u_desaturateOutside;

  varying vec2 v_uv;

  vec2 getCoverUv(vec2 uv, vec2 meshSize, vec2 textureSize) {
    vec2 meshRatio = vec2(meshSize.x / meshSize.y, meshSize.y / meshSize.x);
    vec2 textureRatio = vec2(textureSize.x / textureSize.y, textureSize.y / textureSize.x);
    vec2 resolutionRatio = vec2(
      min(meshRatio.x / textureRatio.x, 1.0),
      min(meshRatio.y / textureRatio.y, 1.0)
    );
    return (uv - 0.5) * resolutionRatio + 0.5;
  }

  float getCCLensScale(float distortion, float radius2) {
    if (distortion >= 0.0) {
      return 1.0 + distortion * radius2;
    }
    return 1.0 / (1.0 - distortion * radius2);
  }

  vec2 getCCLensUv(vec2 uv, vec2 resolution, float distortion) {
    vec2 centeredUv = uv - 0.5;
    vec2 aspectScale = vec2(resolution.x / resolution.y, 1.0);
    vec2 centeredPosition = centeredUv * aspectScale;
    float radius2 = dot(centeredPosition, centeredPosition);
    float lensScale = getCCLensScale(distortion, radius2);
    vec2 distortedPosition = centeredPosition * lensScale;
    vec2 distortedCenteredUv = distortedPosition / aspectScale;
    vec2 distortedUv = distortedCenteredUv + 0.5;
    vec2 distortionOffset = distortedUv - uv;
    return uv - distortionOffset;
  }

  // Nikita Miropolskiy, Shadertoy XsX3zB
  vec3 random3(vec3 c) {
    float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0 * j);
    j *= 0.125;
    r.x = fract(512.0 * j);
    j *= 0.125;
    r.y = fract(512.0 * j);
    return r - 0.5;
  }

  void main() {
    // 1. Square coordinates: centred, in -1..1, aspect-corrected, then moved by the pointer
    vec2 uvSquare = v_uv * 2.0 - 1.0;
    vec2 squareAspectScale = vec2(
      min(u_meshSize.y / u_meshSize.x, 1.0),
      min(u_meshSize.x / u_meshSize.y, 1.0)
    );
    uvSquare /= squareAspectScale;
    uvSquare -= u_mouse;

    // 2. Square mask
    float h = u_squareSize;
    float squareMask =
      step(-h, uvSquare.x) * (1.0 - step(h, uvSquare.x)) *
      step(-h, uvSquare.y) * (1.0 - step(h, uvSquare.y));

    // 3. CC lens, computed in local square UV
    vec2 squareUv = uvSquare / (h * 2.0) + 0.5;
    vec2 distortedSquareUv = getCCLensUv(squareUv, vec2(1.0), u_lensDistortion);
    vec2 squareLensOffset = distortedSquareUv - squareUv;
    vec2 viewportLensOffset = squareLensOffset * h * squareAspectScale;
    vec2 lensTexture1Uv = getCoverUv(v_uv + viewportLensOffset, u_meshSize, u_textureSize1);

    // 4. Radial RGB shift, centred on the square
    vec2 rgbShiftDirection = (squareUv - 0.5) * 2.0;
    float r = texture2D(u_texture1, lensTexture1Uv + rgbShiftDirection * u_rgbShiftR).r;
    float g = texture2D(u_texture1, lensTexture1Uv + rgbShiftDirection * u_rgbShiftG).g;
    float b = texture2D(u_texture1, lensTexture1Uv + rgbShiftDirection * u_rgbShiftB).b;
    vec4 insideColor = vec4(r, g, b, 1.0);

    // 5. Outside: wave and grain, full screen
    vec2 texture2Uv = getCoverUv(v_uv, u_meshSize, u_textureSize2);
    texture2Uv.y += sin(texture2Uv.y * u_waveFrequency + u_time * u_waveSpeed) * u_waveStrength;
    texture2Uv += random3(vec3(texture2Uv * u_randomFrequency, u_time * u_randomSpeed)).x * u_randomStrength;
    vec4 outsideColor = texture2D(u_texture2, texture2Uv);

    // Optional desaturation
    if (u_desaturateOutside > 0.5) {
      float l = dot(outsideColor.rgb, vec3(0.299, 0.587, 0.114));
      outsideColor = vec4(vec3(l), 1.0);
    }

    // 6. Composite
    gl_FragColor = mix(outsideColor, insideColor, squareMask);
  }
`;

export function LensDistortion({
  insideSrc,
  outsideSrc,
  squareSize = 0.4,
  lensDistortion = 1.5,
  rgbShiftR = 0.01,
  rgbShiftG = 0,
  rgbShiftB = -0.01,
  waveFrequency = 10,
  waveStrength = 0.01,
  waveSpeed = 1,
  randomFrequency = 1,
  randomStrength = 0.02,
  randomSpeed = 0.2,
  pointerEase = 0.1,
  desaturateOutside = true,
}: LensDistortionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    running: false,
    renderer: null as THREE.WebGLRenderer | null,
    scene: null as THREE.Scene | null,
    camera: null as THREE.OrthographicCamera | null,
    mesh: null as THREE.Mesh | null,
    mouse: new THREE.Vector2(0, 0),
    mouseEase: new THREE.Vector2(0, 0),
    pendingMouse: new THREE.Vector2(0, 0),
    hasPointer: false,
    visible: false,
    reduceMotion: false,
    observer: null as IntersectionObserver | null,
    animId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");

    state.reduceMotion = reducedMotionQuery.matches;

    let cancelled = false;
    let texturesReady = false;
    let readyTextures = 0;
    let requiredTextures = 2;

    const getSize = () => {
      const rect = canvas.getBoundingClientRect();
      const fallbackWidth = window.innerWidth || 1;
      const fallbackHeight = window.innerHeight || 1;

      return {
        width: Math.max(1, Math.round(rect.width || fallbackWidth)),
        height: Math.max(1, Math.round(rect.height || fallbackHeight)),
      };
    };

    // Camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    state.camera = camera;

    // Scene
    const scene = new THREE.Scene();
    state.scene = scene;

    // Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    const initialSize = getSize();
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(initialSize.width, initialSize.height, false);
      try {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      } catch {}
      state.renderer = renderer;
    } catch {
      return;
    }

    // Textures. When the same source is used for both sides we only decode it
    // once, which keeps the pinned section light.
    const sharedTexture = insideSrc === outsideSrc;
    requiredTextures = sharedTexture ? 1 : 2;

    const insideSize = new THREE.Vector2(1, 1);
    const outsideSize = new THREE.Vector2(1, 1);

    const syncTextureSize = (
      texture: THREE.Texture,
      target: THREE.Vector2,
    ) => {
      const image = texture.image as
        | { width?: number; height?: number }
        | null
        | undefined;
      if (!image?.width || !image?.height) return;
      target.set(image.width, image.height);
    };

    const loader = new THREE.TextureLoader();

    const markTextureReady = () => {
      if (cancelled) return;
      readyTextures += 1;
      if (readyTextures < requiredTextures) return;

      texturesReady = true;
      if (state.visible) startLoop();
    };

    const insideTexture = loader.load(
      insideSrc,
      (texture) => {
        if (cancelled) return;
        syncTextureSize(texture, insideSize);
        if (sharedTexture) syncTextureSize(texture, outsideSize);
        markTextureReady();
      },
      undefined,
      () => undefined,
    );

    const outsideTexture = sharedTexture
      ? insideTexture
      : loader.load(
          outsideSrc,
          (texture) => {
            if (cancelled) return;
            syncTextureSize(texture, outsideSize);
            markTextureReady();
          },
          undefined,
          () => undefined,
        );

    insideTexture.colorSpace = THREE.SRGBColorSpace;
    outsideTexture.colorSpace = THREE.SRGBColorSpace;

    // Uniforms
    const uniforms: Record<string, THREE.IUniform> = {
      u_texture1: { value: insideTexture },
      u_texture2: { value: outsideTexture },
      u_meshSize: { value: new THREE.Vector2(initialSize.width, initialSize.height) },
      u_textureSize1: { value: insideSize },
      u_textureSize2: { value: outsideSize },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_time: { value: 0 },
      u_squareSize: { value: squareSize },
      u_lensDistortion: { value: lensDistortion },
      u_rgbShiftR: { value: rgbShiftR },
      u_rgbShiftG: { value: rgbShiftG },
      u_rgbShiftB: { value: rgbShiftB },
      u_waveFrequency: { value: waveFrequency },
      u_waveSpeed: { value: waveSpeed },
      u_waveStrength: { value: waveStrength },
      u_randomFrequency: { value: randomFrequency },
      u_randomSpeed: { value: randomSpeed },
      u_randomStrength: { value: randomStrength },
      u_desaturateOutside: { value: desaturateOutside ? 1.0 : 0.0 },
    };

    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    state.mesh = mesh;

    // Pointer input only stores the latest position. The render loop applies it
    // once per animation frame, so pointer events cannot outrun the GPU.
    const onPointerMove = (event: PointerEvent) => {
      if (!state.running || state.reduceMotion) return;

      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      state.pendingMouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      state.hasPointer = true;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const resize = () => {
      if (!renderer || cancelled) return;

      const { width, height } = getSize();
      try {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
      } catch {
        return;
      }
      uniforms.u_meshSize.value.set(width, height);

      // Reduced-motion mode renders one static frame; resize that frame too.
      if (state.reduceMotion && state.visible) startLoop();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", resize);

    const onReducedMotionChange = () => {
      state.reduceMotion = reducedMotionQuery.matches;
      if (state.reduceMotion) {
        stopLoop();
        if (state.visible) startLoop();
      } else if (state.visible) {
        startLoop();
      }
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    const tick = () => {
      if (cancelled || !state.running) return;
      if (!renderer || !scene || !camera) return;

      const time = state.reduceMotion ? 0 : performance.now() * 0.001;

      if (state.reduceMotion) {
        state.mouse.set(0, 0);
        state.mouseEase.set(0, 0);
      } else {
        if (coarsePointerQuery.matches && !state.hasPointer) {
          state.mouse.set(
            0.35 * Math.sin(time * 0.3),
            0.25 * Math.cos(time * 0.4),
          );
        } else if (state.hasPointer) {
          state.mouse.copy(state.pendingMouse);
        }

        state.mouseEase.lerp(state.mouse, pointerEase);
      }

      uniforms.u_mouse.value.copy(state.mouseEase);
      uniforms.u_time.value = time;

      try {
        renderer.render(scene, camera);
      } catch {
        state.running = false;
        state.animId = 0;
        return;
      }

      if (!cancelled && state.running && !state.reduceMotion) {
        state.animId = requestAnimationFrame(tick);
      } else {
        state.running = false;
        state.animId = 0;
      }
    };

    const startLoop = () => {
      if (cancelled || state.running || !texturesReady || !state.visible) return;
      state.running = true;
      state.animId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      state.running = false;
      cancelAnimationFrame(state.animId);
      state.animId = 0;
    };

    // Pause the whole loop while the section is off-screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        state.visible = visible;

        if (visible) startLoop();
        else stopLoop();
      },
      { rootMargin: "10% 0px" },
    );
    observer.observe(canvas);
    state.observer = observer;

    resize();

    return () => {
      cancelled = true;
      stopLoop();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      resizeObserver.disconnect();
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      insideTexture.dispose();
      if (outsideTexture !== insideTexture) outsideTexture.dispose();
      renderer.dispose();
      state.renderer = null;
      state.scene = null;
      state.camera = null;
      state.mesh = null;
      state.observer = null;
      state.visible = false;
      state.hasPointer = false;
    };
  }, [
    insideSrc,
    outsideSrc,
    squareSize,
    lensDistortion,
    rgbShiftR,
    rgbShiftG,
    rgbShiftB,
    waveFrequency,
    waveStrength,
    waveSpeed,
    randomFrequency,
    randomStrength,
    randomSpeed,
    pointerEase,
    desaturateOutside,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="lens-bg"
      aria-hidden="true"
    />
  );
}
