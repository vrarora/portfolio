/**
 * The small sound under every press. Links and buttons get a short pitched blip;
 * anything else gets a dry tick, like a fingertip on paper.
 */

export type TapKind = "link" | "action" | "plain";

type Blip = { from: number; to: number; type: OscillatorType; gain: number; duration: number };

const BLIPS: Record<Exclude<TapKind, "plain">, Blip> = {
  link: { from: 520, to: 340, type: "sine", gain: 0.1, duration: 0.052 },
  action: { from: 620, to: 510, type: "square", gain: 0.08, duration: 0.035 },
};

let context: AudioContext | null = null;
let master: GainNode | null = null;
let level = 1;

function audio() {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  if (!context || context.state === "closed") {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = level;
    master.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

function blip(ctx: AudioContext, out: AudioNode, { from, to, type, gain, duration }: Blip) {
  const start = ctx.currentTime + 0.005;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env).connect(out);
  osc.onended = () => osc.disconnect();
  osc.start(start);
  osc.stop(start + duration + 0.012);
}

/** An 8ms burst of noise through a narrow band around 3.2kHz. */
function tick(ctx: AudioContext, out: AudioNode) {
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.008)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 40);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 3200;
  band.Q.value = 3;
  const env = ctx.createGain();
  env.gain.value = 0.9;
  source.connect(band).connect(env).connect(out);
  source.onended = () => source.disconnect();
  source.start(ctx.currentTime + 0.01);
}

export function playTap(kind: TapKind) {
  const ctx = audio();
  if (!ctx || !master) return;
  if (kind === "plain") tick(ctx, master);
  else blip(ctx, master, BLIPS[kind]);
}

/** Scales every tap, so taps can sit under the music. */
export function setTapLevel(value: number) {
  level = value;
  if (master) master.gain.value = value;
}
