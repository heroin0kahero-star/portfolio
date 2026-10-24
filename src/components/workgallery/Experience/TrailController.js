import * as THREE from 'three';
import { Trail } from './Trail';
import { TrailHeadParticles } from './TrailHeadParticles';

export class TrailController {
  constructor({ gallery, scroll }) {
    this.gallery = gallery;
    this.scroll = scroll;
    this.trail = null;
    this.particles = null;
    this.head = new THREE.Vector3();
  }

  init(scene, camera) {
    this.trail = new Trail(scene);
    this.trail.init();
    this.particles = new TrailHeadParticles(scene);
    this.particles.init();
  }

  update(camera, scroll) {
    if (!this.trail || !this.particles) return;
    const activeIndex = this.gallery.getActivePlaneIndex(camera.position.z);
    const plane = this.gallery.planes[activeIndex];
    if (plane) {
      this.head.copy(plane.position);
      this.head.x -= 0.8;
      this.head.y -= 0.2;
      this.head.z += 0.1;
    }
    this.trail.update(this.head, scroll?.velocity || 0);
    this.particles.emit(this.head, scroll?.velocity || 0);
  }

  dispose() {
    this.trail?.dispose();
    this.particles?.dispose();
  }
}
