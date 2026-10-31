import * as THREE from 'three';
import { LevelData, LevelObstacle } from '../types/game';
import { makeClayMaterial, createCuttingMatTexture, createWoodTexture } from './clayShader';

export const LEVELS: LevelData[] = [
  {
    id: 1,
    title: 'The Mold Room',
    subtitle: 'Learn the core forms: Roll, Flatten, and Stretch',
    hint: 'Use [2] Pancake to slip under low arches, and [3] Tall Tendril to leap onto high ledges!',
    spawnPoint: [0, 0.7, 7],
    starPosition: [0, 3.8, -14],
    bonusNuggets: [
      [0, 0.7, 2],
      [0, 0.4, -6],
      [0, 3.4, -11],
    ],
    targetTimeSeconds: 20,
    obstacles: [
      // Archway obstacle at z = -6
      {
        id: 'arch-1',
        type: 'arch',
        position: [0, 0, -6],
        size: [7, 4.5, 1.2],
        clearance: 0.85, // Only Pancake (height < 0.5) fits
      },
      // High Ledge at z = -14
      {
        id: 'ledge-1',
        type: 'box',
        position: [0, 1.4, -14],
        size: [10, 2.8, 8],
        color: 0x5e5046,
      },
      // Side guide walls
      {
        id: 'side-l',
        type: 'box',
        position: [-6, 1.5, 0],
        size: [1, 3, 28],
        color: 0x6d5747,
      },
      {
        id: 'side-r',
        type: 'box',
        position: [6, 1.5, 0],
        size: [1, 3, 28],
        color: 0x6d5747,
      },
    ],
  },
  {
    id: 2,
    title: 'The Pottery Press',
    subtitle: 'Heavy weight triggers pressure plates & opens gates',
    hint: 'Morph into [4] Heavy Block to push down the pressure plate, then slip through before it shuts!',
    spawnPoint: [0, 0.7, 9],
    starPosition: [0, 4.2, -18],
    bonusNuggets: [
      [-3, 0.7, 3],
      [3, 0.7, -4],
      [0, 0.4, -12],
    ],
    targetTimeSeconds: 30,
    obstacles: [
      // Pressure Plate at z = 3 (needs mass >= 3.0 -> BLOCK)
      {
        id: 'plate-1',
        type: 'pressure_plate',
        position: [-2.5, 0.1, 2.5],
        size: [2.6, 0.2, 2.6],
        color: 0xc87d46,
        requiredMass: 2.8,
        isTriggered: false,
      },
      // Mechanical sliding gate at z = -2
      {
        id: 'gate-1',
        type: 'gate',
        position: [0, 2.0, -2],
        size: [8, 4, 1],
        color: 0x483a34,
        isOpen: false,
      },
      // Low tunnel with clay press rollers at z = -10
      {
        id: 'arch-2',
        type: 'arch',
        position: [0, 0, -10],
        size: [6, 4.0, 3],
        clearance: 0.75,
      },
      // Final Star platform
      {
        id: 'ledge-2',
        type: 'box',
        position: [0, 1.6, -18],
        size: [8, 3.2, 6],
        color: 0x5a483e,
      },
      // Spring pad at base of ledge
      {
        id: 'spring-1',
        type: 'spring_pad',
        position: [0, 0.15, -13],
        size: [2.2, 0.3, 2.2],
        color: 0x429665,
      },
    ],
  },
  {
    id: 3,
    title: 'Studio Wind & Gears',
    subtitle: 'Dense mass resists fierce workshop wind blowers',
    hint: 'Switch to [4] Block so the wind fan does not blow you off the narrow bridge!',
    spawnPoint: [0, 0.7, 10],
    starPosition: [0, 3.2, -19],
    bonusNuggets: [
      [0, 0.7, 4],
      [0, 0.7, -4],
      [0, 0.7, -12],
    ],
    targetTimeSeconds: 35,
    obstacles: [
      // Narrow suspended bridge
      {
        id: 'bridge-1',
        type: 'box',
        position: [0, 0.4, 0],
        size: [3.2, 0.8, 16],
        color: 0x6e5849,
      },
      // Wind blower fan on the left blowing rightward (+X)
      {
        id: 'fan-1',
        type: 'wind_fan',
        position: [-6, 1.5, 0],
        size: [1.8, 3, 10],
        color: 0x3d3532,
        windForce: [18.0, 0, 0], // Pushes player strongly right
      },
      // Destructible cracked clay barrier at z = -9 (smashable by Block)
      {
        id: 'crack-wall-1',
        type: 'destructible',
        position: [0, 1.5, -9],
        size: [3.4, 3, 1.0],
        color: 0xa86a48,
        health: 1,
      },
      // Low clearance gate at z = -14
      {
        id: 'arch-3',
        type: 'arch',
        position: [0, 0, -14],
        size: [6, 4, 1.2],
        clearance: 0.8,
      },
      // Goal platform at z = -19
      {
        id: 'ledge-3',
        type: 'box',
        position: [0, 1.2, -19],
        size: [6, 2.4, 6],
        color: 0x5a483e,
      },
    ],
  },
  {
    id: 4,
    title: "Master Sculptor's Citadel",
    subtitle: 'The ultimate stop-motion shifting gauntlet',
    hint: 'Combine all shapes seamlessly: Flatten through slots, shatter walls as a Block, and leap as a Tendril!',
    spawnPoint: [0, 0.7, 12],
    starPosition: [0, 6.4, -22],
    bonusNuggets: [
      [0, 0.4, 6],
      [-3, 0.7, -1],
      [3, 0.7, -8],
      [0, 3.5, -16],
    ],
    targetTimeSeconds: 45,
    obstacles: [
      // 1. Low entrance arch
      {
        id: 'c-arch-1',
        type: 'arch',
        position: [0, 0, 6],
        size: [6, 4, 1.2],
        clearance: 0.8,
      },
      // 2. Heavy pressure switch to drop drawbridge
      {
        id: 'c-plate-1',
        type: 'pressure_plate',
        position: [-2.5, 0.1, 0],
        size: [2.5, 0.2, 2.5],
        color: 0xc87d46,
        requiredMass: 2.8,
      },
      // Gate / barrier
      {
        id: 'c-gate-1',
        type: 'gate',
        position: [0, 2, -4],
        size: [8, 4, 1],
        color: 0x483a34,
        isOpen: false,
      },
      // 3. Cracked clay wall to smash through
      {
        id: 'c-smash-1',
        type: 'destructible',
        position: [0, 1.5, -10],
        size: [4, 3, 1],
        color: 0xa86a48,
        health: 1,
      },
      // 4. Multi-tier step pillars leading to high summit
      {
        id: 'step-1',
        type: 'box',
        position: [0, 1.0, -14],
        size: [4, 2.0, 3],
        color: 0x6e5849,
      },
      {
        id: 'step-2',
        type: 'box',
        position: [0, 2.4, -18],
        size: [4, 2.8, 3],
        color: 0x5a483e,
      },
      {
        id: 'step-3',
        type: 'box',
        position: [0, 4.2, -22],
        size: [5, 4.4, 5],
        color: 0x4d3d34,
      },
    ],
  },
  {
    id: 5,
    title: 'Workshop Sandbox & Sculptorium',
    subtitle: 'Free play arena with ramps, springs, and morph playgrounds',
    hint: 'Freely morph between shapes, adjust stop-motion speeds, and test custom clay colors!',
    spawnPoint: [0, 0.7, 6],
    starPosition: [0, 4.5, -10],
    bonusNuggets: [
      [-4, 0.7, 0],
      [4, 0.7, 0],
      [-4, 0.7, -8],
      [4, 0.7, -8],
      [0, 2.2, -4],
    ],
    targetTimeSeconds: 999,
    obstacles: [
      // Low Arch
      {
        id: 'sb-arch',
        type: 'arch',
        position: [-3.5, 0, 0],
        size: [5, 4, 1.5],
        clearance: 0.85,
      },
      // Pressure Plate
      {
        id: 'sb-plate',
        type: 'pressure_plate',
        position: [3.5, 0.1, 0],
        size: [3, 0.2, 3],
        color: 0xc87d46,
        requiredMass: 2.8,
      },
      // Spring Pad
      {
        id: 'sb-spring',
        type: 'spring_pad',
        position: [0, 0.15, -4],
        size: [2.5, 0.3, 2.5],
        color: 0x429665,
      },
      // High Central Pedestal
      {
        id: 'sb-pedestal',
        type: 'box',
        position: [0, 1.8, -10],
        size: [6, 3.6, 6],
        color: 0x5a483e,
      },
      // Destructible block
      {
        id: 'sb-smash',
        type: 'destructible',
        position: [3.5, 1.2, -6],
        size: [2.5, 2.4, 1.2],
        color: 0xa86a48,
        health: 1,
      },
    ],
  },
];

