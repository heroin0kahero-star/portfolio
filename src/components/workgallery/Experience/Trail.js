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
    const maxCurvePoints = this.maxPoints * 2;
    this.positions = new Float32Array(maxCurvePoints * 3);
    this.geometry = new THREE.BufferGeometry();
    const attribute = new THREE.BufferAttribute(this.positions, 3);
    attribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', attribute);
    this.geometry.setDrawRange(0, 0);
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
    const count = Math.min(curvePoints.length, this.maxPoints * 2);
    for (let i = 0; i < count; i++) {
      this.positions[i * 3] = curvePoints[i].x;
      this.positions[i * 3 + 1] = curvePoints[i].y;
      this.positions[i * 3 + 2] = curvePoints[i].z;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.setDrawRange(0, count);
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
