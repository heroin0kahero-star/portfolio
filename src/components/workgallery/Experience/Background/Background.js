import * as THREE from 'three';
import backgroundVertex from '../../shaders/background.vert.glsl';
import backgroundFragment from '../../shaders/background.frag.glsl';

export class Background {
  constructor(debug = null) {
    this.debug = debug;
    this.scene = null;
    this.mesh = null;
    this.material = null;
    this.currentMood = new THREE.Color('#1f1f1f');
    this.nextMood = new THREE.Color('#1f1f1f');
    this.blend = 0;
    this.time = 0;
  }

  init(scene) {
    this.scene = scene;
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: backgroundVertex,
      fragmentShader: backgroundFragment,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color('#1f1f1f') },
        uColorB: { value: new THREE.Color('#1f1f1f') },
        uBlend: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = -50;
    this.scene.add(this.mesh);
  }

  resize(width, height) {
    if (this.material) {
      this.material.uniforms.uResolution.value.set(width, height);
    }
  }

  setMoodBlend({ currentMood, nextMood, blend }) {
    if (!this.material) return;
    this.currentMood.set(currentMood || '#1f1f1f');
    this.nextMood.set(nextMood || currentMood || '#1f1f1f');
    this.blend = blend || 0;
    this.material.uniforms.uColorA.value.copy(this.currentMood);
    this.material.uniforms.uColorB.value.copy(this.nextMood);
    this.material.uniforms.uBlend.value = this.blend;
  }

  update(camera, scroll, gallery) {
    this.time += 0.016;
    if (this.material) {
      this.material.uniforms.uTime.value = this.time;
    }
    if (gallery && camera) {
      const mood = gallery.getMoodBlendData(camera.position.z);
      if (mood) {
        this.setMoodBlend(mood);
      }
    }
  }

  render(renderer) {
    if (!this.scene || !this.mesh) return;
    renderer.render(this.scene, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
  }

  dispose() {
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
    }
    this.geometry?.dispose();
    this.material?.dispose();
  }
}
