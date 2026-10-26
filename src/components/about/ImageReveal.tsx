/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * A single textured plane using the Perlin + radial image reveal shader.
 * Ported from Colin Demouge's r3f-image-reveal-effect.
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useTexture } from "@react-three/drei";
import { extend, useThree, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import imageRevealFragmentShader from "../../shaders/imageReveal/fragment.glsl";
import imageRevealVertexShader from "../../shaders/imageReveal/vertex.glsl";

export const ImageRevealMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uTime: 0,
    uProgress: 0,
    uEdgeFade: 0,
  },
  imageRevealVertexShader,
  imageRevealFragmentShader,
  (material) => {
    if (!material) return;
    material.transparent = true;
    material.depthTest = false;
    material.depthWrite = false;
  },
);

extend({ ImageRevealMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    imageRevealMaterial: ThreeElement<typeof ImageRevealMaterial>;
  }
}

export interface ImageRevealHandle {
  setTime: (time: number) => void;
  setProgress: (progress: number) => void;
  setVisible: (visible: boolean) => void;
}

interface ImageRevealProps {
  source: string;
  renderOrder: number;
}

export const ImageReveal = forwardRef<ImageRevealHandle, ImageRevealProps>(
  function ImageReveal({ source, renderOrder }, ref) {
    const meshRef = useRef<THREE.Mesh | null>(null);
    const materialRef = useRef<InstanceType<typeof ImageRevealMaterial> | null>(
      null,
    );
    const texture = useTexture(source);
    const { size, viewport } = useThree();
    const isMobile = size.width < 768;

    // The plane is sized from the viewport every time the canvas or the
    // breakpoint changes. Desktop covers the frame; mobile is a centred plane
    // at 78% of the viewport width.
    const [planeWidth, planeHeight] = useMemo(() => {
      const image = texture.image as
        | { width?: number; height?: number }
        | undefined;
      const fallbackAspect = 16 / 9;
      const aspect =
        image?.width && image?.height
          ? image.width / image.height
          : fallbackAspect;

      if (isMobile) {
        const width = viewport.width * 0.78;
        return [width, width / aspect];
      }

      // Cover: fill the viewport in both axes while preserving the image
      // aspect ratio. Any overflow is clipped by the canvas.
      const height = Math.max(viewport.height, viewport.width / aspect);
      return [height * aspect, height];
    }, [isMobile, texture.image, viewport.height, viewport.width]);

    useLayoutEffect(() => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }, [texture]);

    useEffect(() => {
      const material = materialRef.current;
      if (!material) return;
      material.uniforms.uTexture.value = texture;
      material.uniforms.uEdgeFade.value = isMobile ? 1 : 0;
    }, [isMobile, texture]);

    useEffect(
      () => () => {
        materialRef.current?.dispose();
        texture.dispose();
      },
      [texture],
    );

    useImperativeHandle(
      ref,
      () => ({
        setTime(time: number) {
          const material = materialRef.current;
          if (material) material.uniforms.uTime.value = time;
        },
        setProgress(progress: number) {
          const material = materialRef.current;
          if (material) material.uniforms.uProgress.value = progress;
        },
        setVisible(visible: boolean) {
          const mesh = meshRef.current;
          if (mesh) mesh.visible = visible;
        },
      }),
      [],
    );

    return (
      <mesh
        ref={meshRef}
        scale={[planeWidth, planeHeight, 1]}
        renderOrder={renderOrder}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1, 32, 32]} />
        <imageRevealMaterial ref={materialRef} attach="material" />
      </mesh>
    );
  },
);
