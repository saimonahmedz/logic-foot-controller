class AudioClickSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playClick(isOn: boolean, isHeavy = false, volumeMultiplier = 0.5) {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      osc.type = isHeavy ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isOn ? 180 : 120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.04);

      const baseGain = isHeavy ? 0.35 : 0.22;
      gain.gain.setValueAtTime(baseGain * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  public playHoldChime(volumeMultiplier = 0.5) {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.2 * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // AudioContext blocked
    }
  }
}

export const audioSynth = new AudioClickSynth();
