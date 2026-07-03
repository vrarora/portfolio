"use client";

import { useEffect, useRef, useState } from "react";
import { AuroraCSS } from "./AuroraCSS";

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_intensity;

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

float blob(vec2 uv, vec2 center, float radius) {
  float d = length(uv - center);
  return smoothstep(radius, 0.0, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / u_res.y;
  float t = u_time * 0.06;

  float n = noise(uv * 2.4 + t) * 0.5 + noise(uv * 5.2 - t * 1.4) * 0.25;

  vec2 c1 = vec2(0.22 + 0.10 * sin(t * 2.1), 0.72 + 0.08 * cos(t * 1.7));
  vec2 c2 = vec2(0.62 + 0.12 * cos(t * 1.3), 0.42 + 0.10 * sin(t * 2.4));
  vec2 c3 = vec2(0.38 + 0.09 * sin(t * 1.9 + 2.0), 0.18 + 0.07 * cos(t * 1.1));

  float b1 = blob(uv, c1, 0.55 + 0.08 * n);
  float b2 = blob(uv, c2, 0.48 + 0.10 * n);
  float b3 = blob(uv, c3, 0.42 + 0.07 * n);

  vec3 paper = vec3(0.980, 0.973, 0.957);
  vec3 coral = vec3(0.937, 0.478, 0.290);
  vec3 amber = vec3(0.949, 0.690, 0.360);
  vec3 rose  = vec3(0.929, 0.560, 0.480);

  vec3 col = paper;
  col = mix(col, coral, b1 * 0.34);
  col = mix(col, amber, b2 * 0.30);
  col = mix(col, rose,  b3 * 0.24);
  col += (n - 0.4) * 0.035;

  gl_FragColor = vec4(mix(paper, col, u_intensity), 1.0);
}
`;

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

/** Dependency-free WebGL warmth for the keepsake screen. Renders at half
 * resolution with a capped DPR and ramps in over ~2s. Any failure — no
 * context, compile error, context loss — falls back to the CSS aurora. */
export function AuroraShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    const uIntensity = gl.getUniformLocation(program, "u_intensity");

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
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uIntensity, Math.min(1, elapsed / 2));
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
    };
  }, []);

  if (failed) return <AuroraCSS />;

  return <canvas ref={canvasRef} className="ea-aurora-canvas" aria-hidden="true" />;
}
