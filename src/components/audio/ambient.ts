/**
 * Generative ambient pad. Nothing is constructed until start() runs inside a
 * user gesture. Three detuned triangle voices, a pink-noise wind bed and
 * sparse pentatonic bells through a short delay, all by mood of the hour.
 */
export type Mood = "dawn" | "day" | "golden" | "dusk" | "night";

type MoodSpec = { roots: number[]; scale: number[]; cutoff: number };

const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const hz = (name: string) => {
  const m = /^([A-G])(#?)(\d)$/.exec(name);
  if (!m) return 220;
  const semi = NOTE[m[1]] + (m[2] ? 1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * Math.pow(2, (semi - 9) / 12);
};

const MOODS: Record<Mood, MoodSpec> = {
  dawn: { roots: [hz("D3"), hz("A3"), hz("E4")], scale: [2, 4, 6, 9, 11], cutoff: 720 },
  day: { roots: [hz("G3"), hz("D4"), hz("B4")], scale: [7, 9, 11, 2, 4], cutoff: 620 },
  golden: { roots: [hz("E3"), hz("B3"), hz("D4")], scale: [4, 6, 8, 11, 1], cutoff: 560 },
  dusk: { roots: [hz("A2"), hz("E3"), hz("C4")], scale: [9, 0, 2, 4, 7], cutoff: 460 },
  night: { roots: [hz("D2"), hz("A2"), hz("F3")], scale: [2, 5, 7, 9, 0], cutoff: 380 },
};

export function moodForHour(hour: number): Mood {
  if (hour < 5 || hour >= 21) return "night";
  if (hour < 8) return "dawn";
  if (hour < 16.5) return "day";
  if (hour < 18.5) return "golden";
  return "dusk";
}

function pinkNoiseBuffer(ctx: AudioContext, seconds = 4) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  // Crossfade the loop seam.
  const fade = Math.floor(ctx.sampleRate * 0.1);
  for (let i = 0; i < fade; i++) {
    const t = i / fade;
    data[i] *= t;
    data[length - 1 - i] *= t;
  }
  return buffer;
}

export class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padVoices: Array<{ osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode }> = [];
  private padFilter: BiquadFilterNode | null = null;
  private bellBus: GainNode | null = null;
  private bellTimer: number | null = null;
  private mood: Mood = "day";
  private stopTimer: number | null = null;
  playing = false;

  private build() {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 2;
    master.connect(comp).connect(ctx.destination);

    // Pad
    const padBus = ctx.createGain();
    padBus.gain.value = 0.55;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.7;
    filter.frequency.value = MOODS[this.mood].cutoff;
    const filterLfo = ctx.createOscillator();
    filterLfo.frequency.value = 0.03;
    const filterLfoGain = ctx.createGain();
    filterLfoGain.gain.value = 90;
    filterLfo.connect(filterLfoGain).connect(filter.frequency);
    filterLfo.start();
    padBus.connect(filter).connect(master);
    this.padFilter = filter;
    this.padVoices = [-7, 0, 7].map((cents, i) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.detune.value = cents;
      osc.frequency.value = MOODS[this.mood].roots[i];
      const gain = ctx.createGain();
      gain.gain.value = 0.18;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.06;
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();
      osc.connect(gain).connect(padBus);
      osc.start();
      return { osc, gain, lfo };
    });

    // Wind
    const wind = ctx.createBufferSource();
    wind.buffer = pinkNoiseBuffer(ctx);
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 440;
    windFilter.Q.value = 0.8;
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.07;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 120;
    windLfo.connect(windLfoGain).connect(windFilter.frequency);
    windLfo.start();
    const windBus = ctx.createGain();
    windBus.gain.value = 0.18;
    wind.connect(windFilter).connect(windBus).connect(master);
    wind.start();

    // Bells through a delay
    const bellBus = ctx.createGain();
    bellBus.gain.value = 0.35;
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.value = 2400;
    bellBus.connect(master);
    bellBus.connect(delay);
    delay.connect(delayFilter).connect(feedback).connect(delay);
    delayFilter.connect(master);
    this.bellBus = bellBus;

    this.ctx = ctx;
    this.master = master;
  }

  private bell() {
    const ctx = this.ctx;
    const bus = this.bellBus;
    if (!ctx || !bus || !this.playing) return;
    const spec = MOODS[this.mood];
    const degree = spec.scale[Math.floor(Math.random() * spec.scale.length)];
    const octave = 4 + Math.floor(Math.random() * 2);
    const freq = 440 * Math.pow(2, (degree - 9) / 12 + (octave - 4));
    const now = ctx.currentTime;
    const make = (mult: number, level: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(level, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      osc.connect(g).connect(bus);
      osc.start(now);
      osc.stop(now + 3);
    };
    make(1, 0.22);
    make(2.76, 0.22 * 0.2);
    this.bellTimer = window.setTimeout(() => this.bell(), 5000 + Math.random() * 14000);
  }

  setMood(mood: Mood) {
    this.mood = mood;
    const ctx = this.ctx;
    if (!ctx) return;
    const spec = MOODS[mood];
    this.padVoices.forEach((v, i) => v.osc.frequency.setTargetAtTime(spec.roots[i], ctx.currentTime, 2.5));
    this.padFilter?.frequency.setTargetAtTime(spec.cutoff, ctx.currentTime, 2.5);
  }

  /** Must be called from a user gesture. */
  async start(mood: Mood) {
    this.mood = mood;
    if (this.stopTimer) {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    if (ctx.state === "suspended") await ctx.resume();
    this.setMood(mood);
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(0.5, ctx.currentTime, 0.7);
    this.playing = true;
    if (this.bellTimer) window.clearTimeout(this.bellTimer);
    this.bellTimer = window.setTimeout(() => this.bell(), 3000);
  }

  stop() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    this.playing = false;
    if (this.bellTimer) window.clearTimeout(this.bellTimer);
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.7);
    this.stopTimer = window.setTimeout(() => void ctx.suspend(), 2200);
  }
}
