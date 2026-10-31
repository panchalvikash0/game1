import React, { useState } from 'react';
import { MorphType, LevelData, ClayColorPreset } from '../types/game';
import { MORPH_PRESETS } from '../game/physics';
import {
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Circle,
  Maximize2,
  ArrowUpCircle,
  Square,
  Sparkles,
  Smartphone,
  Trophy,
  ArrowRight,
  Sparkle,
} from 'lucide-react';

export const CLAY_COLORS: ClayColorPreset[] = [
  { id: 'terracotta', name: 'Terracotta', hex: '#e05638' },
  { id: 'mint', name: 'Mint Green', hex: '#48b886' },
  { id: 'ocean', name: 'Azure Blue', hex: '#2563eb' },
  { id: 'mustard', name: 'Clay Ochre', hex: '#d97706' },
  { id: 'berry', name: 'Plum Berry', hex: '#db2777' },
  { id: 'lavender', name: 'Lavender', hex: '#9333ea' },
  { id: 'dough', name: 'Natural Dough', hex: '#d4b996' },
];

interface HUDProps {
  currentLevel: LevelData;
  levels: LevelData[];
  currentMorph: MorphType;
  onMorphChange: (morph: MorphType) => void;
  onSelectLevel: (levelId: number) => void;
  onRestartLevel: () => void;
  onNextLevel: () => void;
  currentColor: string;
  onColorChange: (hex: string) => void;
  fps: number;
  onFPSChange: (fps: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  touchControlsActive: boolean;
  onToggleTouchControls: () => void;
  elapsedSeconds: number;
  nuggetsCollected: number;
  totalNuggets: number;
  isLevelComplete: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  currentLevel,
  levels,
  currentMorph,
  onMorphChange,
  onSelectLevel,
  onRestartLevel,
  onNextLevel,
  currentColor,
  onColorChange,
  fps,
  onFPSChange,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
  touchControlsActive,
  onToggleTouchControls,
  elapsedSeconds,
  nuggetsCollected,
  totalNuggets,
  isLevelComplete,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'morphs' | 'levels' | 'clay' | 'settings'>('morphs');
  const [showHelp, setShowHelp] = useState(false);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const morphKeys: MorphType[] = ['SPHERE', 'PANCAKE', 'TENDRIL', 'BLOCK', 'URCHIN'];

  const getMorphIcon = (id: MorphType) => {
    switch (id) {
      case 'SPHERE': return <Circle className="w-4 h-4" />;
      case 'PANCAKE': return <Maximize2 className="w-4 h-4 rotate-45" />;
      case 'TENDRIL': return <ArrowUpCircle className="w-4 h-4" />;
      case 'BLOCK': return <Square className="w-4 h-4" />;
      case 'URCHIN': return <Sparkles className="w-4 h-4" />;
    }
  };

  const activeMorphCfg = MORPH_PRESETS[currentMorph];

  return (
    <>
      {/* 1. Minimal Header / Status Bar (Top Left & Top Right) */}
      <header className="absolute top-3 left-3 right-3 z-20 pointer-events-none flex justify-between items-start select-none">
        {/* Level & Mission Badge */}
        <div className="pointer-events-auto bg-stone-900/90 text-stone-100 px-3.5 py-2 rounded-xl border border-stone-700/80 shadow-md flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400">
                Level {currentLevel.id}
              </span>
              <span className="text-xs text-stone-400">&bull;</span>
              <span className="text-xs font-mono font-medium text-stone-300">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
            <h1 className="text-sm font-bold text-stone-100 tracking-tight leading-tight">
              {currentLevel.title}
            </h1>
          </div>

          {/* Clay Nuggets counter */}
          <div className="ml-2 pl-3 border-l border-stone-700 flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
            <Sparkle className="w-3.5 h-3.5 fill-sky-400" />
            <span>
              {nuggetsCollected}/{totalNuggets}
            </span>
          </div>
        </div>

        {/* Current State & Action Bar */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Active Morph Pill */}
          <div className="bg-stone-900/90 border border-stone-700/80 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-white/50"
              style={{ backgroundColor: activeMorphCfg.color }}
            />
            <span className="text-xs font-bold text-stone-200 tracking-wide uppercase">
              {activeMorphCfg.name}
            </span>
          </div>

          {/* Quick Level Restart */}
          <button
            onClick={onRestartLevel}
            title="Restart Level (R)"
            className="p-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 shadow-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            title="How to Play"
            className="p-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 shadow-md transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Top-Center Level Hint Toast */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none max-w-md w-full px-4 text-center">
        <div className="inline-block bg-stone-900/80 text-amber-200 text-xs px-3.5 py-1.5 rounded-full border border-amber-900/50 shadow-sm">
          💡 {currentLevel.hint}
        </div>
      </div>

      {/* 3. Unified Bottom Control Dock (Zero Viewport Occlusion) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 transition-transform duration-300 ease-out select-none ${
          isDockCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Collapse / Expand Tab */}
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="bg-stone-900/95 hover:bg-stone-800 text-stone-400 hover:text-amber-400 px-4 py-1 rounded-t-lg border-t border-x border-stone-700/80 text-[11px] font-semibold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Collapse Dock (H)</span>
              </>
            )}
          </button>

