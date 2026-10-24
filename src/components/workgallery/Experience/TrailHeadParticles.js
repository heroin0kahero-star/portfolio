import * as THREE from 'three';

export class TrailHeadParticles {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.count = 20;
  }

  init() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const velocities = [];
    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    this.points = new THREE.Points(geo, mat);
    this.velocities = velocities;
    this.scene.add(this.points);
  }

  emit(headPosition, velocity) {
    if (!this.points) return;
    const pos = this.points.geometry.attributes.position.array;
    const v = Math.min(Math.abs(velocity || 0) * 100, 1);
    for (let i = 0; i < this.count; i++) {
      pos[i * 3] += this.velocities[i].x + (Math.random() - 0.5) * v * 0.01;
      pos[i * 3 + 1] += this.velocities[i].y + (Math.random() - 0.5) * v * 0.01;
      pos[i * 3 + 2] += this.velocities[i].z;
      if (Math.random() < 0.1 * v) {
        pos[i * 3] = headPosition.x + (Math.random() - 0.5) * 0.1;
        pos[i * 3 + 1] = headPosition.y + (Math.random() - 0.5) * 0.1;
        pos[i * 3 + 2] = headPosition.z;
      }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.material.opacity = 0.3 + v * 0.3;
  }

  dispose() {
    if (this.points) {
      this.scene.remove(this.points);
    }
    this.points?.geometry.dispose();
    this.points?.material.dispose();
  }
}
