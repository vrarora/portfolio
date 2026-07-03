"use client";

import { useEffect, useRef, useState } from "react";
import { AuroraCSS } from "./AuroraCSS";

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/** Dawn-break aurora. The screen opens at the payment sheet's exact charcoal
 * and first light blooms out of the point where the checkmark resolved, so
 * the dark-to-light handoff is one continuous sunrise instead of a hard cut.
 * Domain-warped fbm silk, rising embers that settle into dust motes once the
 * screen is lit, and a hash dither to keep the long ramp free of banding. */
const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_reveal;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = ROT * p * 2.03;
    a *= 0.5;
  }
  return v;
}

float emberLayer(vec2 p, float scale, float rise, float t) {
  vec2 g = vec2(p.x, p.y - t * rise) * scale;
  vec2 id = floor(g);
  vec2 f = fract(g);
  float on = step(0.82, hash(id + 11.3));
  vec2 c = vec2(0.25) + 0.5 * vec2(hash(id + 7.7), hash(id + 3.1));
  c.x += 0.06 * sin(t * (1.5 + 2.0 * hash(id)) + 6.28 * hash(id));
  float size = 0.05 + 0.05 * hash(id + 5.2);
  float tw = 0.55 + 0.45 * sin(t * (2.2 + 2.5 * hash(id + 9.4)) + 6.28 * hash(id + 2.6));
  return on * tw * smoothstep(size, size * 0.25, length(f - c));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_time * 0.055;
  float r = u_reveal;

  vec2 q = vec2(fbm(p * 1.7 + vec2(0.0, t)), fbm(p * 1.7 - vec2(t * 0.7, 4.2)));
  vec2 w = vec2(
    fbm(p * 2.1 + 2.1 * q + vec2(1.7, 9.2) + t * 0.45),
    fbm(p * 1.9 + 2.1 * q + vec2(8.3, 2.8) - t * 0.35)
  );
  float f = fbm(p * 1.6 + 2.3 * w);

  vec3 paper = vec3(0.980, 0.973, 0.957);
  vec3 coral = vec3(0.937, 0.478, 0.290);
  vec3 amber = vec3(0.949, 0.690, 0.360);
  vec3 rose  = vec3(0.929, 0.560, 0.480);
  vec3 gold  = vec3(0.976, 0.820, 0.545);

  vec3 col = paper;
  col = mix(col, amber, smoothstep(0.30, 0.85, f) * 0.40);
  col = mix(col, coral, smoothstep(0.55, 1.05, q.x + w.y) * 0.30);
  col = mix(col, rose, smoothstep(0.35, 0.85, w.x) * 0.24);
  col = mix(col, gold, smoothstep(0.60, 1.10, q.y + f) * 0.18);
  col = mix(col, paper, smoothstep(0.35, 1.0, uv.y) * 0.5);

  vec3 dusk = vec3(0.098, 0.090, 0.082);
  float horizon = pow(1.0 - uv.y, 2.4);
  vec3 duskCol = dusk + coral * horizon * 0.20 + gold * pow(1.0 - uv.y, 6.0) * 0.18;
  duskCol += (f - 0.5) * 0.05;

  vec2 seed = vec2(0.5 * aspect, 0.60);
  float d = distance(p, seed);
  float radius = r * 1.45 - 0.12;
  float lit = 1.0 - smoothstep(radius - 0.55, radius + 0.08, d);
  float spark = exp(-d * d * 26.0) * r * (1.0 - r) * 3.2;

  vec3 outCol = mix(duskCol + coral * spark, col, lit);

  float e = emberLayer(p, 7.0, 0.050, u_time) * 0.6
          + emberLayer(p, 11.0, 0.085, u_time) * 0.45;
  e *= smoothstep(1.05, 0.45, uv.y) * smoothstep(0.04, 0.35, r);
  vec3 emberCol = mix(gold * 1.15, coral, lit);
  outCol = mix(outCol, emberCol, e * mix(0.85, 0.22, lit));

  float vig = smoothstep(1.05, 0.45, distance(uv, vec2(0.5, 0.52)));
  outCol *= mix(0.955, 1.0, vig);
  outCol += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.012;

  gl_FragColor = vec4(outCol, 1.0);
}
`;

/** The dusk holds for a beat so the handoff from the payment sheet lands,
 * then dawn breaks over REVEAL_S. Content delays in KeepsakeScreen are tuned
 * against these — the title enters once its zone is already lit. */
const REVEAL_DELAY_S = 0.25;
const REVEAL_S = 1.6;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
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

/** Dependency-free WebGL dawn for the keepsake screen. Renders at half
 * resolution with a capped DPR. Any failure — no context, compile error,
 * context loss — falls back to the CSS aurora.
 *
 * The canvas is created inside the effect, not rendered by React: cleanup
 * releases its GL context with loseContext(), and a re-run of the effect on
 * the same DOM node (StrictMode, HMR) would get that same dead context back
 * from getContext() and silently fall back. A fresh canvas per effect run
 * always gets a live context. */
export function AuroraShader() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.className = "ea-aurora-canvas";
    host.appendChild(canvas);

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    const vert = createShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vert || !frag || !program) {
      setFailed(true);
      return;
    }
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uReveal = gl.getUniformLocation(program, "u_reveal");

    // First paint happens before the first rAF: clear to the payment
    // sheet's charcoal so frame zero is already dusk, never raw black.
    gl.clearColor(0.098, 0.09, 0.082, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let rafId = 0;
    let running = true;
    const start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr * 0.5));
      canvas.height = Math.max(1, Math.round(rect.height * dpr * 0.5));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const frame = (now: number) => {
      if (!running) return;
      const elapsed = (now - start) / 1000;
      const x = Math.min(1, Math.max(0, elapsed - REVEAL_DELAY_S) / REVEAL_S);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uReveal, 1 - (1 - x) ** 3);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) rafId = requestAnimationFrame(frame);
      else cancelAnimationFrame(rafId);
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  if (failed) return <AuroraCSS />;

  return <div ref={hostRef} className="ea-aurora-host" aria-hidden="true" />;
}
