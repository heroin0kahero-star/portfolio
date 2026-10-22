/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * A scroll-scrubbed portrait dissolve. The WebGL path samples procedural noise
 * and reveals the next portrait at the noise threshold, with a thin luminous
 * edge. If WebGL is unavailable (or motion is reduced), the same state drives a
 * CSS crossfade with a slight scale and blur.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface DissolveState {
  from: number;
  to: number;
  progress: number;
  edgeColor: [number, number, number];
}

export interface PortraitDissolveHandle {
  render: (state: DissolveState) => void;
}

interface PortraitDissolveProps {
  sources: string[];
  alts: string[];
  activeIndex: number;
  className?: string;
}

const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform vec2 uResA;
  uniform vec2 uResB;
  uniform vec2 uCanvas;
  uniform float uProgress;
  uniform vec3 uEdgeColor;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * valueNoise(p);
      p = p * 2.03 + vec2(17.1, 9.2);
      amplitude *= 0.5;
    }
    return value;
  }

  vec2 coverUv(vec2 uv, vec2 imageRes, vec2 canvasRes) {
    float canvasAspect = canvasRes.x / max(canvasRes.y, 1.0);
    float imageAspect = imageRes.x / max(imageRes.y, 1.0);
    vec2 scale = vec2(1.0);
    if (canvasAspect > imageAspect) {
      scale.y = imageAspect / canvasAspect;
    } else {
      scale.x = canvasAspect / imageAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    float progress = clamp(uProgress, 0.0, 1.0);
    float noise = fbm(vUv * vec2(3.4, 2.8) + vec2(11.3, 4.7));
    noise = clamp(noise * 1.16 - 0.08, 0.0, 1.0);

    float transitionActive = step(0.001, progress) * step(progress, 0.999);
    float warp = sin(progress * 3.14159265) * transitionActive;

    // Vertical stretch/smear while the outgoing portrait breaks apart.
    vec2 warpA = vec2(0.0, (noise - 0.5) * 0.24 * warp);
    vec2 warpB = vec2(0.0, (noise - 0.5) * 0.09 * warp);

    vec3 colorA = texture2D(uTexA, coverUv(vUv + warpA, uResA, uCanvas)).rgb;
    vec3 colorB = texture2D(uTexB, coverUv(vUv + warpB, uResB, uCanvas)).rgb;

    float edgeBand = smoothstep(0.13, 0.0, abs(noise - progress));
    float smearAmount = edgeBand * transitionActive * (0.012 + 0.05 * progress);
    vec3 smearedA = vec3(0.0);
    for (int i = 0; i < 5; i++) {
      float offset = (float(i) / 4.0 - 0.5) * smearAmount;
      smearedA += texture2D(
        uTexA,
        coverUv(vUv + warpA + vec2(0.0, offset), uResA, uCanvas)
      ).rgb;
    }
    smearedA /= 5.0;
    colorA = mix(colorA, smearedA, edgeBand * transitionActive);

    vec3 color = noise < progress ? colorB : colorA;

    float edge = smoothstep(0.03, 0.0, abs(noise - progress));
    edge *= transitionActive;
    color = mix(color, uEdgeColor, edge * 0.64);
    color += uEdgeColor * pow(edge, 2.0) * 0.26;

    gl_FragColor = vec4(color, 1.0);
  }
`;

type GlResources = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  textures: WebGLTexture[];
  imageSizes: Array<[number, number]>;
  uniforms: {
    texA: WebGLUniformLocation | null;
    texB: WebGLUniformLocation | null;
    resA: WebGLUniformLocation | null;
    resB: WebGLUniformLocation | null;
    canvas: WebGLUniformLocation | null;
    progress: WebGLUniformLocation | null;
    edgeColor: WebGLUniformLocation | null;
  };
};

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createResources(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
): GlResources | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const textures: WebGLTexture[] = [];
  const imageSizes: Array<[number, number]> = [];

  for (const image of images) {
    const texture = gl.createTexture();
    if (!texture) return null;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    textures.push(texture);
    imageSizes.push([image.naturalWidth, image.naturalHeight]);
  }

  gl.useProgram(program);

  return {
    gl,
    program,
    textures,
    imageSizes,
    uniforms: {
      texA: gl.getUniformLocation(program, "uTexA"),
      texB: gl.getUniformLocation(program, "uTexB"),
      resA: gl.getUniformLocation(program, "uResA"),
      resB: gl.getUniformLocation(program, "uResB"),
      canvas: gl.getUniformLocation(program, "uCanvas"),
      progress: gl.getUniformLocation(program, "uProgress"),
      edgeColor: gl.getUniformLocation(program, "uEdgeColor"),
    },
  };
}

export const PortraitDissolve = forwardRef<
  PortraitDissolveHandle,
  PortraitDissolveProps
>(function PortraitDissolve({ sources, alts, activeIndex, className = "" }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRefs = useRef<Array<HTMLImageElement | null>>([]);
  const resourcesRef = useRef<GlResources | null>(null);
  const stateRef = useRef<DissolveState>({
    from: 0,
    to: 0,
    progress: 0,
    edgeColor: [1, 1, 1],
  });
  const [mode, setMode] = useState<"loading" | "webgl" | "fallback">("loading");

  const paintFallback = useCallback((state: DissolveState) => {
    const progress = Math.max(0, Math.min(1, state.progress));
    fallbackRefs.current.forEach((image, index) => {
      if (!image) return;
      let opacity = 0;
      if (index === state.from) opacity = 1 - progress;
      if (index === state.to) opacity = progress;
      if (state.from === state.to) opacity = index === state.from ? 1 : 0;
      image.style.opacity = opacity.toFixed(4);
      image.style.filter = `blur(${(progress * (1 - progress) * 7).toFixed(3)}px)`;
      const drift = progress * (1 - progress) * 14;
      const direction = index === state.from ? -drift : drift;
      image.style.transform = `translate3d(0, ${direction.toFixed(3)}px, 0) scale(${(index === state.from ? 1 + progress * 0.018 : 1.018 - progress * 0.018).toFixed(4)})`;
    });
  }, []);

  const paintWebGl = useCallback((state: DissolveState) => {
    const resources = resourcesRef.current;
    const canvas = canvasRef.current;
    if (!resources || !canvas) return;

    const { gl, uniforms, textures, imageSizes } = resources;
    const width = Math.max(1, Math.round(canvas.clientWidth));
    const height = Math.max(1, Math.round(canvas.clientHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    gl.viewport(0, 0, pixelWidth, pixelHeight);
    gl.useProgram(resources.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[state.from]);
    gl.uniform1i(uniforms.texA, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[state.to]);
    gl.uniform1i(uniforms.texB, 1);

    gl.uniform2f(uniforms.resA, imageSizes[state.from][0], imageSizes[state.from][1]);
    gl.uniform2f(uniforms.resB, imageSizes[state.to][0], imageSizes[state.to][1]);
    gl.uniform2f(uniforms.canvas, pixelWidth, pixelHeight);
    gl.uniform1f(uniforms.progress, Math.max(0, Math.min(1, state.progress)));
    gl.uniform3f(
      uniforms.edgeColor,
      state.edgeColor[0],
      state.edgeColor[1],
      state.edgeColor[2],
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, []);

  const render = useCallback(
    (state: DissolveState) => {
      stateRef.current = state;
      paintFallback(state);
      if (mode === "webgl") paintWebGl(state);
    },
    [mode, paintFallback, paintWebGl],
  );

  useImperativeHandle(ref, () => ({ render }), [render]);

  useEffect(() => {
    let cancelled = false;

    const preload = sources.map(
      (source) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.decoding = "async";
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = source;
        }),
    );

    Promise.all(preload)
      .then((images) => {
        if (cancelled) return;

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const lowPower =
          typeof navigator.hardwareConcurrency === "number" &&
          navigator.hardwareConcurrency <= 2;

        if (reducedMotion || lowPower) {
          setMode("fallback");
          paintFallback(stateRef.current);
          return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
          setMode("fallback");
          return;
        }

        const resources = createResources(canvas, images);
        if (!resources) {
          setMode("fallback");
          paintFallback(stateRef.current);
          return;
        }

        resourcesRef.current = resources;
        setMode("webgl");
        paintWebGl(stateRef.current);
      })
      .catch(() => {
        if (!cancelled) setMode("fallback");
      });

    return () => {
      cancelled = true;
      const resources = resourcesRef.current;
      if (resources) {
        const { gl, textures, program } = resources;
        textures.forEach((texture) => gl.deleteTexture(texture));
        gl.deleteProgram(program);
        resourcesRef.current = null;
      }
    };
  }, [paintFallback, paintWebGl, sources]);

  useEffect(() => {
    if (mode !== "webgl") paintFallback(stateRef.current);
  }, [mode, paintFallback]);

  // Repaint on resize so the cover crop stays sharp.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== "webgl") return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => paintWebGl(stateRef.current));
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [mode, paintWebGl]);

  return (
    <div className={`portrait-dissolve ${className}`}>
      <canvas
        ref={canvasRef}
        className={`portrait-dissolve__canvas ${mode === "webgl" ? "is-visible" : ""}`}
        role="img"
        aria-label={alts[activeIndex] ?? alts[0]}
        aria-hidden={mode !== "webgl"}
      />
      <div
        className={`portrait-dissolve__fallback ${mode === "webgl" ? "is-hidden" : ""}`}
        role="img"
        aria-label={alts[activeIndex] ?? alts[0]}
        aria-hidden={mode === "webgl"}
      >
        {sources.map((source, index) => (
          <img
            key={source}
            ref={(element) => {
              fallbackRefs.current[index] = element;
            }}
            src={source}
            alt=""
            className="portrait-dissolve__image"
            draggable={false}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        ))}
      </div>
    </div>
  );
});
