import * as THREE from 'three';
import { Scroll } from './Scroll';
import { Gallery } from './Gallery';
import { TrailController } from './TrailController';
import { Background } from './Background/Background';

export class Engine {
  constructor(canvas, experience = null) {
    this.canvas = canvas;
    this.experience = experience;
    this.isRunning = false;
    this.animationFrameRequestId = null;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    this.camera.position.set(0, 0, 6);

    this.gallery = new Gallery();
    this.scroll = new Scroll(this.camera, this.gallery);
    this.trailController = new TrailController({ gallery: this.gallery, scroll: this.scroll });
    this.background = new Background();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.autoClear = false;

    this.onResize = this.resize.bind(this);
    this.animate = this.update.bind(this);
  }

  async init() {
    await this.gallery.init(this.scene);
    this.scroll.init();
    this.trailController.init(this.scene, this.camera);
    this.background.init(this.scene);
    this.resize();
    window.addEventListener('resize', this.onResize);
    this.start();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.update();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameRequestId !== null) {
      cancelAnimationFrame(this.animationFrameRequestId);
      this.animationFrameRequestId = null;
    }
  }

  resize() {
    if (!this.canvas) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.gallery.updatePlaneScale();
    this.gallery.layoutPlanes();
    this.background.resize(width, height);
  }

  update() {
    if (!this.isRunning) return;
    this.animationFrameRequestId = requestAnimationFrame(this.animate);

    this.scroll.update();
    this.gallery.update(this.camera, this.scroll);
    this.trailController.update(this.camera, this.scroll, performance.now());
    this.background.update(this.camera, this.scroll, this.gallery);

    this.renderer.clear(true, true, true);
    this.background.render(this.renderer);
    this.renderer.clearDepth();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.scroll.dispose();
    this.gallery.dispose();
    this.trailController.dispose();
    this.background.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      try {
        this.renderer.forceContextLoss();
      } catch (e) {}
      this.renderer = null;
    }
  }
}
