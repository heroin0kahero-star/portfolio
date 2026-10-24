import * as THREE from 'three';
import { stages } from '../../../data/stages';

export class Gallery {
  constructor(debug = null) {
    this.debug = debug;
    this.planes = [];
    this.texturesBySource = new Map();
    this.planeGap = 5;
    this.planeCount = stages.length;
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerLeave = this.handlePointerLeave.bind(this);
    this.pointer = new THREE.Vector2(0, 0);
    this.pointerTarget = new THREE.Vector2(0, 0);
    this.pointerActive = false;
    this.magneticRadius = 220;
    this.magneticLerp = 0.08;
    this.returnLerp = 0.06;
    this.planeOffset = new THREE.Vector2(0, 0);
    this.planeOffsetTarget = new THREE.Vector2(0, 0);
    this.tilt = new THREE.Vector2(0, 0);
    this.tiltTarget = new THREE.Vector2(0, 0);
    this.breathTime = 0;
    this.parallax = new THREE.Vector2(0, 0);
  }

  async init(scene) {
    const planeGeo = new THREE.PlaneGeometry(1, 1.3333);
    this.planeGeo = planeGeo;

    stages.forEach((stage, index) => {
      const texture = this.texturesBySource.get(stage.image) || null;
      if (texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
      }
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: index === 0 ? 1 : 0,
      });
      const mesh = new THREE.Mesh(planeGeo, material);
      mesh.position.set(0, 0, -index * this.planeGap);
      mesh.userData.index = index;
      mesh.userData.baseScale = 1;
      mesh.userData.stage = stage;
      scene.add(mesh);
      this.planes.push(mesh);
    });

    this.bindPointerEvents();
    this.updatePlaneScale();
  }

  setPreloadedTextures(map) {
    this.texturesBySource = map instanceof Map ? map : new Map();
  }

  getTextureSources() {
    return stages.map((s) => s.image);
  }

  updatePlaneScale() {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1535;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 702;
    const width = isMobile ? vw * 0.8 : vw * 0.24;
    const height = width * (4 / 3);
    this.targetWidth = width;
    this.targetHeight = height;
  }

  layoutPlanes() {
    // handled in update
  }

  bindPointerEvents() {
    if (typeof window === 'undefined') return;
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
  }

  handlePointerMove(event) {
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 768) return;
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.pointerTarget.copy(this.pointer);
    this.pointerActive = true;
  }

  handlePointerLeave() {
    this.pointerTarget.set(0, 0);
    this.pointerActive = false;
  }

  getActivePlaneIndex(cameraZ) {
    if (!this.planes.length) return -1;
    let closest = 0;
    let minDist = Infinity;
    this.planes.forEach((plane, index) => {
      const d = Math.abs(cameraZ - plane.position.z);
      if (d < minDist) {
        minDist = d;
        closest = index;
      }
    });
    return closest;
  }

  getPlaneBlendData(cameraZ) {
    if (!this.planes.length) return null;
    const planeGap = this.planeGap;
    const firstPlaneZ = this.planes[0].position.z;
    const lastIndex = this.planes.length - 1;
    if (lastIndex === 0 || planeGap <= 0) {
      return { currentPlaneIndex: 0, nextPlaneIndex: 0, blend: 0 };
    }
    const normalized = THREE.MathUtils.clamp((firstPlaneZ - cameraZ) / planeGap, 0, lastIndex);
    const currentPlaneIndex = Math.floor(normalized);
    const nextPlaneIndex = Math.min(currentPlaneIndex + 1, lastIndex);
    const blend = normalized - currentPlaneIndex;
    return { currentPlaneIndex, nextPlaneIndex, blend };
  }

  getMoodBlendData(cameraZ) {
    const blend = this.getPlaneBlendData(cameraZ);
    if (!blend) return null;
    const current = this.planes[blend.currentPlaneIndex]?.userData?.mood || '#1f1f1f';
    const next = this.planes[blend.nextPlaneIndex]?.userData?.mood || current;
    return { currentMood: current, nextMood: next, blend: blend.blend };
  }

  getDepthProgress(cameraZ) {
    if (!this.planes.length) return 0;
    const first = this.planes[0].position.z;
    const last = this.planes[this.planes.length - 1].position.z;
    const span = first - last;
    if (span <= 0) return 0;
    return THREE.MathUtils.clamp((first - cameraZ) / span, 0, 1);
  }

  update(camera = null, scroll = null) {
    if (!camera) return;
    const time = performance.now() * 0.001;
    this.breathTime = time;

    // Plane visibility
    const blendData = this.getPlaneBlendData(camera.position.z);
    if (blendData) {
      this.planes.forEach((plane, index) => {
        let targetOpacity = 0;
        if (index === blendData.currentPlaneIndex) targetOpacity = 1 - blendData.blend;
        if (index === blendData.nextPlaneIndex) targetOpacity = Math.max(targetOpacity, blendData.blend);
        plane.material.opacity = THREE.MathUtils.lerp(plane.material.opacity, targetOpacity, 0.14);
        plane.material.needsUpdate = true;
      });
    }

    // Magnetic + parallax + breath
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (!isMobile && this.pointerActive) {
      this.planeOffsetTarget.set(this.pointerTarget.x * 0.12, this.pointerTarget.y * 0.12);
      this.tiltTarget.set(this.pointerTarget.y * 0.1, -this.pointerTarget.x * 0.1);
      this.parallax.set(this.pointerTarget.x * 0.01, this.pointerTarget.y * 0.01);
    } else {
      this.planeOffsetTarget.set(0, 0);
      this.tiltTarget.set(0, 0);
      this.parallax.set(0, 0);
    }

    this.planeOffset.lerp(this.planeOffsetTarget, this.pointerActive ? this.magneticLerp : this.returnLerp);
    this.tilt.lerp(this.tiltTarget, this.pointerActive ? this.magneticLerp : this.returnLerp);

    const breathScale = 1 + Math.sin(time * 0.25 * Math.PI * 2) * 0.012;
    const breathTiltX = Math.sin(time * 0.25 * Math.PI * 2 + 1) * 0.8 * (Math.PI / 180);
    const breathTiltY = Math.cos(time * 0.25 * Math.PI * 2) * 0.8 * (Math.PI / 180);

    this.updatePlaneScale();
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1535;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 702;
    const width = isMobile ? vw * 0.8 : vw * 0.24;
    const height = width * (4 / 3);

    this.planes.forEach((plane, index) => {
      const baseZ = -index * this.planeGap;
      plane.position.z = baseZ;
      const isActive = blendData && index === blendData.currentPlaneIndex && blendData.blend < 0.5;
      const scale = isActive ? breathScale : breathScale * 0.9;
      plane.scale.set(width / 100, height / 100, 1);
      plane.scale.multiplyScalar(scale);
      plane.position.x = this.planeOffset.x + (this.parallax.x * 0.5);
      plane.position.y = this.planeOffset.y + (this.parallax.y * 0.5);
      plane.rotation.x = this.tilt.x + (isActive ? breathTiltX : 0);
      plane.rotation.y = this.tilt.y + (isActive ? breathTiltY : 0);
    });
  }

  dispose() {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerleave', this.onPointerLeave);
    this.planes.forEach((p) => {
      p.geometry.dispose();
      if (Array.isArray(p.material)) {
        p.material.forEach((m) => m.dispose());
      } else {
        p.material.dispose();
      }
    });
  }
}
