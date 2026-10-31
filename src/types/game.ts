export type MorphType = 'SPHERE' | 'PANCAKE' | 'TENDRIL' | 'BLOCK' | 'URCHIN';

export interface MorphConfig {
  id: MorphType;
  name: string;
  keyLabel: string;
  iconName: string;
  description: string;
  scale: [number, number, number];
  speed: number;
  jumpVelocity: number;
  mass: number; // For pressure plates and wind resistance
  color: string;
}

export interface ClayColorPreset {
  id: string;
  name: string;
  hex: string;
}

export interface LevelStar {
  x: number;
  y: number;
  z: number;
  collected?: boolean;
}

export interface LevelObstacle {
  id: string;
  type: 'box' | 'arch' | 'pressure_plate' | 'gate' | 'wind_fan' | 'destructible' | 'spring_pad';
  position: [number, number, number];
  size: [number, number, number];
  color?: number;
  clearance?: number; // for arch
  requiredMass?: number; // for pressure plate
  isTriggered?: boolean;
  isOpen?: boolean;
  windForce?: [number, number, number];
  health?: number;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  hint: string;
  spawnPoint: [number, number, number];
  starPosition: [number, number, number];
  bonusNuggets: [number, number, number][];
  obstacles: LevelObstacle[];
  targetTimeSeconds: number;
}

export interface GameStats {
  levelId: number;
  starsCollected: number;
  totalNuggets: number;
  nuggetsCollected: number;
  elapsedSeconds: number;
  isComplete: boolean;
}
