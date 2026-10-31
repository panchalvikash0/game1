import * as THREE from 'three';

/**
 * Procedural Stop-Motion Clay Material & Shaders
 * Uses flat-shading, vertex quantization (stop-motion stutter), and micro-jitter.
 */

// Generate a procedural clay fingerprint / craft texture
export function createClayNormalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Neutral normal map base (128, 128, 255)
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle concentric swirling fingerprint whorls and clay tool scrape marks
  ctx.lineWidth = 1.8;
  const numWhorls = 4;
  for (let w = 0; w < numWhorls; w++) {
    const cx = (w % 2 === 0 ? 140 : 370) + (Math.random() - 0.5) * 60;
    const cy = (w < 2 ? 140 : 370) + (Math.random() - 0.5) * 60;

    for (let r = 8; r < 120; r += 7) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${128 + (Math.random() - 0.5) * 35}, ${128 + (Math.random() - 0.5) * 35}, 255, 0.4)`;
      const ovalScaleY = 0.8 + Math.random() * 0.4;
      ctx.ellipse(cx, cy, r, r * ovalScaleY, (w * Math.PI) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Thumb impressions & organic clay texture noise
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const rad = 2 + Math.random() * 6;
    const shade = 128 + (Math.random() - 0.5) * 30;
    ctx.fillStyle = `rgba(${shade}, ${shade}, 250, 0.25)`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Generate cutting mat grid texture for the clay workshop table
export function createCuttingMatTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep forest green cutting mat background
  ctx.fillStyle = '#22382c';
  ctx.fillRect(0, 0, 1024, 1024);

  // Minor grid lines (10px)
  ctx.strokeStyle = 'rgba(78, 142, 105, 0.25)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Major grid lines (64px)
  ctx.strokeStyle = 'rgba(125, 201, 155, 0.65)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Metric markings and degree guides
  ctx.fillStyle = 'rgba(150, 220, 175, 0.7)';
  ctx.font = '11px monospace';
  for (let x = 64; x < 1024; x += 64) {
    ctx.fillText(`${x / 16}`, x + 4, 16);
  }
  for (let y = 64; y < 1024; y += 64) {
    ctx.fillText(`${y / 16}`, 6, y - 4);
  }

  // 45 degree angle guide lines
  ctx.strokeStyle = 'rgba(125, 201, 155, 0.35)';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(1024, 1024);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 1024);
  ctx.lineTo(1024, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  // Clay dust / smudges across the workbench
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const rad = 2 + Math.random() * 12;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(215, 140, 100, 0.08)' : 'rgba(240, 230, 210, 0.06)';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate wooden desk perimeter texture
export function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a3325';
  ctx.fillRect(0, 0, 512, 512);

  // Wood grain stripes
  for (let y = 0; y < 512; y += 4) {
    const alpha = 0.05 + Math.sin(y * 0.05) * 0.04;
    ctx.fillStyle = `rgba(30, 20, 12, ${alpha})`;
    ctx.fillRect(0, y, 512, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface ClayMaterialOptions {
  color: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
  stopMotionFPS?: number;
  jitterAmount?: number;
}

export function makeClayMaterial(options: ClayMaterialOptions): THREE.MeshStandardMaterial {
  const normalMap = createClayNormalTexture();

  const mat = new THREE.MeshStandardMaterial({
    color: options.color,
    roughness: options.roughness ?? 0.88,
    metalness: options.metalness ?? 0.04,
    flatShading: true, // Hand-chiseled clay look
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.25, 0.25),
  });

  mat.userData = {
    uTime: { value: 0 },
    uMorphScale: { value: new THREE.Vector3(1, 1, 1) },
    uFPS: { value: options.stopMotionFPS ?? 12.0 },
    uJitter: { value: options.jitterAmount ?? 0.045 },
    uSquashWobble: { value: 0.0 }, // Spring bounce on landing
  };

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = mat.userData.uTime;
    shader.uniforms.uMorphScale = mat.userData.uMorphScale;
    shader.uniforms.uFPS = mat.userData.uFPS;
    shader.uniforms.uJitter = mat.userData.uJitter;
    shader.uniforms.uSquashWobble = mat.userData.uSquashWobble;

    shader.vertexShader = `
      uniform float uTime;
      uniform vec3 uMorphScale;
      uniform float uFPS;
      uniform float uJitter;
      uniform float uSquashWobble;

      float hash3(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // Stop-motion frame-quantization (e.g., 12 fps stepped jitter)
      float fps = max(1.0, uFPS);
      float stepTime = floor(uTime * fps) / fps;
      
      // Stop-motion finger indentation jitter
      float j = (hash3(transformed * 2.5 + vec3(stepTime * 0.35)) - 0.5) * uJitter;
      transformed += normal * j;

      // Dynamic squash wobble
      float wobbleWave = sin(transformed.y * 5.0 + uTime * 20.0) * uSquashWobble * 0.08;
      transformed.x += wobbleWave;
      transformed.z += wobbleWave;

      // Morph scale application
      transformed *= uMorphScale;
      `
    );
  };

  return mat;
}
