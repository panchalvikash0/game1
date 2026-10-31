import React, { useRef, useEffect } from 'react';
import { MorphType } from '../types/game';
import { MORPH_PRESETS } from '../game/physics';
import { Circle, Maximize2, ArrowUpCircle, Square, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  currentMorph: MorphType;
  onMorphChange: (morph: MorphType) => void;
  onJump: () => void;
  onTouchMove: (input: { x: number; z: number }) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  currentMorph,
  onMorphChange,
  onJump,
  onTouchMove,
}) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const base = baseRef.current;
    const handle = handleRef.current;
    if (!base || !handle) return;

    const center = 55;
    const radius = 40;

    const updateStick = (t: Touch) => {
      const rect = base.getBoundingClientRect();
      const dx = t.clientX - rect.left - center;
      const dy = t.clientY - rect.top - center;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, radius);
      const nx = Math.cos(angle) * clampedDist;
      const ny = Math.sin(angle) * clampedDist;

      handle.style.transform = `translate(${nx}px, ${ny}px)`;
      onTouchMove({
        x: nx / radius,
        z: ny / radius,
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      touchIdRef.current = t.identifier;
      updateStick(t);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          updateStick(e.changedTouches[i]);
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          touchIdRef.current = null;
          handle.style.transform = 'translate(0px, 0px)';
          onTouchMove({ x: 0, z: 0 });
          break;
        }
      }
    };

    base.addEventListener('touchstart', handleTouchStart, { passive: false });
    base.addEventListener('touchmove', handleTouchMove, { passive: false });
    base.addEventListener('touchend', handleTouchEnd, { passive: false });
    base.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      base.removeEventListener('touchstart', handleTouchStart);
      base.removeEventListener('touchmove', handleTouchMove);
      base.removeEventListener('touchend', handleTouchEnd);
      base.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onTouchMove]);

  const morphKeys: MorphType[] = ['SPHERE', 'PANCAKE', 'TENDRIL', 'BLOCK', 'URCHIN'];

  const getIcon = (id: MorphType) => {
    switch (id) {
      case 'SPHERE': return <Circle className="w-5 h-5" />;
      case 'PANCAKE': return <Maximize2 className="w-5 h-5 rotate-45" />;
      case 'TENDRIL': return <ArrowUpCircle className="w-5 h-5" />;
      case 'BLOCK': return <Square className="w-5 h-5" />;
      case 'URCHIN': return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-4 pb-6 select-none">
      {/* Virtual Joystick */}
      <div
        ref={baseRef}
        className="pointer-events-auto relative w-28 h-28 rounded-full bg-stone-900/60 backdrop-blur-xs border-2 border-dashed border-stone-400/40 shadow-xl touch-none flex items-center justify-center active:border-amber-400/80"
      >
        <div
          ref={handleRef}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-200/60 shadow-lg pointer-events-none transition-transform duration-75"
        />
      </div>

      {/* Action Deck: Morph buttons + Jump */}
      <div className="pointer-events-auto flex flex-col items-end gap-3 touch-none">
        {/* Quick Morph Bar */}
        <div className="flex gap-2 bg-stone-900/80 p-1.5 rounded-2xl border border-stone-700/60 shadow-lg">
          {morphKeys.map((type) => {
            const active = currentMorph === type;
            const cfg = MORPH_PRESETS[type];
            return (
              <button
                key={type}
                onClick={() => onMorphChange(type)}
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all active:scale-90 ${
                  active
                    ? 'bg-amber-600 text-white border-2 border-white shadow-md scale-105'
                    : 'bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700'
                }`}
                title={cfg.name}
              >
                {getIcon(type)}
                <span className="text-[9px] mt-0.5 leading-none">{cfg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Big Jump Button */}
        <button
          onClick={onJump}
          className="w-18 h-18 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-500 active:from-emerald-600 active:to-emerald-400 text-white font-black text-sm tracking-wide uppercase border-3 border-emerald-300 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all"
        >
          <ArrowUpCircle className="w-6 h-6 mb-0.5" />
          Jump
        </button>
      </div>
    </div>
  );
};
