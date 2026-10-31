import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';

import { MorphType, LevelData } from './types/game';
import { createClayCharacter, ClayCharacterParts } from './game/character';
import { LEVELS, LevelMeshBuilder } from './game/levels';
import { PhysicsEngine, MORPH_PRESETS } from './game/physics';
import { sounds } from './audio/soundEffects';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';

// Software WebGL detection per Three.js guidelines
const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return false;
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Game state
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentMorph, setCurrentMorph] = useState<MorphType>('SPHERE');
  const [clayColor, setClayColor] = useState<string>('#e05638');
  const [stopMotionFPS, setStopMotionFPS] = useState<number>(12);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);
  const [touchControlsActive, setTouchControlsActive] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [nuggetsCollected, setNuggetsCollected] = useState<number>(0);
  const [isLevelComplete, setIsLevelComplete] = useState<boolean>(false);

  // Engine refs for render loop
  const engineRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    character: ClayCharacterParts;
    meshBuilder: LevelMeshBuilder;
    physics: PhysicsEngine;
    clock: THREE.Clock;
    frameId: number;
    currentLevel: LevelData;
    keys: Record<string, boolean>;
    touchInput: { x: number; z: number };
    elapsedSecs: number;
    collectedNuggets: number;
    isFinished: boolean;
  } | null>(null);

  const activeLevel = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Auto-detect touch device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouch) {
        setTouchControlsActive(true);
      }
    }
  }, []);

  // Sync sounds state
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Main Three.js Scene Setup & Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1c1715'); // Warm moody clay workshop studio
    scene.fog = new THREE.FogExp2('#1c1715', 0.024);

    // 3. Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 9, 18);

    // 4. Procedural Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xffeed6, 2.2);
    keyLight.position.set(14, 20, 10);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = isSoftwareGl ? 512 : 1024;
    keyLight.shadow.mapSize.height = isSoftwareGl ? 512 : 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    const d = 22;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    scene.add(keyLight);

    // Cool hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0xfff5eb, 0x221814, 0.75);
    scene.add(hemiLight);

    // Subtle edge rim light
    const rimLight = new THREE.DirectionalLight(0x7fb0ff, 0.85);
    rimLight.position.set(-15, 12, -15);
    scene.add(rimLight);

    // 6. Character
    const character = createClayCharacter(clayColor);
    scene.add(character.group);

    // 7. Level Mesh Builder
    const meshBuilder = new LevelMeshBuilder();
    meshBuilder.buildLevel(activeLevel, scene);

    // 8. Physics Engine
    const physics = new PhysicsEngine(scene);
    physics.resetPosition(activeLevel.spawnPoint);

    const clock = new THREE.Clock();
    const keys: Record<string, boolean> = {};
    const touchInput = { x: 0, z: 0 };

    engineRef.current = {
      scene,
      camera,
      renderer,
      character,
      meshBuilder,
      physics,
      clock,
      frameId: 0,
      currentLevel: activeLevel,
      keys,
      touchInput,
      elapsedSecs: 0,
      collectedNuggets: 0,
      isFinished: false,
    };

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'Digit1') handleMorphSelect('SPHERE');
      if (e.code === 'Digit2') handleMorphSelect('PANCAKE');
      if (e.code === 'Digit3') handleMorphSelect('TENDRIL');
      if (e.code === 'Digit4') handleMorphSelect('BLOCK');
      if (e.code === 'Digit5') handleMorphSelect('URCHIN');
      if (e.code === 'Space') {
        e.preventDefault();
        physics.jump();
      }
      if (e.code === 'KeyR') {
        handleReset();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 9. Main Animation Loop
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          engineRef.current!.frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          engineRef.current!.frameId = window.setTimeout(cb, 75);
        }
      };
      engineRef.current!.frameId = window.setTimeout(poll, 5);
    }

    const targetLookAt = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3();

    function tick() {
      const eng = engineRef.current;
      if (!eng) return;

      const delta = Math.min(eng.clock.getDelta(), 0.05);
      const totalTime = eng.clock.getElapsedTime();

      if (!eng.isFinished) {
        eng.elapsedSecs += delta;
        setElapsedSeconds(Math.floor(eng.elapsedSecs));
      }

      // Collect Input Vector
      let ix = eng.touchInput.x;
      let iz = eng.touchInput.z;
      if (eng.keys['KeyA'] || eng.keys['ArrowLeft']) ix -= 1;
      if (eng.keys['KeyD'] || eng.keys['ArrowRight']) ix += 1;
      if (eng.keys['KeyW'] || eng.keys['ArrowUp']) iz -= 1;
      if (eng.keys['KeyS'] || eng.keys['ArrowDown']) iz += 1;

      // Update Physics
      eng.physics.update(
        delta,
        { x: ix, z: iz },
        eng.currentLevel.obstacles,
        eng.meshBuilder,
        () => {
          // Goal star collected!
          if (!eng.isFinished) {
            eng.isFinished = true;
            setIsLevelComplete(true);
            sounds.playStarVictory();
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ffd700', '#e05638', '#48b886', '#38bdf8'],
            });
          }
        },
        () => {
          // Nugget collected
          eng.collectedNuggets++;
          setNuggetsCollected(eng.collectedNuggets);
        }
      );

      // Update Level Object Animations (Gears, Fans, Star bobbing)
      eng.meshBuilder.update(delta, totalTime);

      // Update Character Visuals
      const char = eng.character;
      char.group.position.copy(eng.physics.pos);

      // Morph scale lerp in shader & transform
      char.bodyMat.userData.uMorphScale.value.copy(eng.physics.currentScale);
      char.bodyMat.userData.uTime.value = totalTime;
      char.bodyMat.userData.uSquashWobble.value = eng.physics.squashWobble;

      // Rolling rotation for ball form
      if (eng.physics.currentMorph === 'SPHERE' && (ix !== 0 || iz !== 0)) {
        char.bodyMesh.rotation.x += iz * delta * 7.0;
        char.bodyMesh.rotation.z -= ix * delta * 7.0;
      } else {
        char.bodyMesh.rotation.x = THREE.MathUtils.damp(char.bodyMesh.rotation.x, 0, 8.0, delta);
        char.bodyMesh.rotation.z = THREE.MathUtils.damp(char.bodyMesh.rotation.z, 0, 8.0, delta);
      }

      // Dynamic Eye Tracking: Pupils look in movement direction
      const pupilTargetX = THREE.MathUtils.clamp(ix * 0.04, -0.04, 0.04);
      const pupilTargetY = THREE.MathUtils.clamp(-iz * 0.03, -0.03, 0.03);
      char.leftPupil.position.x = THREE.MathUtils.damp(char.leftPupil.position.x, pupilTargetX, 10.0, delta);
      char.leftPupil.position.y = THREE.MathUtils.damp(char.leftPupil.position.y, pupilTargetY, 10.0, delta);
      char.rightPupil.position.x = THREE.MathUtils.damp(char.rightPupil.position.x, pupilTargetX, 10.0, delta);
      char.rightPupil.position.y = THREE.MathUtils.damp(char.rightPupil.position.y, pupilTargetY, 10.0, delta);

      // Clay Head Stem Inertia Wobble
      char.stemGroup.rotation.z = THREE.MathUtils.damp(char.stemGroup.rotation.z, -ix * 0.35, 12.0, delta);
      char.stemGroup.rotation.x = THREE.MathUtils.damp(char.stemGroup.rotation.x, iz * 0.35, 12.0, delta);

      // Ground Contact Shadow Fade
      const distFromGround = eng.physics.pos.y - 0.7 * eng.physics.currentScale.y;
      char.contactShadow.position.y = 0.02 - eng.physics.pos.y;
      const shadowScale = Math.max(0.4, 1.0 - distFromGround * 0.15) * eng.physics.currentScale.x;
      char.contactShadow.scale.set(shadowScale, shadowScale, 1.0);
      char.contactShadowMat.opacity = Math.max(0.05, 0.65 - distFromGround * 0.12);

      // Camera Smooth Follow
      const targetCamPos = new THREE.Vector3(
        eng.physics.pos.x * 0.35,
        eng.physics.pos.y + 6.2,
        eng.physics.pos.z + 11.5
      );
      camera.position.lerp(targetCamPos, delta * 5.5);

      targetLookAt.set(eng.physics.pos.x * 0.7, eng.physics.pos.y + 0.6, eng.physics.pos.z);
      currentLookAt.lerp(targetLookAt, delta * 6.0);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        eng.frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      engineRef.current.frameId = requestAnimationFrame(tick);
    }

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);

      if (engineRef.current) {
        cancelAnimationFrame(engineRef.current.frameId);
        clearTimeout(engineRef.current.frameId);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Level Selection Handler
  const handleSelectLevel = useCallback((levelId: number) => {
    setCurrentLevelId(levelId);
    setIsLevelComplete(false);
    setNuggetsCollected(0);
    setElapsedSeconds(0);

    const eng = engineRef.current;
    if (!eng) return;

    const newLevel = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    eng.currentLevel = newLevel;
    eng.isFinished = false;
    eng.elapsedSecs = 0;
    eng.collectedNuggets = 0;

    // Rebuild level meshes in scene
    eng.meshBuilder.buildLevel(newLevel, eng.scene);
    eng.physics.resetPosition(newLevel.spawnPoint);
    setCurrentMorph('SPHERE');
  }, []);

  // Reset current level
  const handleReset = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;

    setIsLevelComplete(false);
    setNuggetsCollected(0);
    setElapsedSeconds(0);
    eng.isFinished = false;
    eng.elapsedSecs = 0;
    eng.collectedNuggets = 0;

    eng.meshBuilder.buildLevel(eng.currentLevel, eng.scene);
    eng.physics.resetPosition(eng.currentLevel.spawnPoint);
    setCurrentMorph('SPHERE');
  }, []);

  // Next level
  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelId >= LEVELS.length ? 1 : currentLevelId + 1;
    handleSelectLevel(nextId);
  }, [currentLevelId, handleSelectLevel]);

  // Morph Selection Handler
  const handleMorphSelect = useCallback((morph: MorphType) => {
    setCurrentMorph(morph);
    const eng = engineRef.current;
    if (eng) {
      eng.physics.setMorph(morph);
    }
  }, []);

  // Clay Color Change
  const handleColorChange = useCallback((hex: string) => {
    setClayColor(hex);
    const eng = engineRef.current;
    if (eng) {
      eng.character.bodyMat.color.set(hex);
      // Spawn tiny burst in new color
      eng.physics.spawnClayCrumbs(eng.physics.pos, hex, 12);
    }
  }, []);

  // FPS Change (Stop-Motion Jitter)
  const handleFPSChange = useCallback((fpsValue: number) => {
    setStopMotionFPS(fpsValue);
    const eng = engineRef.current;
    if (eng) {
      eng.character.bodyMat.userData.uFPS.value = fpsValue;
    }
  }, []);

  // Touch Move callback
  const handleTouchMove = useCallback((input: { x: number; z: number }) => {
    const eng = engineRef.current;
    if (eng) {
      eng.touchInput.x = input.x;
      eng.touchInput.z = input.z;
    }
  }, []);

  // Touch Jump callback
  const handleTouchJump = useCallback(() => {
    const eng = engineRef.current;
    if (eng) {
      eng.physics.jump();
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#1c1715] touch-none">
      {/* Three.js Isolated Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Ergonomic UI HUD Overlay (Top Badge & Collapsible Bottom Dock) */}
      <HUD
        currentLevel={activeLevel}
        levels={LEVELS}
        currentMorph={currentMorph}
        onMorphChange={handleMorphSelect}
        onSelectLevel={handleSelectLevel}
        onRestartLevel={handleReset}
        onNextLevel={handleNextLevel}
        currentColor={clayColor}
        onColorChange={handleColorChange}
        fps={stopMotionFPS}
        onFPSChange={handleFPSChange}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        musicEnabled={musicEnabled}
        onToggleMusic={() => {
          const res = sounds.toggleMusic();
          setMusicEnabled(res);
        }}
        touchControlsActive={touchControlsActive}
        onToggleTouchControls={() => setTouchControlsActive(!touchControlsActive)}
        elapsedSeconds={elapsedSeconds}
        nuggetsCollected={nuggetsCollected}
        totalNuggets={activeLevel.bonusNuggets.length}
        isLevelComplete={isLevelComplete}
      />

      {/* Mobile Virtual Joystick & Touch Deck */}
      {touchControlsActive && (
        <TouchControls
          currentMorph={currentMorph}
          onMorphChange={handleMorphSelect}
          onJump={handleTouchJump}
          onTouchMove={handleTouchMove}
        />
      )}
    </div>
  );
}
