export type AudioCue =
  | "countdown"
  | "go"
  | "raceBed"
  | "finish"
  | "resultsWin"
  | "resultsPodium"
  | "resultsFinish";

const MUTE_KEY = "clackrace:mute";

type Tone = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
};

function loadMute(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Lightweight Web Audio synthesizer — no binary assets required.
 * Unlock on first user gesture via `ensureUnlocked()`.
 */
class RaceAudioManager {
  private ctx: AudioContext | null = null;
  private muted = loadMute();
  private bedGain: GainNode | null = null;
  private bedOsc: OscillatorNode | null = null;
  private unlocked = false;

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
    this.unlocked = true;
  }

  play(cue: AudioCue) {
    if (this.muted || typeof window === "undefined") return;
    void this.ensureUnlocked().then(() => {
      if (!this.ctx || this.muted) return;
      switch (cue) {
        case "countdown":
          this.beep([{ freq: 520, dur: 0.08, gain: 0.08 }]);
          break;
        case "go":
          this.beep([
            { freq: 440, dur: 0.08, gain: 0.1 },
            { freq: 660, dur: 0.12, gain: 0.12, delay: 0.08 },
            { freq: 880, dur: 0.18, gain: 0.1, delay: 0.18 },
          ]);
          break;
        case "raceBed":
          this.startRaceBed();
          break;
        case "finish":
          this.beep([
            { freq: 700, dur: 0.1, gain: 0.1 },
            { freq: 920, dur: 0.16, gain: 0.1, delay: 0.1 },
          ]);
          break;
        case "resultsWin":
          this.beep([
            { freq: 523, dur: 0.12, gain: 0.12 },
            { freq: 659, dur: 0.12, gain: 0.12, delay: 0.12 },
            { freq: 784, dur: 0.12, gain: 0.12, delay: 0.24 },
            { freq: 1046, dur: 0.28, gain: 0.14, delay: 0.36 },
          ]);
          break;
        case "resultsPodium":
          this.beep([
            { freq: 494, dur: 0.12, gain: 0.1 },
            { freq: 622, dur: 0.14, gain: 0.1, delay: 0.12 },
            { freq: 740, dur: 0.22, gain: 0.11, delay: 0.26 },
          ]);
          break;
        case "resultsFinish":
          this.beep([
            { freq: 392, dur: 0.12, gain: 0.08 },
            { freq: 330, dur: 0.18, gain: 0.07, delay: 0.12 },
          ]);
          break;
      }
    });
  }

  stopRaceBed() {
    if (this.bedOsc) {
      try {
        this.bedOsc.stop();
      } catch {
        /* already stopped */
      }
      this.bedOsc = null;
    }
    this.bedGain = null;
  }

  private startRaceBed() {
    if (!this.ctx || this.bedOsc) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 55;
    gain.gain.value = 0.015;
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    this.bedOsc = osc;
    this.bedGain = gain;
  }

  private beep(tones: Tone[]) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const t of tones) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = t.type ?? "square";
      osc.frequency.value = t.freq;
      const start = now + (t.delay ?? 0);
      const level = t.gain ?? 0.08;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(level, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + t.dur + 0.02);
    }
  }
}

export const raceAudio = new RaceAudioManager();