          {/* Dock Main Body */}
          <div className="bg-stone-950/95 border border-stone-700/90 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2 max-w-[94vw] w-[620px]">
            {/* Dock Tabs Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-2 px-1">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveTab('morphs')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'morphs'
                      ? 'bg-amber-600 text-white'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  Shapes & Morphs
                </button>
                <button
                  onClick={() => setActiveTab('levels')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'levels'
                      ? 'bg-amber-600 text-white'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  Levels
                </button>
                <button
                  onClick={() => setActiveTab('clay')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'clay'
                      ? 'bg-amber-600 text-white'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  Clay Studio
                </button>
              </div>

              {/* Utility Toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onToggleSound}
                  title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    soundEnabled
                      ? 'bg-stone-800 text-amber-400 border-amber-600/50'
                      : 'bg-stone-900 text-stone-500 border-stone-800'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={onToggleMusic}
                  title={musicEnabled ? 'Stop Acoustic Workshop Music' : 'Play Acoustic Music'}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    musicEnabled
                      ? 'bg-stone-800 text-emerald-400 border-emerald-600/50'
                      : 'bg-stone-900 text-stone-500 border-stone-800'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onToggleTouchControls}
                  title="Toggle Mobile Touch Controls"
                  className={`p-1.5 rounded-lg border transition-colors ${
                    touchControlsActive
                      ? 'bg-stone-800 text-sky-400 border-sky-600/50'
                      : 'bg-stone-900 text-stone-500 border-stone-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tab 1: Morphs Selector */}
            {activeTab === 'morphs' && (
              <div className="flex items-stretch gap-2 pt-0.5">
                {morphKeys.map((type) => {
                  const cfg = MORPH_PRESETS[type];
                  const isCurrent = currentMorph === type;
                  return (
                    <button
                      key={type}
                      onClick={() => onMorphChange(type)}
                      className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                        isCurrent
                          ? 'bg-stone-800 text-white border-amber-500 shadow-md scale-[1.02]'
                          : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:bg-stone-800/60 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: cfg.color }}>{getMorphIcon(type)}</span>
                        <span className="font-bold text-xs">{cfg.name}</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-stone-950 font-mono text-stone-400">
                          [{cfg.keyLabel}]
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 text-center leading-tight">
                        {type === 'SPHERE' && 'Roll & Jump'}
                        {type === 'PANCAKE' && 'Slide Under'}
                        {type === 'TENDRIL' && 'High Leap'}
                        {type === 'BLOCK' && 'Heavy Push'}
                        {type === 'URCHIN' && 'Super Bounce'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Levels Selector */}
            {activeTab === 'levels' && (
              <div className="flex items-center gap-2 pt-0.5">
                {levels.map((lvl) => {
                  const isCurrent = currentLevel.id === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => onSelectLevel(lvl.id)}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'bg-amber-600/20 border-amber-500 text-amber-200 shadow-sm'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {lvl.id === 5 ? 'Sandbox' : `Level ${lvl.id}`}
                      </div>
                      <div className="text-xs font-semibold truncate text-stone-200">
                        {lvl.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Clay Studio (Color + Stop-Motion FPS) */}
            {activeTab === 'clay' && (
              <div className="flex items-center justify-between gap-4 pt-0.5 px-1">
                {/* Clay Color Swatches */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-medium">Clay Color:</span>
                  <div className="flex gap-1.5">
                    {CLAY_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onColorChange(c.hex)}
                        title={c.name}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          currentColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'scale-125 border-white shadow-md'
                            : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Stop-Motion Frame Rate */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-medium">Stop-Motion:</span>
                  <div className="flex bg-stone-900 rounded-lg p-0.5 border border-stone-800 text-xs">
                    {[6, 12, 24, 60].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => onFPSChange(rate)}
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                          fps === rate
                            ? 'bg-amber-600 text-white'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {rate === 60 ? 'Smooth' : `${rate}fps`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Level Completed Victory Modal */}
      {isLevelComplete && (
        <div className="fixed inset-0 z-40 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-amber-500 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            <h2 className="text-2xl font-black text-amber-300 tracking-tight">
              Level Clear!
            </h2>
            <p className="text-stone-400 text-xs mt-1">
              {currentLevel.title} completed in{' '}
              <span className="text-amber-200 font-bold">{formatTime(elapsedSeconds)}</span>
            </p>

            <div className="bg-stone-800/80 rounded-2xl p-3 my-4 border border-stone-700/60 flex justify-around">
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-400">Goal Star</div>
                <div className="text-lg font-black text-amber-400">1 / 1 ⭐</div>
              </div>
              <div className="border-l border-stone-700" />
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-400">Clay Nuggets</div>
                <div className="text-lg font-black text-sky-400">
                  {nuggetsCollected} / {totalNuggets}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onRestartLevel}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm border border-stone-700 transition-colors"
              >
                Replay
              </button>
              <button
                onClick={onNextLevel}
                className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. How to Play & Help Dialog */}
      {showHelp && (
        <div className="fixed inset-0 z-40 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-amber-400 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              The Claymation Shifter Guide
            </h3>

            <div className="space-y-3 text-xs text-stone-300">
              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60">
                <div className="font-bold text-stone-100 mb-1">🎮 Keyboard Controls:</div>
                <ul className="space-y-1 text-stone-300">
                  <li>• <b className="text-amber-400">W, A, S, D</b> or <b className="text-amber-400">Arrow Keys</b>: Move / Roll</li>
                  <li>• <b className="text-amber-400">Spacebar</b>: Jump</li>
                  <li>• <b className="text-amber-400">[1] to [5]</b>: Shape-Shift Morph</li>
                  <li>• <b className="text-amber-400">R</b>: Restart Current Level</li>
                  <li>• <b className="text-amber-400">H</b>: Collapse / Show HUD Dock</li>
                </ul>
              </div>

              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60">
                <div className="font-bold text-stone-100 mb-1">🏺 Clay Morph Forms:</div>
                <div className="space-y-1.5">
                  <div>
                    <span className="font-bold text-amber-500">[1] Sphere:</span> Balanced roll speed and standard jump.
                  </div>
                  <div>
                    <span className="font-bold text-amber-500">[2] Pancake:</span> Flattens ultra-thin to slip under low archways, presses, and slots.
                  </div>
                  <div>
                    <span className="font-bold text-amber-500">[3] Tall Tendril:</span> Stretches high to spring onto tall stone ledges.
                  </div>
                  <div>
                    <span className="font-bold text-amber-500">[4] Brick Block:</span> Dense heavy clay that triggers pressure switches, breaks cracked tiles, and resists wind blowers.
                  </div>
                  <div>
                    <span className="font-bold text-amber-500">[5] Bouncy Urchin:</span> Extra springy bounce and momentum.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-colors"
            >
              Got it, Let's Mold!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
