export type AudioCue =
  | "countdown"
  | "go"
  | "raceBed"
  | "finish"
  | "resultsWin"
  | "resultsPodium"
  | "resultsFinish";

const MUTE_KEY = "clackrace:mute";

const ONE_SHOT: Record<Exclude<AudioCue, "raceBed">, string> = {
  countdown: "/audio/countdown.wav",
  go: "/audio/go.wav",
  finish: "/audio/finish.wav",
  resultsWin: "/audio/results-win.wav",
  resultsPodium: "/audio/results-podium.wav",
  resultsFinish: "/audio/results-finish.wav",
};

/** Continuous layers for asphalt/arcade race feel — steady loops, no pitch pumping. */
const BED_LAYERS = [
  { url: "/audio/crowd-ambience.wav", gain: 0.22 },
  { url: "/audio/stadium-crowd.wav", gain: 0.14 },
  { url: "/audio/engine-loop.wav", gain: 0.32 },
] as const;

function loadMute(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

type BedHandle = {
  sources: AudioBufferSourceNode[];
  master: GainNode;
};

/**
 * Sample-based race audio. Race bed = continuous crowd + engine loops
 * (Mixkit WAVs in /public/audio). Intensity only nudges master volume —
 * no playbackRate yo-yo.
 */
class RaceAudioManager {
  private ctx: AudioContext | null = null;
  private muted = loadMute();
  private buffers = new Map<string, AudioBuffer>();
  private preloadPromise: Promise<void> | null = null;
  private bed: BedHandle | null = null;
  private intensity = 0.4;

  isMuted() {
    return this.muted;
  }

  setMuted(next: boolean) {
    this.muted = next;
    try {
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (next) this.stopRaceBed();
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  async ensureUnlocked() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    await this.preload();
  }

  play(cue: AudioCue) {
    if (this.muted || typeof window === "undefined") return;
    void this.ensureUnlocked().then(() => {
      if (!this.ctx || this.muted) return;
      if (cue === "raceBed") {
        this.startRaceBed();
        return;
      }
      if (cue === "finish") {
        this.stopRaceBed();
        // Short crowd cheer sting under the finish cue
        this.playOneShot("/audio/crowd-cheer.wav", 0.35);
      }
      if (cue === "resultsWin") {
        this.playOneShot("/audio/crowd-cheer.wav", 0.45);
      }
      this.playOneShot(ONE_SHOT[cue], cue === "go" ? 0.85 : 0.9);
    });
  }

  /** Soft volume ride with WPM — never changes loop pitch. */
  setDrivingFromWpm(wpm: number) {
    const t = Math.min(1, Math.max(0, wpm / 100));
    this.setDrivingIntensity(0.35 + t * 0.45);
  }

  setDrivingIntensity(value: number) {
    this.intensity = Math.min(1, Math.max(0, value));
    if (!this.ctx || !this.bed) return;
    const now = this.ctx.currentTime;
    const vol = 0.55 + this.intensity * 0.45;
    this.bed.master.gain.cancelScheduledValues(now);
    this.bed.master.gain.linearRampToValueAtTime(vol, now + 0.25);
  }

  stopRaceBed() {
    if (!this.bed) return;
    const { sources, master } = this.bed;
    const ctx = this.ctx;
    this.bed = null;
    if (ctx) {
      const t = ctx.currentTime;
      try {
        master.gain.cancelScheduledValues(t);
        master.gain.linearRampToValueAtTime(0.0001, t + 0.35);
      } catch {
        /* ignore */
      }
    }
    window.setTimeout(() => {
      for (const s of sources) {
        try {
          s.stop();
        } catch {
          /* ignore */
        }
      }
      try {
        master.disconnect();
      } catch {
        /* ignore */
      }
    }, 400);
  }

  private async preload() {
    if (this.preloadPromise) return this.preloadPromise;
    const urls = [
      ...Object.values(ONE_SHOT),
      ...BED_LAYERS.map((l) => l.url),
      "/audio/crowd-cheer.wav",
    ];
    this.preloadPromise = Promise.all(
      urls.map((url) => this.loadBuffer(url)),
    ).then(() => undefined);
    return this.preloadPromise;
  }

  private async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    const cached = this.buffers.get(url);
    if (cached) return cached;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const raw = await res.arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(raw.slice(0));
      this.buffers.set(url, buffer);
      return buffer;
    } catch {
      return null;
    }
  }

  private playOneShot(url: string, volume: number) {
    if (!this.ctx) return;
    const buffer = this.buffers.get(url);
    if (!buffer) {
      void this.loadBuffer(url).then((b) => {
        if (b && this.ctx && !this.muted) this.startBuffer(b, volume, false);
      });
      return;
    }
    this.startBuffer(buffer, volume, false);
  }

  private startRaceBed() {
    if (!this.ctx || this.bed) return;

    const missing = BED_LAYERS.some((l) => !this.buffers.has(l.url));
    if (missing) {
      void this.preload().then(() => {
        if (!this.bed && !this.muted) this.startRaceBed();
      });
      return;
    }

    const master = this.ctx.createGain();
    master.gain.value = 0;
    master.connect(this.ctx.destination);

    const sources: AudioBufferSourceNode[] = [];
    for (const layer of BED_LAYERS) {
      const buffer = this.buffers.get(layer.url);
      if (!buffer) continue;
      const gain = this.ctx.createGain();
      gain.gain.value = layer.gain;
      gain.connect(master);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
      sources.push(source);
    }

    if (sources.length === 0) return;

    const now = this.ctx.currentTime;
    master.gain.linearRampToValueAtTime(0.7, now + 0.5);
    this.bed = { sources, master };
    this.setDrivingIntensity(this.intensity);
  }

  private startBuffer(buffer: AudioBuffer, volume: number, loop: boolean) {
    if (!this.ctx) return;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    gain.connect(this.ctx.destination);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(gain);
    source.start();
  }
}

export const raceAudio = new RaceAudioManager();
