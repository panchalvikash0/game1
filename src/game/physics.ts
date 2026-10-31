import * as THREE from 'three';
import { MorphConfig, MorphType, LevelObstacle } from '../types/game';
import { sounds } from '../audio/soundEffects';
import { LevelMeshBuilder } from './levels';

export const MORPH_PRESETS: Record<MorphType, MorphConfig> = {
  SPHERE: {
    id: 'SPHERE',
    name: 'Sphere',
    keyLabel: '1',
    iconName: 'Circle',
    description: 'Balanced rolling speed & standard jump. Rolls down slopes easily.',
    scale: [1.0, 1.0, 1.0],
    speed: 12.0,
    jumpVelocity: 11.5,
    mass: 1.0,
    color: '#e05638',
  },
  PANCAKE: {
    id: 'PANCAKE',
    name: 'Cake',
    keyLabel: '2',
    iconName: 'Maximize2',
    description: 'Flattened out to 0.35 height. Slides under low arches and narrow slots.',
    scale: [1.68, 0.34, 1.68],
    speed: 7.2,
    jumpVelocity: 6.0,
    mass: 0.9,
    color: '#e28743',
  },
  TENDRIL: {
    id: 'TENDRIL',
    name: 'Tall',
    keyLabel: '3',
    iconName: 'ArrowUpCircle',
    description: 'Stretched tall pillar. Super spring jump to reach high ledges.',
    scale: [0.55, 2.3, 0.55],
    speed: 8.4,
    jumpVelocity: 18.0,
    mass: 1.1,
    color: '#7fb069',
  },
  BLOCK: {
    id: 'BLOCK',
    name: 'Brick',
    keyLabel: '4',
    iconName: 'Square',
    description: 'Heavy solid block. Triggers heavy pressure plates & resists wind fans.',
    scale: [1.25, 1.25, 1.25],
    speed: 6.2,
    jumpVelocity: 7.5,
    mass: 3.5,
    color: '#9c413d',
  },
  URCHIN: {
    id: 'URCHIN',
    name: 'Bouncy',
    keyLabel: '5',
    iconName: 'Sparkles',
    description: 'High elasticity bouncy clay ball. Rapid bounce and lively momentum.',
    scale: [1.1, 1.1, 1.1],
    speed: 13.5,
    jumpVelocity: 13.8,
    mass: 1.15,
    color: '#9b5de5',
  },
};

