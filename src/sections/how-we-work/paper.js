/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Full-screen warm-paper pass. The shader itself is the Codrops background
 * shader (MIT, see shaders/paper.frag.glsl) with the blobs muted and the
 * output converted to sRGB by the renderer.
 */

import * as THREE from 'three';
import { PAPER } from './constants';
import paperVertex from './shaders/paper.vert.glsl';
import paperFragment from './shaders/paper.frag.glsl';

export function createPaper() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const paper = new THREE.Color(PAPER);

  const material = new THREE.ShaderMaterial({
    vertexShader: paperVertex,
    fragmentShader: paperFragment,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uBackgroundColor: { value: paper.clone() },
      uBlob1Color: { value: paper.clone() },
      uBlob2Color: { value: paper.clone() },
      uNoiseStrength: { value: 0.035 },
      uBlobRadius: { value: 0.65 },
      uBlobRadiusSecondary: { value: 0.65 * 0.78 },
      uBlobStrength: { value: 0 },
      uTime: { value: 0 },
      uVelocityIntensity: { value: 0 },
    },
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  return {
    render(renderer) {
      renderer.render(scene, camera);
    },
    update(timeMs) {
      material.uniforms.uTime.value = timeMs;
    },
    setNoise(value) {
      if (!Number.isFinite(value)) return;
      material.uniforms.uNoiseStrength.value = Math.max(0, Math.min(0.2, value));
    },
    dispose() {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    },
  };
}
