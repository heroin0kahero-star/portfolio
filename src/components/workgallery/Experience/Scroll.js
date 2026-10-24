import * as THREE from 'three';

export class Scroll {
  constructor(camera, gallery, debug = null) {
    this.camera = camera;
    this.gallery = gallery;
    this.debug = debug;

    this.progress = 0;
    this.targetProgress = 0;
    this.scrollHeight = 0;
    this.velocity = 0;
    this.lastProgress = 0;
    this.velocityMax = 0.02;
    this.velocityDamping = 0.9;
    this.ease = 0.08;
    this.useBounds = true;

    this.onScroll = this.handleScroll.bind(this);
    this.onResize = this.handleResize.bind(this);
  }

  init() {
    this.handleResize();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize);
  }

  handleResize() {
    this.scrollHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    this.targetProgress = this.scrollHeight <= 0 ? 0 : THREE.MathUtils.clamp(scrollY / this.scrollHeight, 0, 1);
  }

  setDebugUiVisible() {
    // no-op
  }

  update() {
    this.progress += (this.targetProgress - this.progress) * this.ease;
    if (this.useBounds) {
      this.progress = THREE.MathUtils.clamp(this.progress, 0, 1);
    }
    this.velocity = (this.progress - this.lastProgress);
    this.velocity *= this.velocityDamping;
    this.lastProgress = this.progress;
  }

  dispose() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
  }
}
