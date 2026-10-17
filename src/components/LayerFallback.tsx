/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function LayerFallback({ label }: { label: string }) {
  return (
    <div className="min-h-[60vh] bg-[radial-gradient(circle_at_top,#1a1a2e_0%,#000_70%)] text-white flex flex-col items-center justify-center gap-4 select-none">
      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
      <span className="text-[10px] tracking-[4px] text-white/40 uppercase font-mono">
        LOADING LAYER {label}
      </span>
    </div>
  );
}