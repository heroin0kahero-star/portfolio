uniform float uProgress;

varying vec2 vUv;

void main() {
  vec3 newPosition = position;

  // Distance from the centre of the plane drives the travelling wave.
  float distanceToCenter = distance(vec2(0.5), uv);

  // The wave is strongest while the portrait is still revealing and settles
  // to zero at uProgress = 1.
  float wave = (1.0 - uProgress) * sin(distanceToCenter * 20.0 - uProgress * 5.0);

  newPosition.z += wave;

  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
