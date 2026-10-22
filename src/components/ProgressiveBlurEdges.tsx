/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Static progressive edge blur. Six stacked backdrop-filter layers per edge,
 * each masked to a different band. Blur is strongest at the viewport edge and
 * fades to sharp toward the middle. Sits above page content but below the nav.
 */

const BLUR_LAYERS = [0, 1, 2, 3, 4, 5];

function BlurEdge({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div className={`progressive-blur progressive-blur--${edge}`} aria-hidden="true">
      {BLUR_LAYERS.map((index) => (
        <span key={index} className="progressive-blur__layer" />
      ))}
      <span className="progressive-blur__fallback" />
    </div>
  );
}

export function ProgressiveBlurEdges() {
  return (
    <div className="progressive-blur-edges" aria-hidden="true">
      <BlurEdge edge="top" />
      <BlurEdge edge="bottom" />
    </div>
  );
}
