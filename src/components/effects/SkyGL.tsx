"use client";

import { useEffect, useRef } from "react";

import { hexToRgb } from "@/lib/sky";
import type { SkyState } from "@/lib/sky";

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_zenith;
uniform vec3 u_mid;
uniform vec3 u_horizon;
uniform float u_stars;
uniform vec2 u_sun;
uniform float u_sunVis;
uniform vec2 u_moon;
uniform float u_moonVis;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) { return vnoise(p) * 0.65 + vnoise(p * 2.1 + 3.7) * 0.35; }

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;

  vec3 col = uv.y > 0.45
    ? mix(u_mid, u_zenith, (uv.y - 0.45) / 0.55)
    : mix(u_horizon, u_mid, uv.y / 0.45);

  float haze = fbm(vec2(uv.x * 3.0 + u_time * 0.012, uv.y * 2.0 + u_time * 0.004)) - 0.5;
  col += haze * 0.06;

  // Stars, denser towards the zenith, with a slow twinkle
  vec2 cell = floor(gl_FragCoord.xy / 3.0);
  float s = hash(cell);
  float twinkle = 0.6 + 0.4 * sin(u_time * 0.8 + s * 60.0);
  float star = step(0.994, s) * twinkle * smoothstep(0.25, 1.0, uv.y);
  col += star * u_stars * 0.85;

  // Sun
  vec2 p = vec2(uv.x * aspect, uv.y);
  float ds = distance(p, vec2(u_sun.x * aspect, u_sun.y));
  col += u_sunVis * vec3(1.0, 0.94, 0.82) * (smoothstep(0.04, 0.024, ds) * 0.85 + 0.26 * exp(-ds * ds * 34.0));

  // Moon
  float dm = distance(p, vec2(u_moon.x * aspect, u_moon.y));
  col += u_moonVis * vec3(0.94, 0.95, 1.0) * (smoothstep(0.03, 0.02, dm) * 0.9 + 0.18 * exp(-dm * dm * 50.0));

  gl_FragColor = vec4(col, 1.0);
}
`;

const MAX_W = 1280;
const MAX_H = 800;
const FPS = 30;

function rgb01(hex: string): [number, number, number] {
  const { r, g, b } = hexToRgb(hex);
  return [r / 255, g / 255, b / 255];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type Props = { state: SkyState; active: boolean; onReady?: () => void };

/** Shader sky: gradient, soft haze, stars and a sun or moon. Renders only while `active`. */
export default function SkyGL({ state, active, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const activeRef = useRef(active);
  activeRef.current = active;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u("u_res");
    const uTime = u("u_time");
    const uZenith = u("u_zenith");
    const uMid = u("u_mid");
    const uHorizon = u("u_horizon");
    const uStars = u("u_stars");
    const uSun = u("u_sun");
    const uSunVis = u("u_sunVis");
    const uMoon = u("u_moon");
    const uMoonVis = u("u_moonVis");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(1, MAX_W / Math.max(1, rect.width), MAX_H / Math.max(1, rect.height));
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const start = performance.now();
    let last = 0;
    let raf = 0;
    let announced = false;

    const draw = (now: number) => {
      raf = 0;
      if (!activeRef.current) return;
      if (now - last >= 1000 / FPS) {
        last = now;
        const s = stateRef.current;
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (now - start) / 1000);
        gl.uniform3fv(uZenith, rgb01(s.zenith));
        gl.uniform3fv(uMid, rgb01(s.mid));
        gl.uniform3fv(uHorizon, rgb01(s.horizon));
        gl.uniform1f(uStars, s.stars);
        const sunVis = Math.max(0, Math.min(1, (s.sun.y + 0.05) / 0.25)) * (1 - s.night);
        gl.uniform2f(uSun, s.sun.x, 0.12 + Math.max(0, s.sun.y) * 0.62);
        gl.uniform1f(uSunVis, sunVis);
        gl.uniform2f(uMoon, 0.74, 0.7);
        gl.uniform1f(uMoonVis, s.moon ? Math.min(1, (s.night - 0.5) * 2) : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!announced) {
          announced = true;
          onReadyRef.current?.();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const wake = () => {
      if (!raf && activeRef.current) raf = requestAnimationFrame(draw);
    };
    wake();
    const poll = window.setInterval(wake, 250);

    return () => {
      window.clearInterval(poll);
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className="fx-sky-gl" aria-hidden="true" />;
}
