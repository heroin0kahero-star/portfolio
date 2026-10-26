uniform sampler2D uTexture;
uniform float uTime;
uniform float uProgress;
uniform float uEdgeFade;

varying vec2 vUv;

#include ../includes/perlin3dNoise.glsl

void main() {
  // Displace the UV so the Perlin mask has a soft, liquid edge.
  vec2 displacedUv = vUv + cnoise(vec3(vUv * 5.0, uTime * 0.1));

  // Perlin noise mask.
  float strength = cnoise(vec3(displacedUv * 5.0, uTime * 0.2));

  // Radial gradient mixed into the noise, driven by the 0 to 1 progress.
  strength += distance(vUv, vec2(0.5)) * 12.5 - 7.0 * uProgress;

  // Invert and clamp to 0-1.
  strength = 1.0 - clamp(strength, 0.0, 1.0);

  // Fade the whole reveal in as progress starts, so the incoming texture is
  // fully invisible at 0.
  float opacityProgress = smoothstep(0.0, 0.7, uProgress);

  vec3 textureColor = texture2D(uTexture, vUv).rgb;

  // The radial mask already softens the corners. Feathering the four plane
  // edges as well keeps a centred mobile plane free of a hard box outline.
  float edge =
    smoothstep(0.0, 0.07, vUv.x) *
    smoothstep(0.0, 0.07, 1.0 - vUv.x) *
    smoothstep(0.0, 0.07, vUv.y) *
    smoothstep(0.0, 0.07, 1.0 - vUv.y);

  float alpha = strength * opacityProgress;
  alpha *= mix(1.0, edge, uEdgeFade);

  gl_FragColor = vec4(textureColor, alpha);

  #include <colorspace_fragment>
}
