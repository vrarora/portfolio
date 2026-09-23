import { bump, range } from "../engine/math";
import { afterProgress, firstProgress } from "../engine/timeline";

type LayerName = "market" | "night" | "rain" | "dawn" | "piano";

const LOOKAHEAD = 0.25;
const TICK_MS = 80;
const BEAT = 60 / 66;

/** D major, soft and open. Each chord is bass plus three voicing notes, in MIDI. */
const CHORDS: readonly number[][] = [
  [38, 57, 61, 66], // Dmaj7
  [35, 54, 57, 62], // Bm7
  [31, 50, 54, 59], // Gmaj7
  [33, 52, 57, 61], // A
];
const MELODY = [74, 76, 78, 81, 83, 86];

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/**
 * Every sound on the page is synthesised here. Nothing is downloaded.
 * Layers crossfade with story progress; the piano runs under all of them.
 */
export class Soundscape {
  private readonly ctx: AudioContext;
  private readonly master: GainNode;
  private readonly reverb: ConvolverNode;
  private readonly layers: Record<LayerName, GainNode>;
  private readonly noise: AudioBuffer;
  private readonly babble: { filter: BiquadFilterNode; gain: GainNode }[] = [];
  private timer: number | null = null;
  private nextBeat = 0;
  private beat = 0;
  private nextBell = 0;
  private nextCricket = 0;
  private nextBird = 0;
  private progress = 0;

  constructor() {
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.impulse(3.2);
    const wet = this.ctx.createGain();
    wet.gain.value = 0.55;
    this.reverb.connect(wet).connect(this.master);

    this.noise = this.noiseBuffer();
    const make = () => {
      const g = this.ctx.createGain();
      g.gain.value = 0;
      g.connect(this.master);
      return g;
    };
    this.layers = { market: make(), night: make(), rain: make(), dawn: make(), piano: make() };
    this.layers.piano.connect(this.reverb);
    this.layers.dawn.connect(this.reverb);

    this.buildMarket();
    this.buildNight();
    this.buildRain();
    this.buildBreeze();
  }