export interface ParticleCrumb {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class PhysicsEngine {
  public pos: THREE.Vector3 = new THREE.Vector3(0, 0.7, 7);
  public vel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public targetScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);
  public currentScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);
  public currentMorph: MorphType = 'SPHERE';
  public isGrounded: boolean = true;
  public squashWobble: number = 0;
  public particles: ParticleCrumb[] = [];
  public particleGroup: THREE.Group = new THREE.Group();

  constructor(scene: THREE.Scene) {
    this.particleGroup.name = 'ClayParticles';
    scene.add(this.particleGroup);
  }

  public setMorph(morph: MorphType) {
    if (this.currentMorph === morph) return;
    this.currentMorph = morph;
    const cfg = MORPH_PRESETS[morph];
    this.targetScale.set(...cfg.scale);
    sounds.playMorph(morph);

    // Spawn morph burst crumbs
    this.spawnClayCrumbs(this.pos, cfg.color, 14);
  }

  public jump(): boolean {
    if (!this.isGrounded) return false;
    const cfg = MORPH_PRESETS[this.currentMorph];
    this.vel.y = cfg.jumpVelocity;
    this.isGrounded = false;
    sounds.playJump(this.currentMorph === 'TENDRIL');
    return true;
  }

  public spawnClayCrumbs(center: THREE.Vector3, colorHex: string, count: number = 10) {
    const geom = new THREE.DodecahedronGeometry(0.08, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.9,
      flatShading: true,
    });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(center);
      mesh.position.x += (Math.random() - 0.5) * 0.6;
      mesh.position.y += Math.random() * 0.4;
      mesh.position.z += (Math.random() - 0.5) * 0.6;

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 3.5,
        Math.sin(angle) * speed
      );

      this.particleGroup.add(mesh);
      this.particles.push({
        mesh,
        vel,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
      });
    }
  }

  public update(
    delta: number,
    input: { x: number; z: number },
    obstacles: LevelObstacle[],
    meshBuilder: LevelMeshBuilder,
    onStarCollect?: () => void,
    onNuggetCollect?: () => void
  ) {
    const cfg = MORPH_PRESETS[this.currentMorph];

    // Lerp scale
    this.currentScale.lerp(this.targetScale, delta * 12.0);

    // Height and radius calculation
    const currentHeight = 0.7 * this.currentScale.y;
    const currentRadius = 0.7 * Math.max(this.currentScale.x, this.currentScale.z);

    // Input Movement
    const moveLen = Math.hypot(input.x, input.z);
    let mx = input.x;
    let mz = input.z;
    if (moveLen > 0) {
      mx /= moveLen;
      mz /= moveLen;
    }

    const targetVelX = mx * cfg.speed;
    const targetVelZ = mz * cfg.speed;

    // Responsive acceleration / deceleration
    const accelRate = this.isGrounded ? 18.0 : 8.0;
    this.vel.x = THREE.MathUtils.damp(this.vel.x, targetVelX, accelRate, delta);
    this.vel.z = THREE.MathUtils.damp(this.vel.z, targetVelZ, accelRate, delta);

    // Check Wind Fan zones
    obstacles.forEach((obs) => {
      if (obs.type === 'wind_fan' && obs.windForce) {
        // Wind zone along X
        const [fx, fy, fz] = obs.position;
        if (Math.abs(this.pos.z - fz) < 6 && this.pos.x > fx && this.pos.x < fx + 16) {
          // Force inversely related to mass
          const forceX = obs.windForce[0] / (cfg.mass * 1.3);
          this.vel.x += forceX * delta;
        }
      }
    });

    // Gravity
    this.vel.y -= 30.0 * delta;

    // Save previous Y for landing detection
    const prevY = this.pos.y;

    // Integrate
    this.pos.x += this.vel.x * delta;
    this.pos.y += this.vel.y * delta;
    this.pos.z += this.vel.z * delta;

    // Workbench Boundaries (clamp so player stays on table)
    const tableLimitX = 23;
    const tableLimitZ = 28;
    if (this.pos.x < -tableLimitX) { this.pos.x = -tableLimitX; this.vel.x = 0; }
    if (this.pos.x > tableLimitX) { this.pos.x = tableLimitX; this.vel.x = 0; }
    if (this.pos.z < -tableLimitZ) { this.pos.z = -tableLimitZ; this.vel.z = 0; }
    if (this.pos.z > tableLimitZ) { this.pos.z = tableLimitZ; this.vel.z = 0; }

    // Floor collision
    let groundHeight = currentHeight;
    let standingOnObject = false;

    // Collision with Obstacles
    obstacles.forEach((obs) => {
      if (obs.type === 'box') {
        const [bx, by, bz] = obs.position;
        const [bw, bh, bd] = obs.size;

        const minX = bx - bw / 2;
        const maxX = bx + bw / 2;
        const minZ = bz - bd / 2;
        const maxZ = bz + bd / 2;
        const topY = by + bh / 2;

        // Check if inside box XZ bounds with radius tolerance
        if (
          this.pos.x >= minX - currentRadius * 0.8 &&
          this.pos.x <= maxX + currentRadius * 0.8 &&
          this.pos.z >= minZ - currentRadius * 0.8 &&
          this.pos.z <= maxZ + currentRadius * 0.8
        ) {
          // Check if landing on top surface
          if (
            this.pos.y - currentHeight <= topY + 0.1 &&
            prevY - currentHeight >= topY - 0.25 &&
            this.vel.y <= 0
          ) {
            groundHeight = Math.max(groundHeight, topY + currentHeight);
            standingOnObject = true;
          } else if (this.pos.y - currentHeight < topY - 0.1) {
            // Push player outside sides
            const penLeft = this.pos.x - (minX - currentRadius);
            const penRight = (maxX + currentRadius) - this.pos.x;
            const penFront = (maxZ + currentRadius) - this.pos.z;
            const penBack = this.pos.z - (minZ - currentRadius);

            const minPen = Math.min(penLeft, penRight, penFront, penBack);
            if (minPen === penLeft) { this.pos.x = minX - currentRadius; this.vel.x = 0; }
            else if (minPen === penRight) { this.pos.x = maxX + currentRadius; this.vel.x = 0; }
            else if (minPen === penBack) { this.pos.z = minZ - currentRadius; this.vel.z = 0; }
            else if (minPen === penFront) { this.pos.z = maxZ + currentRadius; this.vel.z = 0; }
          }
        }
      } else if (obs.type === 'arch') {
        const [ax, , az] = obs.position;
        const [aw, , ad] = obs.size;
        const clearance = obs.clearance ?? 0.85;

        // Check if player is near arch crossbar
        const inArchZ = Math.abs(this.pos.z - az) < (ad / 2 + currentRadius);
        const inArchX = Math.abs(this.pos.x - ax) < (aw / 2 - 0.7);

        if (inArchZ && inArchX) {
          const topOfHead = this.pos.y + currentHeight;
          if (topOfHead > clearance) {
            // Too tall! Block passage through arch
            if (this.vel.z < 0) {
              this.pos.z = az + (ad / 2 + currentRadius);
              this.vel.z = 0;
            } else if (this.vel.z > 0) {
              this.pos.z = az - (ad / 2 + currentRadius);
              this.vel.z = 0;
            }
          }
        }
      } else if (obs.type === 'pressure_plate') {
        const [px, , pz] = obs.position;
        const [pw, , pd] = obs.size;
        const plateMesh = meshBuilder.plateMeshes.get(obs.id);

        const onPlate =
          Math.abs(this.pos.x - px) < pw / 2 &&
          Math.abs(this.pos.z - pz) < pd / 2 &&
          this.pos.y <= currentHeight + 0.4;

        if (onPlate && cfg.mass >= (obs.requiredMass ?? 2.8)) {
          if (!obs.isTriggered) {
            obs.isTriggered = true;
            sounds.playSwitch();
          }
          if (plateMesh) {
            plateMesh.position.y = THREE.MathUtils.damp(plateMesh.position.y, 0.04, 15.0, delta);
          }

          // Open all gates in the level
          obstacles.forEach((g) => {
            if (g.type === 'gate') {
              g.isOpen = true;
              const gateMesh = meshBuilder.gateMeshes.get(g.id);
              if (gateMesh) {
                gateMesh.position.y = THREE.MathUtils.damp(gateMesh.position.y, 5.0, 6.0, delta);
              }
            }
          });
        } else if (!onPlate && plateMesh) {
          plateMesh.position.y = THREE.MathUtils.damp(plateMesh.position.y, 0.18, 10.0, delta);
        }
      } else if (obs.type === 'gate' && !obs.isOpen) {
        // Solid wall while shut
        const [gx, gy, gz] = obs.position;
        const [gw, , gd] = obs.size;
        if (Math.abs(this.pos.z - gz) < (gd / 2 + currentRadius) && Math.abs(this.pos.x - gx) < gw / 2) {
          if (this.vel.z < 0) {
            this.pos.z = gz + (gd / 2 + currentRadius);
            this.vel.z = 0;
          } else if (this.vel.z > 0) {
            this.pos.z = gz - (gd / 2 + currentRadius);
            this.vel.z = 0;
          }
        }
      } else if (obs.type === 'spring_pad') {
        const [sx, , sz] = obs.position;
        const [sw, , sd] = obs.size;
        if (
          Math.abs(this.pos.x - sx) < sw / 2 &&
          Math.abs(this.pos.z - sz) < sd / 2 &&
          this.pos.y <= currentHeight + 0.35
        ) {
          this.vel.y = 23.0;
          this.isGrounded = false;
          sounds.playJump(true);
          this.spawnClayCrumbs(this.pos, '#429665', 8);
        }
      } else if (obs.type === 'destructible' && (obs.health ?? 1) > 0) {
        const [dx, dy, dz] = obs.position;
        const [dw, dh, dd] = obs.size;

        if (
          Math.abs(this.pos.x - dx) < dw / 2 + currentRadius &&
          Math.abs(this.pos.z - dz) < dd / 2 + currentRadius &&
          Math.abs(this.pos.y - dy) < dh / 2 + currentHeight
        ) {
          if (this.currentMorph === 'BLOCK') {
            // Smash through!
            obs.health = 0;
            sounds.playSmash();
            this.spawnClayCrumbs(new THREE.Vector3(dx, dy, dz), '#a86a48', 25);
            const mesh = meshBuilder.destructibleMeshes.get(obs.id);
            if (mesh) {
              mesh.visible = false;
            }
          } else {
            // Block player
            if (this.vel.z < 0) {
              this.pos.z = dz + dd / 2 + currentRadius;
              this.vel.z = 0;
            } else if (this.vel.z > 0) {
              this.pos.z = dz - (dd / 2 + currentRadius);
              this.vel.z = 0;
            }
          }
        }
      }
    });

    // Floor contact resolution
    if (this.pos.y <= groundHeight) {
      if (!this.isGrounded && prevY > groundHeight + 0.1) {
        // Landing impact
        const landSpeed = Math.abs(this.vel.y);
        sounds.playLand(Math.min(2.0, landSpeed / 8.0));
        this.squashWobble = Math.min(1.5, landSpeed * 0.12);
        this.spawnClayCrumbs(new THREE.Vector3(this.pos.x, groundHeight, this.pos.z), cfg.color, 5);
      }
      this.pos.y = groundHeight;
      this.vel.y = 0;
      this.isGrounded = true;
    } else if (!standingOnObject && this.pos.y > groundHeight + 0.05) {
      this.isGrounded = false;
    }

    // Squash wobble decay
    this.squashWobble = THREE.MathUtils.damp(this.squashWobble, 0, 8.0, delta);

    // Goal Star Check
    if (meshBuilder.starMesh && onStarCollect) {
      const starPos = meshBuilder.starMesh.position;
      const dist = this.pos.distanceTo(starPos);
      if (dist < 1.6) {
        onStarCollect();
      }
    }

    // Bonus Nuggets Check
    meshBuilder.nuggetMeshes.forEach((nugget) => {
      if (!nugget.collected) {
        const nPos = new THREE.Vector3(...nugget.pos);
        if (this.pos.distanceTo(nPos) < 1.1) {
          nugget.collected = true;
          nugget.mesh.visible = false;
          sounds.playNugget();
          this.spawnClayCrumbs(nPos, '#38bdf8', 10);
          if (onNuggetCollect) onNuggetCollect();
        }
      }
    });

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      p.vel.y -= 25.0 * delta;
      p.mesh.position.addScaledVector(p.vel, delta);
      if (p.mesh.position.y < 0.05) {
        p.mesh.position.y = 0.05;
        p.vel.y = -p.vel.y * 0.35;
        p.vel.x *= 0.6;
        p.vel.z *= 0.6;
      }
      const scale = Math.max(0.01, 1 - p.life / p.maxLife);
      p.mesh.scale.setScalar(scale);

      if (p.life >= p.maxLife) {
        this.particleGroup.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  public resetPosition(spawn: [number, number, number]) {
    this.pos.set(...spawn);
    this.vel.set(0, 0, 0);
    this.setMorph('SPHERE');
    this.isGrounded = true;
    this.squashWobble = 0;
  }
}