// Helper to construct level 3D meshes in the Three.js scene
export class LevelMeshBuilder {
  public levelGroup: THREE.Group;
  public animatedObstacles: {
    mesh: THREE.Object3D;
    type: string;
    obstacleId: string;
    update?: (delta: number, time: number) => void;
  }[] = [];
  public starMesh: THREE.Group | null = null;
  public nuggetMeshes: { mesh: THREE.Mesh; pos: [number, number, number]; collected: boolean }[] = [];
  public plateMeshes: Map<string, THREE.Mesh> = new Map();
  public gateMeshes: Map<string, THREE.Mesh> = new Map();
  public destructibleMeshes: Map<string, THREE.Mesh> = new Map();

  constructor() {
    this.levelGroup = new THREE.Group();
    this.levelGroup.name = 'LevelObjects';
  }

  public buildLevel(level: LevelData, scene: THREE.Scene) {
    // Clear old level
    while (this.levelGroup.children.length > 0) {
      const obj = this.levelGroup.children[0];
      this.levelGroup.remove(obj);
    }
    this.animatedObstacles = [];
    this.nuggetMeshes = [];
    this.plateMeshes.clear();
    this.gateMeshes.clear();
    this.destructibleMeshes.clear();

    // 1. Build Workshop Diorama Table Floor & Borders
    this.buildWorkshopEnvironment();

    // 2. Build Level-Specific Obstacles
    level.obstacles.forEach((obs) => {
      if (obs.type === 'box') {
        const mat = makeClayMaterial({
          color: obs.color ?? 0x5e5046,
          roughness: 0.85,
        });
        const geom = new THREE.BoxGeometry(obs.size[0], obs.size[1], obs.size[2]);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(obs.position[0], obs.position[1], obs.position[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.levelGroup.add(mesh);
      } else if (obs.type === 'arch') {
        this.buildArch(obs);
      } else if (obs.type === 'pressure_plate') {
        this.buildPressurePlate(obs);
      } else if (obs.type === 'gate') {
        this.buildGate(obs);
      } else if (obs.type === 'wind_fan') {
        this.buildWindFan(obs);
      } else if (obs.type === 'destructible') {
        this.buildDestructible(obs);
      } else if (obs.type === 'spring_pad') {
        this.buildSpringPad(obs);
      }
    });

    // 3. Build Goal Star
    this.buildGoalStar(level.starPosition);

    // 4. Build Bonus Clay Nuggets
    level.bonusNuggets.forEach((pos) => {
      this.buildNugget(pos);
    });

    scene.add(this.levelGroup);
  }

  private buildWorkshopEnvironment() {
    // Cutting mat diorama floor
    const cuttingTex = createCuttingMatTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: cuttingTex,
      roughness: 0.88,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(50, 1.0, 60), floorMat);
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    this.levelGroup.add(floor);

    // Workshop Wooden Perimeter Desk Rim
    const woodTex = createWoodTexture();
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.75,
      metalness: 0.1,
    });

