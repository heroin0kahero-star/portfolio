uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uBlend;
uniform vec2 uResolution;
varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;
  vec3 color = mix(uColorA, uColorB, uBlend);
  
  // Animated grain
  float grain = random(uv * uResolution * 0.5 + uTime) * 0.08;
  color += grain;
  
  // Subtle blobs
  float blob1 = smoothstep(0.8, 0.2, length(uv - vec2(0.3 + sin(uTime * 0.1) * 0.1, 0.4 + cos(uTime * 0.15) * 0.1)));
  float blob2 = smoothstep(0.8, 0.2, length(uv - vec2(0.7 + cos(uTime * 0.12) * 0.1, 0.6 + sin(uTime * 0.18) * 0.1)));
  color += mix(vec3(0.0), color * 1.2, blob1 * 0.3);
  color += mix(vec3(0.0), color * 1.1, blob2 * 0.2);
  
  gl_FragColor = vec4(color, 1.0);
}