  async start() {
    await this.ctx.resume();
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0.8, now, 0.6);
    this.nextBeat = now + 0.2;
    this.nextBell = now + 2;
    this.nextCricket = now;
    this.nextBird = now + 1;
    this.setProgress(this.progress, true);
    if (this.timer === null) this.timer = window.setInterval(() => this.schedule(), TICK_MS);
  }

  async stop() {
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0, now, 0.25);
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    if (this.timer === null) await this.ctx.suspend();
  }

  dispose() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    void this.ctx.close();
  }

  /** p is total story progress; each act reads its own timeline. */
  setProgress(p: number, immediate = false) {
    this.progress = p;
    const q = afterProgress(p);
    const targets = q > 0 ? this.afterMix(q) : this.firstMix(firstProgress(p));
    const now = this.ctx.currentTime;
    (Object.keys(targets) as LayerName[]).forEach((name) => {
      this.layers[name].gain.setTargetAtTime(targets[name], now, immediate ? 0.05 : 0.5);
    });
  }

  private firstMix(p: number): Record<LayerName, number> {
    return {
      market: 1 - range(p, 0.24, 0.32),
      night: range(p, 0.28, 0.38) * (1 - range(p, 0.87, 0.95)),
      rain: bump(p, 0.4, 0.43, 0.52, 0.55),
      dawn: range(p, 0.87, 0.97),
      piano: 0.85 - 0.2 * bump(p, 0.4, 0.45, 0.8, 0.86),
    };
  }

  /** Breeze and birds through the day, wind and crickets under the stars, then first light. */
  private afterMix(q: number): Record<LayerName, number> {
    return {
      market: 0,
      night: range(q, 0.7, 0.8) * (1 - 0.6 * range(q, 0.95, 1)),
      rain: 0,
      dawn: Math.max(1 - range(q, 0.72, 0.8), 0.6 * range(q, 0.94, 1)),
      piano: 0.85,
    };
  }

  /** Crickets belong to the first act's nights and the second act's plains. */
  private get crickets() {
    const q = afterProgress(this.progress);
    if (q > 0) return q > 0.72 && q < 0.97;
    const p = firstProgress(this.progress);
    return p > 0.3 && p < 0.9;
  }

  /** Birds sing from the first dawn through the day, and again at the very end. */
  private get birds() {
    const q = afterProgress(this.progress);
    if (q > 0) return q < 0.7 || q > 0.97;
    return firstProgress(this.progress) > 0.88;
  }

  /* ---------- Beds ---------- */

  private loop(): AudioBufferSourceNode {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.loopStart = Math.random() * 2;
    src.start(0, Math.random() * 3);
    return src;
  }

  private buildMarket() {
    const bed = this.ctx.createBiquadFilter();
    bed.type = "lowpass";
    bed.frequency.value = 520;
    const bedGain = this.ctx.createGain();
    bedGain.gain.value = 0.16;
    this.loop().connect(bed).connect(bedGain).connect(this.layers.market);

    // A handful of band-limited voices whose loudness wanders like distant talk.
    for (let i = 0; i < 5; i += 1) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 350 + Math.random() * 700;
      filter.Q.value = 5;
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      const pan = this.ctx.createStereoPanner();
      pan.pan.value = -0.8 + (i / 4) * 1.6;
      this.loop().connect(filter).connect(gain).connect(pan).connect(this.layers.market);
      this.babble.push({ filter, gain });
    }
  }

  private buildNight() {
    const wind = this.ctx.createBiquadFilter();
    wind.type = "bandpass";
    wind.frequency.value = 420;
    wind.Q.value = 0.6;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const depth = this.ctx.createGain();
    depth.gain.value = 180;
    lfo.connect(depth).connect(wind.frequency);
    lfo.start();
    const gain = this.ctx.createGain();
    gain.gain.value = 0.22;
    this.loop().connect(wind).connect(gain).connect(this.layers.night);
  }

  private buildRain() {
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 6500;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.2;
    this.loop().connect(hp).connect(lp).connect(gain).connect(this.layers.rain);
  }

  private buildBreeze() {
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.1;
    this.loop().connect(filter).connect(gain).connect(this.layers.dawn);
  }

  /* ---------- Events ---------- */

  private schedule() {
    const now = this.ctx.currentTime;
    const horizon = now + LOOKAHEAD;

    for (const v of this.babble) {
      if (Math.random() < 0.35) {
        v.gain.gain.setTargetAtTime(Math.random() < 0.4 ? 0 : Math.random() * 0.22, now, 0.07);
        if (Math.random() < 0.1) v.filter.frequency.setTargetAtTime(350 + Math.random() * 700, now, 0.3);
      }
    }

    while (this.nextBeat < horizon) {
      this.pianoBeat(this.nextBeat);
      this.nextBeat += BEAT;
      this.beat += 1;
    }
    while (this.nextBell < horizon) {
      if (firstProgress(this.progress) < 0.28) this.bell(this.nextBell);
      this.nextBell += 5 + Math.random() * 7;
    }
    while (this.nextCricket < horizon) {
      if (this.crickets) this.cricket(this.nextCricket);
      this.nextCricket += 0.55 + Math.random() * 0.7;
    }
    while (this.nextBird < horizon) {
      if (this.birds) this.bird(this.nextBird);
      this.nextBird += 0.8 + Math.random() * 2.2;
    }
  }

  private pianoBeat(t: number) {
    const bar = Math.floor(this.beat / 4);
    const step = this.beat % 4;
    const chord = CHORDS[bar % CHORDS.length];
    if (step === 0) {
      this.note(midiToHz(chord[0]), t, 0.32, 5);
      this.note(midiToHz(chord[1]), t + 0.03, 0.18, 4);
    }
    if (step === 1 || step === 3) {
      if (Math.random() < 0.75) this.note(midiToHz(chord[1 + Math.floor(Math.random() * 3)]), t + Math.random() * 0.08, 0.14, 3.5);
    }
    if (step === 2 && Math.random() < 0.55) {
      this.note(midiToHz(MELODY[Math.floor(Math.random() * MELODY.length)]), t, 0.1, 4);
    }
  }

  /** A soft felt-piano tone: a few partials, a quick attack, a long fade. */
  private note(freq: number, t: number, velocity: number, length: number) {
    const out = this.ctx.createGain();
    const tone = this.ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 1800 + velocity * 3000;
    out.connect(tone).connect(this.layers.piano);
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(velocity, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0001, t + length);
    [1, 2, 3, 4.02].forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      osc.frequency.value = freq * ratio;
      osc.detune.value = (Math.random() - 0.5) * 6;
      const g = this.ctx.createGain();
      g.gain.value = [1, 0.4, 0.16, 0.06][i];
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + length / (1 + i * 0.8));
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + length + 0.1);
    });
  }

  private bell(t: number) {
    const base = 560 + Math.random() * 260;
    const out = this.ctx.createGain();
    out.gain.value = 0.05;
    const pan = this.ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;
    out.connect(pan).connect(this.layers.market);
    pan.connect(this.reverb);
    [1, 2.76, 5.4].forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      osc.frequency.value = base * ratio;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime([1, 0.5, 0.25][i], t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5 / (1 + i));
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + 4);
    });
  }

  private cricket(t: number) {
    const osc = this.ctx.createOscillator();
    osc.frequency.value = 4200 + Math.random() * 500;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    const pan = this.ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    osc.connect(g).connect(pan).connect(this.layers.night);
    const pulses = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < pulses; i += 1) {
      const s = t + i * 0.045;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.018, s + 0.008);
      g.gain.linearRampToValueAtTime(0, s + 0.03);
    }
    osc.start(t);
    osc.stop(t + pulses * 0.045 + 0.05);
  }

  private bird(t: number) {
    const notes = 2 + Math.floor(Math.random() * 4);
    const pan = this.ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    pan.connect(this.layers.dawn);
    const base = 2400 + Math.random() * 1600;
    for (let i = 0; i < notes; i += 1) {
      const s = t + i * (0.09 + Math.random() * 0.06);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.3), s);
      osc.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), s + 0.06);
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.035, s + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.08);
      osc.connect(g).connect(pan);
      osc.start(s);
      osc.stop(s + 0.1);
    }
  }

  /* ---------- Buffers ---------- */

  private noiseBuffer() {
    const length = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private impulse(seconds: number) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c += 1) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
    }
    return buffer;
  }
}
