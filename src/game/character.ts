import * as THREE from 'three';
import { makeClayMaterial } from './clayShader';

export interface ClayCharacterParts {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  bodyMat: THREE.MeshStandardMaterial;
  leftEyeGroup: THREE.Group;
  rightEyeGroup: THREE.Group;
  leftPupil: THREE.Mesh;
  rightPupil: THREE.Mesh;
  stemGroup: THREE.Group;
  contactShadow: THREE.Mesh;
  contactShadowMat: THREE.MeshBasicMaterial;
}

// Generate circular radial soft gradient for contact shadow
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  gradient.addColorStop(0, 'rgba(10, 8, 6, 0.7)');
  gradient.addColorStop(0.5, 'rgba(10, 8, 6, 0.35)');
  gradient.addColorStop(1, 'rgba(10, 8, 6, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createClayCharacter(colorHex: string = '#e05638'): ClayCharacterParts {
  const group = new THREE.Group();
  group.name = 'ClayCharacter';

  // 1. Primary Clay Body
  // Use Sphere with 24 x 16 segments and flat shading for handcrafted look
  const bodyMat = makeClayMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.86,
    metalness: 0.03,
    stopMotionFPS: 12,
  });

  const bodyGeom = new THREE.SphereGeometry(0.7, 24, 18);
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  // Center sphere vertically so bottom sits at y = 0
  bodyMesh.position.y = 0.7;
  group.add(bodyMesh);

  // 2. Eyes & Pupils (Stop-motion clay style googly eyes)
  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.45,
    metalness: 0.0,
    flatShading: true,
  });

  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.12,
    metalness: 0.15, // glossy bead
  });

  const glintMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  function createEye(isRight: boolean): { eyeGroup: THREE.Group; pupil: THREE.Mesh } {
    const eyeGroup = new THREE.Group();
    
    // Sclera
    const eyeGeom = new THREE.SphereGeometry(0.15, 12, 10);
    const eyeMesh = new THREE.Mesh(eyeGeom, eyeWhiteMat);
    eyeMesh.scale.set(1.0, 1.1, 0.8);
    eyeMesh.castShadow = true;
    eyeGroup.add(eyeMesh);

    // Pupil
    const pupilGeom = new THREE.SphereGeometry(0.065, 10, 8);
    const pupil = new THREE.Mesh(pupilGeom, pupilMat);
    pupil.position.set(0, 0, 0.1);
    eyeGroup.add(pupil);

    // Specular Glint dot
    const glintGeom = new THREE.SphereGeometry(0.02, 6, 6);
    const glint = new THREE.Mesh(glintGeom, glintMat);
    glint.position.set(0.025, 0.025, 0.145);
    eyeGroup.add(glint);

    // Position on body
    const xOffset = isRight ? 0.26 : -0.26;
    eyeGroup.position.set(xOffset, 0.22, 0.52);

    return { eyeGroup, pupil };
  }

  const left = createEye(false);
  const right = createEye(true);

  bodyMesh.add(left.eyeGroup);
  bodyMesh.add(right.eyeGroup);

  // 3. Cute Clay Sprout / Antenna on top of head
  const stemGroup = new THREE.Group();
  stemGroup.position.set(0, 0.68, 0);

  const stemMat = makeClayMaterial({
    color: 0x5a8a42, // Fresh green clay
    roughness: 0.75,
    stopMotionFPS: 12,
  });

  // Stalk
  const stalkGeom = new THREE.CylinderGeometry(0.04, 0.06, 0.32, 8);
  const stalk = new THREE.Mesh(stalkGeom, stemMat);
  stalk.position.y = 0.16;
  stalk.castShadow = true;
  stemGroup.add(stalk);

  // Leaf Bulb
  const bulbGeom = new THREE.SphereGeometry(0.1, 10, 8);
  const bulb = new THREE.Mesh(bulbGeom, stemMat);
  bulb.position.y = 0.32;
  bulb.scale.set(1.2, 0.8, 1.4);
  bulb.castShadow = true;
  stemGroup.add(bulb);

  bodyMesh.add(stemGroup);

  // 4. Contact Ground Shadow Disc
  const shadowTex = createContactShadowTexture();
  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const shadowGeom = new THREE.PlaneGeometry(1.8, 1.8);
  const contactShadow = new THREE.Mesh(shadowGeom, contactShadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.015; // slightly above floor to prevent z-fighting
  contactShadow.renderOrder = 1;
  group.add(contactShadow);

  return {
    group,
    bodyMesh,
    bodyMat,
    leftEyeGroup: left.eyeGroup,
    rightEyeGroup: right.eyeGroup,
    leftPupil: left.pupil,
    rightPupil: right.pupil,
    stemGroup,
    contactShadow,
    contactShadowMat,
  };
}
