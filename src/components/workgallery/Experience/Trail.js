import * as THREE from 'three';

export class Trail {
  constructor(scene) {
    this.scene = scene;
    this.points = [];
    this.maxPoints = 80;
    this.curve = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
  }

  init() {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      linewidth: 1,
    });
    this.mesh = new THREE.Line(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  update(headPosition, velocity) {
    if (!this.mesh) return;
    this.points.push(headPosition.clone());
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
    if (this.points.length < 2) {
      this.mesh.visible = false;
      return;
    }
    this.mesh.visible = true;
    this.curve = new THREE.CatmullRomCurve3(this.points);
    const curvePoints = this.curve.getPoints(this.points.length * 2);
    this.geometry.setFromPoints(curvePoints);
    const v = Math.min(Math.abs(velocity || 0) * 50, 1);
    this.material.opacity = 0.3 + v * 0.4;
    this.material.linewidth = 1 + v;
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
    this.geometry?.dispose();
    this.material?.dispose();
  }
}
