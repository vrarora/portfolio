"use client";

import { ArrowUpRight, GithubLogo, LinkedinLogo, XLogo, type Icon } from "@phosphor-icons/react";
import { useEffect, useRef, type CSSProperties, type RefObject } from "react";

import type { FindMeCard as Card } from "@/content/home";

type Brand = { logo: Icon; base: string; ink: string };

/** Each card turns to its brand's night colour, with the mark glowing in the brand's ink. */
const BRANDS: Record<string, Brand> = {
  linkedin: { logo: LinkedinLogo, base: "#061a33", ink: "#2f7fd8" },
  github: { logo: GithubLogo, base: "#07170f", ink: "#2ea043" },
  x: { logo: XLogo, base: "#0b0b0f", ink: "#b9b9c8" },
};

/** Side of the square the logo is rasterised into before it becomes a distance field. */
const FIELD = 128;
/** How far, in field pixels, the distance field reaches either side of the edge. */
const SPREAD = 12;

const VERTEX = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

/*
 * The logo sits under the pointer, one card-height across. Its distance field
 * gives a solid body, a bright rim and rings that travel outward from the edge;
 * a faint halo pulses around the pointer. Light is stepped with a little grain,
 * like a screen print, and dimmed on the left so the labels stay readable.
 */
const FRAGMENT = `precision mediump float;
uniform vec2 uSize;
uniform vec2 uPointer;
uniform float uTime;
uniform vec3 uBase;
uniform vec3 uInk;
uniform sampler2D uField;

float grain(vec2 p) {
  return fract(sin(dot(p, vec2(27.619, 57.583))) * 43758.5453);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 d = (px - uPointer * uSize) / uSize.y;
  vec2 f = vec2(d.x, -d.y) + 0.5;
  float inField = step(0.0, f.x) * step(f.x, 1.0) * step(0.0, f.y) * step(f.y, 1.0);
  float sd = (texture2D(uField, clamp(f, 0.0, 1.0)).r - 0.5) * 2.0;

  float body = (1.0 - smoothstep(-0.04, 0.04, sd)) * inField;
  float rim = exp(-abs(sd) * 10.0) * inField;
  float rings = (0.5 + 0.5 * sin(sd * 24.0 - uTime * 2.0)) * exp(-abs(sd) * 4.5) * inField;
  float r = length(d);
  float halo = exp(-r * 2.4) * (0.5 + 0.5 * sin(r * 16.0 - uTime * 2.0));

  float light = body * 0.46 + rim * 0.26 + rings * 0.15 + halo * 0.05;
  light *= mix(0.5, 1.0, smoothstep(0.2, 0.65, px.x / uSize.x));
  light = floor(light * 7.0 + grain(floor(px / 2.0)) * 0.7) / 7.0;
  gl_FragColor = vec4(mix(uBase, uInk, light), 1.0);
}`;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];

/** Signed distance from a mask edge, in pixels, by a two-pass chamfer sweep: negative inside, positive outside. */
function distanceField(mask: Uint8Array, n: number): Uint8Array {
  const sweep = (seed: number) => {
    const d = new Float32Array(n * n);
    for (let i = 0; i < n * n; i++) d[i] = mask[i] === seed ? 0 : 1e6;
    const relax = (i: number, j: number, cost: number) => {
      if (d[j] + cost < d[i]) d[i] = d[j] + cost;
    };
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const i = y * n + x;
        if (x > 0) relax(i, i - 1, 1);
        if (y > 0) {
          relax(i, i - n, 1);
          if (x > 0) relax(i, i - n - 1, Math.SQRT2);
          if (x < n - 1) relax(i, i - n + 1, Math.SQRT2);
        }
      }
    }
    for (let y = n - 1; y >= 0; y--) {
      for (let x = n - 1; x >= 0; x--) {
        const i = y * n + x;
        if (x < n - 1) relax(i, i + 1, 1);
        if (y < n - 1) {
          relax(i, i + n, 1);
          if (x < n - 1) relax(i, i + n + 1, Math.SQRT2);
          if (x > 0) relax(i, i + n - 1, Math.SQRT2);
        }
      }
    }
    return d;
  };

  const toInside = sweep(1);
  const toOutside = sweep(0);
  const out = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) {
    const signed = toInside[i] - toOutside[i];
    out[i] = Math.round(Math.min(1, Math.max(0, 0.5 + signed / (2 * SPREAD))) * 255);
  }
  return out;
}

