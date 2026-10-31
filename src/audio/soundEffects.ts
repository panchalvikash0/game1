/**
 * Procedural Web Audio API Sound Generator for The Claymation Shifter
 * Zero external audio files; 100% synthesized sound design.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public musicEnabled: boolean = false;
  private musicInterval: number | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Squelchy morph sound
  public playMorph(type: string) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(8, t);

    if (type === 'PANCAKE') {
      // Squish down: high pitch slide down into splat
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.18);
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(250, t + 0.18);
    } else if (type === 'TENDRIL') {
      // Stretch up: low to high springy slide
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.22);
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(2200, t + 0.22);
    } else if (type === 'BLOCK') {
      // Heavy solid clop
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.15);
    } else if (type === 'URCHIN') {
      // Prickly burst
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.14);
      filter.frequency.setValueAtTime(2000, t);
      filter.frequency.exponentialRampToValueAtTime(900, t + 0.14);
    } else {
      // Sphere bounce pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.16);
      filter.frequency.setValueAtTime(1200, t);
    }

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Jump sound
  public playJump(isHigh: boolean = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isHigh ? 'triangle' : 'sine';
    const startFreq = isHigh ? 180 : 150;
    const endFreq = isHigh ? 640 : 340;
    const dur = isHigh ? 0.35 : 0.2;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  // Landing thud
  public playLand(intensity: number = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110 * intensity, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    const vol = Math.min(0.4, 0.25 * intensity);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Pressure plate activate
  public playSwitch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.setValueAtTime(780, t + 0.06);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // Collect nugget
  public playNugget() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.1); // A5

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Shatter clay block
  public playSmash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // Noise buffer for clay crumble
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 0.21);
  }

  // Star collection victory fanfare
  public playStarVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      const noteStart = t + idx * 0.08;
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.28, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteStart);
      osc.stop(noteStart + 0.42);
    });
  }

  // Whimsical stop-motion workshop acoustic rhythm
  public toggleMusic(enable?: boolean) {
    this.musicEnabled = enable !== undefined ? enable : !this.musicEnabled;
    if (this.musicEnabled) {
      this.init();
      this.startMusicLoop();
    } else {
      this.stopMusicLoop();
    }
    return this.musicEnabled;
  }

  private startMusicLoop() {
    this.stopMusicLoop();
    if (!this.ctx || !this.musicGain) return;

    // Charming gentle acoustic toy marimba / kalimba beat
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C major pentatonic
    let step = 0;

    const playStep = () => {
      if (!this.musicEnabled || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;

      // Bass note every 4 steps
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        const bassFreq = step % 8 === 0 ? 130.81 : 98.00; // C3 or G2
        bassOsc.frequency.setValueAtTime(bassFreq, t);
        bassGain.gain.setValueAtTime(0.18, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(t);
        bassOsc.stop(t + 0.3);
      }

      // Marimba melody note
      if (Math.random() > 0.3) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteIndex = Math.floor(Math.random() * scale.length);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(scale[noteIndex], t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.2);
      }

      // Stop-motion wooden click
      if (step % 2 === 1) {
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(800 + (step % 4) * 80, t);
        clickGain.gain.setValueAtTime(0.05, t);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        clickOsc.connect(clickGain);
        clickGain.connect(this.musicGain);
        clickOsc.start(t);
        clickOsc.stop(t + 0.05);
      }

      step++;
    };

    this.musicInterval = window.setInterval(playStep, 240);
  }

  private stopMusicLoop() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sounds = new SoundSystem();
