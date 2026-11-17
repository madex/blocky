class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterOut: AudioNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private lastSnapAt = 0;
  public muted = false;

  private getContext(): { ctx: AudioContext; out: AudioNode } | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = -14;
        compressor.knee.value = 18;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.18;
        compressor.connect(this.ctx.destination);
        this.masterOut = compressor;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.ctx || !this.masterOut) return null;
    return { ctx: this.ctx, out: this.masterOut };
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = Math.floor(ctx.sampleRate * 0.45);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private playTone(
    freqStart: number,
    duration: number,
    options: {
      freqEnd?: number;
      type?: OscillatorType;
      gainPeak?: number;
      delay?: number;
      attack?: number;
    } = {},
  ) {
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const {
      freqEnd,
      type = 'sine',
      gainPeak = 0.1,
      delay = 0,
      attack = 0.008,
    } = options;

    try {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      if (freqEnd && freqEnd > 0) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainPeak, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Ignore blocked playback
    }
  }

  private playShimmerNoise(
    duration: number,
    freqStart: number,
    freqEnd: number,
    gainPeak = 0.08,
    delay = 0,
  ) {
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, out } = audio;

    try {
      const now = ctx.currentTime + delay;
      const src = ctx.createBufferSource();
      src.buffer = this.getNoiseBuffer(ctx);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(2.2, now);
      filter.frequency.setValueAtTime(freqStart, now);
      filter.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      src.start(now);
      src.stop(now + duration + 0.02);
    } catch {
      // Ignore blocked playback
    }
  }

  playPickup() {
    this.playTone(300, 0.065, {
      freqEnd: 590,
      type: 'sine',
      gainPeak: 0.11,
      attack: 0.005,
    });
    this.playTone(760, 0.03, {
      type: 'triangle',
      gainPeak: 0.045,
      attack: 0.003,
    });
  }

  playHoverSnap() {
    const nowMs = performance.now();
    if (nowMs - this.lastSnapAt < 45) return;
    this.lastSnapAt = nowMs;
    this.playTone(780, 0.022, {
      freqEnd: 920,
      type: 'sine',
      gainPeak: 0.024,
      attack: 0.003,
    });
  }

  playPlace() {
    // Tactile low-mid thock + crisp marimba knock
    this.playTone(195, 0.095, {
      freqEnd: 78,
      type: 'triangle',
      gainPeak: 0.16,
      attack: 0.004,
    });
    this.playTone(520, 0.055, {
      freqEnd: 340,
      type: 'sine',
      gainPeak: 0.08,
      attack: 0.003,
      delay: 0.006,
    });
    this.playShimmerNoise(0.04, 1400, 700, 0.035, 0);
  }

  playClear(linesCount: number, combo: number) {
    // Chromatic pitch escalation per active combo step (like Video 2 Combo 1 -> 9!)
    const semitones = Math.min(Math.max(0, combo - 1), 11);
    const pitchMult = Math.pow(2, semitones / 12);
    const root = 523.25 * pitchMult; // Starts at C5

    // Shatter / laser whoosh texture
    this.playShimmerNoise(
      0.22 + Math.min(linesCount, 4) * 0.04,
      1100 * Math.min(pitchMult, 1.5),
      3900 * Math.min(pitchMult, 1.5),
      0.08 + Math.min(linesCount, 3) * 0.02,
      0,
    );

    // Sub punch for multi-line or combo >= 2
    if (linesCount >= 2 || combo >= 2) {
      this.playTone(130, 0.18, {
        freqEnd: 48,
        type: 'sine',
        gainPeak: 0.16,
        attack: 0.005,
      });
    }

    // Bright ascending bell arpeggio + harmonic shimmer
    const intervals =
      linesCount >= 3
        ? [1, 1.25, 1.5, 1.875, 2, 2.5]
        : linesCount === 2
          ? [1, 1.25, 1.5, 2, 2.25]
          : [1, 1.25, 1.5, 2];

    intervals.forEach((ratio, idx) => {
      const delay = idx * 0.042;
      const freq = root * ratio;
      this.playTone(freq, 0.28, {
        type: 'triangle',
        gainPeak: 0.11,
        attack: 0.006,
        delay,
      });
      // Bell overtone
      this.playTone(freq * 2, 0.18, {
        type: 'sine',
        gainPeak: 0.04,
        attack: 0.004,
        delay,
      });
    });
  }

  playAllClear() {
    // Rapid 8-step rainbow sweep + major-9th celebration fanfare
    const scale = [
      523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51,
    ];
    this.playShimmerNoise(0.45, 900, 4800, 0.11, 0);
    this.playTone(110, 0.35, {
      freqEnd: 55,
      type: 'triangle',
      gainPeak: 0.18,
      attack: 0.006,
    });

    scale.forEach((freq, idx) => {
      const delay = idx * 0.038;
      this.playTone(freq, 0.32, {
        type: 'triangle',
        gainPeak: 0.11,
        attack: 0.005,
        delay,
      });
      this.playTone(freq * 1.5, 0.22, {
        type: 'sine',
        gainPeak: 0.045,
        attack: 0.005,
        delay: delay + 0.01,
      });
    });

    // Final triumphant chord
    const chord = [523.25, 659.25, 783.99, 1046.5, 1174.66, 1567.98];
    chord.forEach((freq) => {
      this.playTone(freq, 0.55, {
        type: 'triangle',
        gainPeak: 0.075,
        attack: 0.015,
        delay: 0.31,
      });
    });
  }

  playLevelWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.34, {
        type: 'triangle',
        gainPeak: 0.11,
        attack: 0.008,
        delay: idx * 0.065,
      });
      this.playTone(freq * 2, 0.2, {
        type: 'sine',
        gainPeak: 0.035,
        attack: 0.006,
        delay: idx * 0.065,
      });
    });
  }

  playInvalid() {
    this.playTone(175, 0.08, {
      freqEnd: 120,
      type: 'sawtooth',
      gainPeak: 0.05,
      attack: 0.004,
    });
    this.playTone(135, 0.09, {
      freqEnd: 98,
      type: 'triangle',
      gainPeak: 0.06,
      attack: 0.004,
      delay: 0.05,
    });
  }

  playDeal() {
    const popNotes = [392.0, 493.88, 587.33];
    popNotes.forEach((freq, idx) => {
      this.playTone(freq * 0.85, 0.065, {
        freqEnd: freq,
        type: 'sine',
        gainPeak: 0.055,
        attack: 0.005,
        delay: idx * 0.042,
      });
    });
  }

  playGameOver() {
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.22, {
        freqEnd: freq * 0.96,
        type: 'triangle',
        gainPeak: 0.095,
        attack: 0.008,
        delay: idx * 0.12,
      });
    });
  }

  playScoreTick(progressRatio = 0.5) {
    const clamped = Math.max(0, Math.min(1, progressRatio));
    this.playTone(480 + clamped * 440, 0.035, {
      type: 'sine',
      gainPeak: 0.04,
      attack: 0.003,
    });
  }
}

export const soundEngine = new SoundEngine();
