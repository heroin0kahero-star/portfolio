/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The graphite pencil line. The ribbon is built once (rebuilt only on resize)
 * and revealed with setDrawRange. Its tip sits TIP_LEAD in front of the camera
 * at the same progress, so it touches each card centre exactly when that card
 * is focused.
 */

import * as THREE from 'three';
import {
  FOV_RAD,
  GRAPHITE,
  RADIAL,
  SAMPLES,
  TIP_LEAD,
} from './constants';
import { pathX, pathY, tubeZ } from './path';

function samplePencil(strand = 0) {
  const points = [];

  for (let i = 0; i < SAMPLES; i += 1) {
    const p = i / (SAMPLES - 1);
    const phase = strand ? 2.1 : 0;
    const wobX =
      0.01 * Math.sin(17 * p + phase) +
      0.005 * Math.sin(41 * p + 1.7 + phase);
    const wobY = 0.008 * Math.sin(23 * p + 0.4 + phase);
    const dy = strand ? 0.018 : 0;

    points.push(
      new THREE.Vector3(pathX(p) + wobX, pathY(p) + wobY + dy, tubeZ(p))
    );
  }

  return points;
}

export function buildRibbon(points, radius, radial = RADIAL) {
  const count = points.length;
  const positions = [];
  const indices = [];

  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const offset = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const side = new THREE.Vector3(1, 0, 0);

  for (let i = 0; i < count; i += 1) {
    const a = points[Math.max(i - 1, 0)];
    const b = points[Math.min(i + 1, count - 1)];
    tangent.subVectors(b, a).normalize();

    // (0,0,1) collapses when the path runs along -Z. Use +Y, and only fall
    // back to +X when the tangent is nearly vertical.
    const reference = Math.abs(tangent.y) > 0.95 ? side : up;
    normal.crossVectors(reference, tangent).normalize();
    binormal.crossVectors(tangent, normal).normalize();

    const t = count === 1 ? 0 : i / (count - 1);
    const ringRadius = typeof radius === 'function' ? radius(t) : radius;

    for (let j = 0; j <= radial; j += 1) {
      const theta = (j / radial) * Math.PI * 2;
      offset
        .copy(normal)
        .multiplyScalar(Math.cos(theta) * ringRadius)
        .addScaledVector(binormal, Math.sin(theta) * ringRadius);

      positions.push(
        points[i].x + offset.x,
        points[i].y + offset.y,
        points[i].z + offset.z
      );
    }
  }

  for (let i = 0; i < count - 1; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const a = i * (radial + 1) + j;
      const b = (i + 1) * (radial + 1) + j;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

export function createPencil({
  viewportHeightPx,
  phone = false,
  radiusScale = 1,
} = {}) {
  const group = new THREE.Group();
  group.name = 'hww-pencil';

  const materialMain = new THREE.MeshBasicMaterial({
    color: GRAPHITE,
    transparent: true,
    opacity: 0.92,
    fog: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    toneMapped: false,
  });

  const materialFine = new THREE.MeshBasicMaterial({
    color: GRAPHITE,
    transparent: true,
    opacity: 0.45,
    fog: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    toneMapped: false,
  });

  const main = new THREE.Mesh(new THREE.BufferGeometry(), materialMain);
  const fine = new THREE.Mesh(new THREE.BufferGeometry(), materialFine);
  main.name = 'hww-pencil-main';
  fine.name = 'hww-pencil-fine';
  main.frustumCulled = false;
  fine.frustumCulled = false;
  group.add(main, fine);

  let heightPx = Math.max(1, viewportHeightPx);
  let isPhone = phone;
  let scale = radiusScale;
  let currentP = 0;

  function rebuild() {
    const pxPerUnit =
      heightPx / (2 * TIP_LEAD * Math.tan(FOV_RAD / 2));
    const baseRadius = (1.1 / Math.max(pxPerUnit, 0.0001)) * scale;

    const nextMain = buildRibbon(
      samplePencil(0),
      (t) => baseRadius * (0.7 + 0.3 * t)
    );
    const nextFine = buildRibbon(
      samplePencil(1),
      (t) => baseRadius * 0.6 * (0.7 + 0.3 * t)
    );

    main.geometry.dispose();
    fine.geometry.dispose();
    main.geometry = nextMain;
    fine.geometry = nextFine;

    fine.visible = !isPhone;
    update(currentP);
  }

  function update(p) {
    currentP = THREE.MathUtils.clamp(p, 0, 1);
    const shown = Math.floor(currentP * (SAMPLES - 1)) * RADIAL * 6;
    main.geometry.setDrawRange(0, shown);
    fine.geometry.setDrawRange(0, shown);
  }

  rebuild();

  return {
    group,
    rebuild(next = {}) {
      if (Number.isFinite(next.viewportHeightPx)) {
        heightPx = Math.max(1, next.viewportHeightPx);
      }
      if (typeof next.phone === 'boolean') {
        isPhone = next.phone;
      }
      if (Number.isFinite(next.radiusScale)) {
        scale = Math.max(0.1, next.radiusScale);
      }
      rebuild();
    },
    update,
    dispose() {
      group.remove(main, fine);
      main.geometry.dispose();
      fine.geometry.dispose();
      materialMain.dispose();
      materialFine.dispose();
    },
  };
}
