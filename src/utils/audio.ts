// Web Audio API Procedural Synthesizer for Clean, Dynamic Nature Soundscapes
// Generates completely client-side syntheses (breeze, birds chirping, rain, industrial rumbles)
// with zero external audio assets or downloads.

class EcoAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private currentState: 'optimal' | 'moderate' | 'degraded' = 'optimal';

  // Audio Nodes refs
  private windNoise: AudioWorkletNode | ScriptProcessorNode | null = null;
  private windGain: GainNode | null = null;
  private birdTimer: number | null = null;
  private rainNoise: ScriptProcessorNode | null = null;
  private rainGain: GainNode | null = null;
  private industrialHum: OscillatorNode | null = null;
  private industrialGain: GainNode | null = null;

  constructor() {
    // Lazy initialisation happens upon user active toggle
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Synthesize white/pink noise buffer
  private createNoiseNode(bufferSize: number = 4096): ScriptProcessorNode | null {
    if (!this.ctx) return null;
    try {
      const node = this.ctx.createScriptProcessor(bufferSize, 1, 1);
      node.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          // White noise calculation
          output[i] = Math.random() * 2 - 1;
        }
      };
      return node;
    } catch (e) {
      console.warn('Script processor fallback unsupported or failed', e);
      return null;
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.initCtx();
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  public updateState(state: 'optimal' | 'moderate' | 'degraded') {
    this.currentState = state;
    if (!this.isMuted) {
      // Smoothly crossfade current synthesis nodes
      this.transitionAmbient();
    }
  }

  private startAmbient() {
    if (!this.ctx) return;
    this.stopAmbient(); // Safeguard duplication

    try {
      // 1. Create main master elements
      const destination = this.ctx.destination;

      // 2. Setup Wind/Breeze Node (Used in optimal & moderate states)
      this.windNoise = this.createNoiseNode();
      if (this.windNoise) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 2.0;

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(0, this.ctx.currentTime);

        // Modulate filter frequency to simulate swelling gust of breeze
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15; // Swell back and forth every 6.6 seconds
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 150;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        this.windNoise.connect(filter);
        filter.connect(this.windGain);
        this.windGain.connect(destination);
      }

      // 3. Setup Rain Noise Node (Used in moderate and degraded states)
      this.rainNoise = this.createNoiseNode();
      if (this.rainNoise) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1200;

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);

        this.rainNoise.connect(filter);
        filter.connect(this.rainGain);
        this.rainGain.connect(destination);
      }

      // 4. Setup Industrial Hum Node (Used in degraded state)
      this.industrialHum = this.ctx.createOscillator();
      this.industrialHum.type = 'sawtooth';
      this.industrialHum.frequency.value = 55; // Double low bass note (A1)
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 110;

      this.industrialGain = this.ctx.createGain();
      this.industrialGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.industrialHum.connect(filter);
      filter.connect(this.industrialGain);
      this.industrialGain.connect(destination);
      this.industrialHum.start();

      // Trigger initial state volume setup
      this.transitionAmbient();

      // 5. Active scheduling of bird chirps for Optimal environments
      this.scheduleBirdChirps();
    } catch (e) {
      console.warn("Failed to initiate procedural nature synthesizers", e);
    }
  }

  private transitionAmbient() {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const fadeTime = 1.5; // Smooth transitions over 1.5s

    // Reset everything to safe levels before applying state gains
    if (this.windGain) this.windGain.gain.setValueAtTime(this.windGain.gain.value, t);
    if (this.rainGain) this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, t);
    if (this.industrialGain) this.industrialGain.gain.setValueAtTime(this.industrialGain.gain.value, t);

    if (this.currentState === 'optimal') {
      // Wind: gentle; Rain: none; Hum: none
      if (this.windGain) this.windGain.gain.linearRampToValueAtTime(0.08, t + fadeTime);
      if (this.rainGain) this.rainGain.gain.linearRampToValueAtTime(0, t + fadeTime);
      if (this.industrialGain) this.industrialGain.gain.linearRampToValueAtTime(0, t + fadeTime);
    } else if (this.currentState === 'moderate') {
      // Wind: louder; Rain: drizzling; Hum: none
      if (this.windGain) this.windGain.gain.linearRampToValueAtTime(0.06, t + fadeTime);
      if (this.rainGain) this.rainGain.gain.linearRampToValueAtTime(0.015, t + fadeTime);
      if (this.industrialGain) this.industrialGain.gain.linearRampToValueAtTime(0, t + fadeTime);
    } else {
      // Wind: choking; Rain: acidic; Hum: active hum
      if (this.windGain) this.windGain.gain.linearRampToValueAtTime(0.03, t + fadeTime);
      if (this.rainGain) this.rainGain.gain.linearRampToValueAtTime(0.025, t + fadeTime);
      if (this.industrialGain) this.industrialGain.gain.linearRampToValueAtTime(0.08, t + fadeTime);
    }
  }

  // Birds Chirp Synthesizer Loop (Triggered procedurally)
  private scheduleBirdChirps() {
    if (this.birdTimer) {
      window.clearTimeout(this.birdTimer);
    }

    const nextInterval = 4000 + Math.random() * 8000; // Chirp every 4 - 12 seconds
    this.birdTimer = window.setTimeout(() => {
      if (!this.isMuted && this.currentState === 'optimal' && this.ctx) {
        this.synthesizeSingleBirdChirp();
      }
      this.scheduleBirdChirps();
    }, nextInterval);
  }

  private synthesizeSingleBirdChirp() {
    if (!this.ctx || this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      // Synthesize rapid frequency sweep for realistic bird chirp
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
      // Sweeping pitch upward
      osc.frequency.exponentialRampToValueAtTime(2200 + Math.random() * 600, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.22);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.012, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      // Audio context might be temporarily busy
    }
  }

  private stopAmbient() {
    if (this.birdTimer) {
      window.clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }

    try {
      if (this.windNoise) {
        this.windNoise.disconnect();
        this.windNoise = null;
      }
      if (this.rainNoise) {
        this.rainNoise.disconnect();
        this.rainNoise = null;
      }
      if (this.industrialHum) {
        this.industrialHum.stop();
        this.industrialHum.disconnect();
        this.industrialHum = null;
      }
      this.windGain = null;
      this.rainGain = null;
      this.industrialGain = null;
    } catch (e) {
      // Squelch close errors
    }
  }
}

export const ecoAudio = new EcoAudioSynth();