/** Rasterises the hidden logo SVG and turns it into a distance field. */
async function logoField(svg: SVGSVGElement): Promise<Uint8Array> {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copy.setAttribute("width", String(FIELD));
  copy.setAttribute("height", String(FIELD));
  copy.setAttribute("fill", "#000");
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(copy.outerHTML)}`;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = FIELD;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Uint8Array(FIELD * FIELD);
  ctx.drawImage(image, 0, 0, FIELD, FIELD);
  const pixels = ctx.getImageData(0, 0, FIELD, FIELD).data;
  const mask = new Uint8Array(FIELD * FIELD);
  for (let i = 0; i < mask.length; i++) mask[i] = pixels[i * 4 + 3] > 127 ? 1 : 0;
  return distanceField(mask, FIELD);
}

/**
 * Draws the brand shader into the card's canvas while it is hovered or focused.
 * WebGL starts on the first visit, the loop runs only while the card is active,
 * and reduced motion holds one still frame.
 */
function useBrandShader(
  card: RefObject<HTMLAnchorElement | null>,
  canvas: RefObject<HTMLCanvasElement | null>,
  logo: RefObject<SVGSVGElement | null>,
  brand: Brand,
) {
  useEffect(() => {
    const link = card.current;
    const surface = canvas.current;
    const mark = logo.current;
    if (!link || !surface || !mark) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let gl: WebGLRenderingContext | null = null;
    let uniforms: Record<"size" | "pointer" | "time", WebGLUniformLocation | null> | null = null;
    let starting: Promise<void> | null = null;
    let frame = 0;
    let active = false;
    let pointer: [number, number] = [0.7, 0.5];

    const start = async () => {
      const context = surface.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
      if (!context) return;
      const compile = (type: number, source: string) => {
        const shader = context.createShader(type);
        if (!shader) return null;
        context.shaderSource(shader, source);
        context.compileShader(shader);
        return context.getShaderParameter(shader, context.COMPILE_STATUS) ? shader : null;
      };
      const vertex = compile(context.VERTEX_SHADER, VERTEX);
      const fragment = compile(context.FRAGMENT_SHADER, FRAGMENT);
      const program = context.createProgram();
      if (!vertex || !fragment || !program) return;
      context.attachShader(program, vertex);
      context.attachShader(program, fragment);
      context.linkProgram(program);
      if (!context.getProgramParameter(program, context.LINK_STATUS)) return;
      context.useProgram(program);

      context.bindBuffer(context.ARRAY_BUFFER, context.createBuffer());
      context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), context.STATIC_DRAW);
      const position = context.getAttribLocation(program, "a");
      context.enableVertexAttribArray(position);
      context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

      const field = await logoField(mark);
      context.bindTexture(context.TEXTURE_2D, context.createTexture());
      context.pixelStorei(context.UNPACK_ALIGNMENT, 1);
      context.texImage2D(context.TEXTURE_2D, 0, context.LUMINANCE, FIELD, FIELD, 0, context.LUMINANCE, context.UNSIGNED_BYTE, field);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);

      context.uniform1i(context.getUniformLocation(program, "uField"), 0);
      context.uniform3fv(context.getUniformLocation(program, "uBase"), rgb(brand.base));
      context.uniform3fv(context.getUniformLocation(program, "uInk"), rgb(brand.ink));
      uniforms = {
        size: context.getUniformLocation(program, "uSize"),
        pointer: context.getUniformLocation(program, "uPointer"),
        time: context.getUniformLocation(program, "uTime"),
      };
      gl = context;
    };

    const draw = (now: number) => {
      if (!gl || !uniforms) return;
      const ratio = Math.min(window.devicePixelRatio, 2);
      const width = Math.round(link.clientWidth * ratio);
      const height = Math.round(link.clientHeight * ratio);
      if (surface.width !== width || surface.height !== height) {
        surface.width = width;
        surface.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.uniform2f(uniforms.size, width, height);
      gl.uniform2f(uniforms.pointer, pointer[0], pointer[1]);
      gl.uniform1f(uniforms.time, motion.matches ? 0 : now / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (active && !motion.matches) frame = requestAnimationFrame(draw);
    };

    const aim = (event: PointerEvent) => {
      if (motion.matches) return;
      const rect = link.getBoundingClientRect();
      pointer = [(event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height];
    };

    const enter = async (event: Event) => {
      if (event instanceof PointerEvent) aim(event);
      else pointer = [0.7, 0.5];
      active = true;
      starting ??= start();
      await starting;
      cancelAnimationFrame(frame);
      if (active) draw(performance.now());
    };

    const leave = () => {
      active = false;
      cancelAnimationFrame(frame);
    };

    const onPointerLeave = () => {
      if (!link.matches(":focus-visible")) leave();
    };

    link.addEventListener("pointerenter", enter);
    link.addEventListener("pointermove", aim);
    link.addEventListener("pointerleave", onPointerLeave);
    link.addEventListener("focus", enter);
    link.addEventListener("blur", leave);

    return () => {
      leave();
      link.removeEventListener("pointerenter", enter);
      link.removeEventListener("pointermove", aim);
      link.removeEventListener("pointerleave", onPointerLeave);
      link.removeEventListener("focus", enter);
      link.removeEventListener("blur", leave);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [card, canvas, logo, brand]);
}

/** A Find me card. On hover it turns to the brand's night colour and the brand mark glows under the pointer. */
export function FindMeCard({ card }: { card: Card }) {
  const brand = BRANDS[card.id] ?? BRANDS.x;
  const Logo = brand.logo;
  const linkRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  useBrandShader(linkRef, canvasRef, logoRef, brand);

  return (
    <a ref={linkRef} className="hm-card" href={card.href} target="_blank" rel="noreferrer" style={{ "--brand": brand.base } as CSSProperties}>
      <canvas ref={canvasRef} className="hm-card-shader" aria-hidden="true" />
      <Logo ref={logoRef} className="hm-card-logo" weight="fill" aria-hidden="true" />
      <span className="hm-card-label">{card.label}</span>
      <span className="hm-card-line">{card.line}</span>
      <ArrowUpRight className="hm-card-arrow" size={12} weight="bold" aria-hidden="true" />
    </a>
  );
}
