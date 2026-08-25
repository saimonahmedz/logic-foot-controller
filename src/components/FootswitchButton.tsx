import React, { useState, useRef, useEffect } from 'react';
import { FootswitchConfig, AppTheme } from '../types';
import { haptic } from '../services/hapticFeedback';
import { Settings2 } from 'lucide-react';

interface FootswitchButtonProps {
  config: FootswitchConfig;
  isOn: boolean;
  theme?: AppTheme;
  largeFont?: boolean;
  vibrantGlow?: boolean;
  hapticFeedback?: boolean;
  hapticStyle?: 'crisp' | 'firm' | 'double' | 'soft';
  holdThresholdMs?: number;
  onPressDown: (index: number) => void;
  onPressUp: (index: number) => void;
  onLongPress: (index: number) => void;
  onConfigure: (config: FootswitchConfig) => void;
}

export const FootswitchButton: React.FC<FootswitchButtonProps> = ({
  config,
  isOn,
  theme = 'stage-night',
  largeFont = false,
  vibrantGlow = true,
  hapticFeedback = true,
  hapticStyle = 'crisp',
  holdThresholdMs = 450,
  onPressDown,
  onPressUp,
  onLongPress,
  onConfigure,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [longPressFired, setLongPressFired] = useState(false);
  const timerRef = useRef<number | null>(null);
  const progressAnimRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const HOLD_DURATION_MS = holdThresholdMs;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressed(true);
    setLongPressFired(false);
    setHoldProgress(0);
    startTimeRef.current = Date.now();

    // Trigger distinct tactile haptic pulse via Web Vibration API
    if (hapticFeedback) {
      haptic.triggerPressDown(hapticStyle);
    }

    onPressDown(config.index);

    if (config.longPressAction.isEnabled) {
      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
        setHoldProgress(progress);
        if (progress < 100) {
          progressAnimRef.current = requestAnimationFrame(updateProgress);
        }
      };
      progressAnimRef.current = requestAnimationFrame(updateProgress);

      timerRef.current = window.setTimeout(() => {
        setLongPressFired(true);
        setHoldProgress(100);
        if (hapticFeedback) {
          haptic.triggerHoldEngaged();
        }
        onLongPress(config.index);
      }, HOLD_DURATION_MS);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
      progressAnimRef.current = null;
    }
    setIsPressed(false);
    setHoldProgress(0);

    if (hapticFeedback && config.mode === 'Momentary') {
      haptic.triggerPressUp();
    }

    onPressUp(config.index);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (isPressed) {
      handlePointerUp(e);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
    };
  }, []);

  const ledColor = config.ledColorHex || '#38BDF8';
  const isLight = theme === 'studio-bright';
  const isAmber = theme === 'amber-glow';
  const isNeon = theme === 'high-contrast-neon';

  // Styling logic:
  // When ON (pressed/engaged): Solid rich color background fill, all interior text in pure white with no text shadows
  // When OFF: Neutral clean chassis background (no colored fill), clear pure white text in dark themes
  let buttonBg = '#0f131c';
  let buttonBorder = 'rgba(255,255,255,0.12)';
  const textColor = '#ffffff';
  const subColor = '#ffffff';

  if (isOn) {
    buttonBg = ledColor;
    buttonBorder = vibrantGlow ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.45)';
  } else {
    if (isLight) {
      buttonBg = isPressed ? '#e2e8f0' : '#ffffff';
      buttonBorder = '#cbd5e1';
    } else if (isAmber) {
      buttonBg = isPressed ? '#0d0907' : '#150e09';
      buttonBorder = '#3b1c09';
    } else if (isNeon) {
      buttonBg = isPressed ? '#09090b' : '#050507';
      buttonBorder = '#27272a';
    } else {
      // stage-night
      buttonBg = isPressed ? '#0b0e15' : '#0f131c';
      buttonBorder = 'rgba(255,255,255,0.12)';
    }
  }

  const glowShadow = isOn && vibrantGlow
    ? `0 0 32px ${ledColor}99, 0 4px 20px ${ledColor}bb, 0 0 4px #ffffff, inset 0 0 18px rgba(255, 255, 255, 0.35)`
    : isOn
      ? `0 2px 10px ${ledColor}60`
      : isLight
        ? '0 1px 3px rgba(0,0,0,0.06)'
        : 'none';

  return (
    <div
      id={`footswitch-${config.index}`}
      className={`footswitch-button relative select-none touch-none w-full flex flex-col justify-between rounded-[8px] p-2.5 sm:p-3 cursor-pointer group transition-colors duration-150 min-h-[98px] sm:min-h-[108px] md:min-h-[114px] overflow-hidden ${
        isOn ? 'border-2' : isNeon ? 'border-2' : isLight ? 'border-2' : 'border'
      }`}
      style={{
        backgroundColor: buttonBg,
        borderColor: buttonBorder,
        boxShadow: glowShadow,
        transform: isPressed ? 'scale(0.97) translateY(1.5px)' : 'scale(1)',
        transition: 'transform 75ms ease',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Luminous Inner Atmosphere when Engaged */}
      {isOn && vibrantGlow && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[6px] overflow-hidden opacity-80"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 65%), radial-gradient(circle at 50% 100%, ${ledColor}60 0%, transparent 75%)`,
          }}
        />
      )}

      {/* Linear Hold Progress Bar */}
      {config.longPressAction.isEnabled && holdProgress > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/40 overflow-hidden z-20">
          <div
            className="h-full transition-all duration-75 bg-white"
            style={{ width: `${holdProgress}%` }}
          />
        </div>
      )}

      {/* Top Header: Neatly aligned with slightly smaller fonts at the top, pure white, no text shadow */}
      <div className="flex items-center justify-between pointer-events-none gap-1 leading-none text-white [text-shadow:none] relative z-10">
        {/* Rectangular Status Indicator Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`w-1.5 h-1.5 rounded-[1.5px] border transition-all duration-200 flex items-center justify-center ${
              isOn
                ? 'border-white bg-white'
                : isLight
                  ? 'border-slate-400 bg-slate-200'
                  : 'border-white/50 bg-white/20'
            }`}
            style={{
              boxShadow: isOn && vibrantGlow ? `0 0 10px #ffffff, 0 0 18px ${ledColor}` : 'none',
            }}
          >
            {isOn && <div className="w-1 h-1 rounded-[0.5px] bg-black/90" />}
          </div>
          <span
            className={`text-[7px] sm:text-[7.5px] font-bold tracking-wider uppercase font-mono ${
              isOn
                ? 'text-white'
                : isLight
                  ? 'text-slate-700'
                  : 'text-white/90'
            }`}
          >
            {isOn ? 'ENGAGED' : 'OFF'}
          </span>
        </div>

        {/* Mode Tag & Switch Index */}
        <div className="flex items-center gap-1 shrink-0 font-mono">
          {config.longPressAction.isEnabled && (
            <span
              className={`text-[6.5px] sm:text-[7px] font-bold px-1 py-0.5 rounded-[2px] border leading-none ${
                isOn
                  ? 'bg-black/30 text-white border-white/30'
                  : isLight
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-purple-950/60 text-purple-200 border-purple-800/40'
              }`}
            >
              HOLD
            </span>
          )}
          <span
            className={`text-[6.5px] sm:text-[7px] font-bold px-1 py-0.5 rounded-[2px] border leading-none ${
              isOn
                ? 'bg-black/30 text-white border-white/30'
                : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-black/60 text-white/90 border-white/10'
            }`}
          >
            {config.mode === 'Momentary' ? 'MOM' : 'TOG'}
          </span>
          <span
            className={`text-[7px] sm:text-[7.5px] font-bold leading-none ${
              isOn
                ? 'text-white'
                : isLight
                  ? 'text-slate-700'
                  : 'text-white/90'
            }`}
          >
            SW{config.index + 1}
          </span>
        </div>
      </div>

      {/* Center Footswitch Content: Neatly centered, slightly reduced font size, pure white without text shadow */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-none py-1 text-center text-white [text-shadow:none] relative z-10">
        {/* Switch Tone Name Title */}
        <h3
          className={`font-black tracking-wide uppercase leading-tight line-clamp-1 text-white ${
            largeFont ? 'text-xs sm:text-[13px] md:text-sm' : 'text-[11px] sm:text-xs md:text-[12.5px]'
          }`}
          style={{ color: isLight && !isOn ? '#0f172a' : textColor }}
        >
          {config.name}
        </h3>

        {/* Tone Sub-label */}
        {config.subLabel && (
          <span
            className={`font-semibold tracking-normal line-clamp-1 text-[8px] sm:text-[8.5px] md:text-[9px] mt-0.5 ${
              isLight && !isOn ? 'text-slate-600' : 'text-white/95'
            }`}
            style={{ color: isLight && !isOn ? '#475569' : subColor }}
          >
            {config.subLabel}
          </span>
        )}
      </div>

      {/* Bottom Footer: MIDI payload info & Edit button (neatly aligned, slightly smaller font, pure white, no text shadow) */}
      <div
        className={`flex items-center justify-between pt-1.5 border-t gap-1.5 transition-colors leading-none text-white [text-shadow:none] relative z-10 ${
          isOn ? 'border-white/25' : isLight ? 'border-slate-200' : 'border-white/10'
        }`}
      >
        <span
          className={`text-[7.5px] sm:text-[8px] font-semibold font-mono truncate ${
            isOn
              ? 'text-white'
              : isLight
                ? 'text-slate-700'
                : 'text-white/90'
          }`}
        >
          {config.tapAction.midiType} #{config.tapAction.number}
        </span>

        {/* Gear Configure Button */}
        <button
          id={`configure-switch-${config.index}`}
          type="button"
          aria-label={`Configure switch ${config.index + 1}`}
          className={`p-1 rounded-[3px] transition-colors cursor-pointer active:scale-95 shrink-0 ${
            isOn
              ? 'bg-black/25 hover:bg-black/45 text-white border border-white/30'
              : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
                : 'bg-black/40 hover:bg-white/10 text-white/90 hover:text-white'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onConfigure(config);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Settings2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>
    </div>
  );
};
