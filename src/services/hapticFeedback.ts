// Haptic Feedback Engine utilizing the Web Vibration API
// Provides distinct, low-latency tactile pulses for footswitch presses, holds, and bank changes.

export type HapticStyle = 'crisp' | 'firm' | 'double' | 'soft';

class HapticService {
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
  }

  public checkSupport(): boolean {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      this.isSupported = 'vibrate' in navigator && typeof navigator.vibrate === 'function';
    } else {
      this.isSupported = false;
    }
    return this.isSupported;
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Distinct tactile pulse when a footswitch is stomped down
   */
  public triggerPressDown(style: HapticStyle = 'crisp'): boolean {
    if (!this.checkSupport()) return false;
    try {
      switch (style) {
        case 'firm':
          return navigator.vibrate(35);
        case 'double':
          return navigator.vibrate([15, 30, 20]);
        case 'soft':
          return navigator.vibrate(12);
        case 'crisp':
        default:
          return navigator.vibrate(22);
      }
    } catch {
      return false;
    }
  }

  /**
   * Subtle tactile release pulse
   */
  public triggerPressUp(): boolean {
    if (!this.checkSupport()) return false;
    try {
      return navigator.vibrate(10);
    } catch {
      return false;
    }
  }

  /**
   * Heavy double pulse when a secondary long-press hold action is engaged
   */
  public triggerHoldEngaged(): boolean {
    if (!this.checkSupport()) return false;
    try {
      return navigator.vibrate([35, 45, 55]);
    } catch {
      return false;
    }
  }

  /**
   * Tactile notification pulse when switching presets or banks
   */
  public triggerBankChange(): boolean {
    if (!this.checkSupport()) return false;
    try {
      return navigator.vibrate([20, 25, 20]);
    } catch {
      return false;
    }
  }

  /**
   * Stop all ongoing vibration patterns
   */
  public cancel(): void {
    if (this.checkSupport()) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }
}

export const haptic = new HapticService();