    // Outer table border trim
    const rimGeomZ = new THREE.BoxGeometry(1.6, 1.4, 62);
    const rimLeft = new THREE.Mesh(rimGeomZ, woodMat);
    rimLeft.position.set(-25.8, -0.3, 0);
    rimLeft.castShadow = true;
    rimLeft.receiveShadow = true;
    this.levelGroup.add(rimLeft);

    const rimRight = new THREE.Mesh(rimGeomZ, woodMat);
    rimRight.position.set(25.8, -0.3, 0);
    rimRight.castShadow = true;
    rimRight.receiveShadow = true;
    this.levelGroup.add(rimRight);

    // Decorative Sculpting Tools on the side of the table (Clay modeling spatulas, brass calipers)
    this.buildClayTools(woodMat);
  }

  private buildClayTools(woodMat: THREE.Material) {
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // brass
      metalness: 0.85,
      roughness: 0.25,
    });

    // Wooden pottery rib tool
    const ribGeom = new THREE.BoxGeometry(1.2, 0.15, 3.5);
    const ribMesh = new THREE.Mesh(ribGeom, woodMat);
    ribMesh.position.set(-16, 0.08, 12);
    ribMesh.rotation.y = 0.45;
    ribMesh.castShadow = true;
    this.levelGroup.add(ribMesh);

    // Brass calipers / sculpting loop tool
    const toolHandleGeom = new THREE.CylinderGeometry(0.12, 0.12, 4.0, 8);
    const toolHandle = new THREE.Mesh(toolHandleGeom, woodMat);
    toolHandle.rotation.z = Math.PI / 2;
    toolHandle.rotation.y = -0.3;
    toolHandle.position.set(16, 0.12, 8);
    toolHandle.castShadow = true;

    const metalLoopGeom = new THREE.TorusGeometry(0.35, 0.05, 8, 16);
    const metalLoop = new THREE.Mesh(metalLoopGeom, metalMat);
    metalLoop.position.set(2.2, 0, 0);
    metalLoop.rotation.y = Math.PI / 2;
    toolHandle.add(metalLoop);

    this.levelGroup.add(toolHandle);
  }

  private buildArch(obs: LevelObstacle) {
    const [x, , z] = obs.position;
    const [w, h, d] = obs.size;
    const clearance = obs.clearance ?? 0.85;

    const archMat = makeClayMaterial({
      color: 0x7c695b,
      roughness: 0.78,
    });

    const pillarWidth = 1.4;
    const pillarHeight = h;
    const pillarGeom = new THREE.BoxGeometry(pillarWidth, pillarHeight, d);

    // Left pillar
    const leftPillar = new THREE.Mesh(pillarGeom, archMat);
    leftPillar.position.set(x - w / 2 + pillarWidth / 2, pillarHeight / 2, z);
    leftPillar.castShadow = true;
    leftPillar.receiveShadow = true;
    this.levelGroup.add(leftPillar);

    // Right pillar
    const rightPillar = new THREE.Mesh(pillarGeom, archMat);
    rightPillar.position.set(x + w / 2 - pillarWidth / 2, pillarHeight / 2, z);
    rightPillar.castShadow = true;
    rightPillar.receiveShadow = true;
    this.levelGroup.add(rightPillar);

    // Low crossbar (Leaves exact clearance underneath)
    const barHeight = h - clearance;
    const barWidth = w - pillarWidth * 2;
    const barGeom = new THREE.BoxGeometry(barWidth, barHeight, d);
    const bar = new THREE.Mesh(barGeom, archMat);
    bar.position.set(x, clearance + barHeight / 2, z);
    bar.castShadow = true;
    bar.receiveShadow = true;
    this.levelGroup.add(bar);

    // Warning sign: "LOW SQUEEZE"
    const signMat = new THREE.MeshStandardMaterial({ color: 0xcc8844, roughness: 0.6 });
    const signGeom = new THREE.BoxGeometry(barWidth * 0.7, 0.45, 0.1);
    const sign = new THREE.Mesh(signGeom, signMat);
    sign.position.set(x, clearance + 0.6, z + d / 2 + 0.06);
    this.levelGroup.add(sign);
  }

  private buildPressurePlate(obs: LevelObstacle) {
    const [x, y, z] = obs.position;
    const [w, , d] = obs.size;

    // Rim base
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x332822, roughness: 0.9 });
    const baseGeom = new THREE.BoxGeometry(w + 0.4, 0.12, d + 0.4);
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.set(x, 0.06, z);
    base.receiveShadow = true;
    this.levelGroup.add(base);

    // Moving button plate
    const plateMat = makeClayMaterial({ color: obs.color ?? 0xc87d46, roughness: 0.75 });
    const plateGeom = new THREE.BoxGeometry(w, 0.2, d);
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.position.set(x, y + 0.1, z);
    plate.castShadow = true;
    plate.receiveShadow = true;
    this.levelGroup.add(plate);

    this.plateMeshes.set(obs.id, plate);
  }

  private buildGate(obs: LevelObstacle) {
    const [x, y, z] = obs.position;
    const [w, h, d] = obs.size;

    const gateMat = makeClayMaterial({ color: obs.color ?? 0x483a34, roughness: 0.8 });
    const gateGeom = new THREE.BoxGeometry(w, h, d);
    const gate = new THREE.Mesh(gateGeom, gateMat);
    gate.position.set(x, y, z);
    gate.castShadow = true;
    gate.receiveShadow = true;
    this.levelGroup.add(gate);

    this.gateMeshes.set(obs.id, gate);
  }

  private buildWindFan(obs: LevelObstacle) {
    const fanGroup = new THREE.Group();
    fanGroup.position.set(obs.position[0], obs.position[1], obs.position[2]);

    // Fan housing
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x3a3330, roughness: 0.6 });
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.0, 16), housingMat);
    housing.rotation.z = Math.PI / 2;
    housing.castShadow = true;
    fanGroup.add(housing);

    // Blades
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.7, roughness: 0.3 });
    const bladeGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.3, 0.05), bladeMat);
      blade.rotation.x = (i * Math.PI) / 2;
      blade.position.y = Math.sin((i * Math.PI) / 2) * 0.6;
      blade.position.z = Math.cos((i * Math.PI) / 2) * 0.6;
      bladeGroup.add(blade);
    }
    fanGroup.add(bladeGroup);

    this.animatedObstacles.push({
      mesh: bladeGroup,
      type: 'fan',
      obstacleId: obs.id,
      update: (delta) => {
        bladeGroup.rotation.x += delta * 15.0;
      },
    });

    this.levelGroup.add(fanGroup);
  }

  private buildDestructible(obs: LevelObstacle) {
    const mat = makeClayMaterial({ color: obs.color ?? 0xa86a48, roughness: 0.95 });
    const geom = new THREE.BoxGeometry(obs.size[0], obs.size[1], obs.size[2]);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(obs.position[0], obs.position[1], obs.position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.levelGroup.add(mesh);

    this.destructibleMeshes.set(obs.id, mesh);
  }

  private buildSpringPad(obs: LevelObstacle) {
    const [x, , z] = obs.position;
    const [w, , d] = obs.size;

    const springBaseMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.6, w * 0.7, 0.15, 16), springBaseMat);
    baseMesh.position.set(x, 0.075, z);
    this.levelGroup.add(baseMesh);

    const padMat = makeClayMaterial({ color: obs.color ?? 0x429665, roughness: 0.6 });
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.55, w * 0.55, 0.2, 16), padMat);
    pad.position.set(x, 0.2, z);
    pad.castShadow = true;
    this.levelGroup.add(pad);
  }

  private buildGoalStar(pos: [number, number, number]) {
    const starGroup = new THREE.Group();
    starGroup.position.set(pos[0], pos[1], pos[2]);

    // Star Core
    const starGeom = new THREE.OctahedronGeometry(0.7, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.5,
    });
    const star = new THREE.Mesh(starGeom, starMat);
    star.castShadow = true;
    starGroup.add(star);

    // Glowing Halo / Clay Ring around star
    const ringGeom = new THREE.TorusGeometry(1.1, 0.08, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffea77, wireframe: true });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 4;
    starGroup.add(ring);

    this.starMesh = starGroup;
    this.levelGroup.add(starGroup);
  }

  private buildNugget(pos: [number, number, number]) {
    const nuggetMat = makeClayMaterial({
      color: 0x38bdf8, // vibrant blue clay nugget
      roughness: 0.5,
      metalness: 0.2,
    });
    const geom = new THREE.DodecahedronGeometry(0.28, 0);
    const nugget = new THREE.Mesh(geom, nuggetMat);
    nugget.position.set(pos[0], pos[1], pos[2]);
    nugget.castShadow = true;
    this.levelGroup.add(nugget);

    this.nuggetMeshes.push({
      mesh: nugget,
      pos,
      collected: false,
    });
  }

  public update(delta: number, time: number) {
    // Animate fan blades and other moving obstacles
    this.animatedObstacles.forEach((ao) => {
      if (ao.update) ao.update(delta, time);
    });

    // Spin and bob the goal star
    if (this.starMesh) {
      this.starMesh.rotation.y += delta * 1.8;
      this.starMesh.rotation.z = Math.sin(time * 2.5) * 0.15;
      this.starMesh.position.y += Math.sin(time * 3.0) * delta * 0.35;
    }

    // Spin floating nuggets
    this.nuggetMeshes.forEach((n) => {
      if (!n.collected) {
        n.mesh.rotation.y += delta * 2.5;
        n.mesh.rotation.x += delta * 1.2;
      }
    });
  }
}
