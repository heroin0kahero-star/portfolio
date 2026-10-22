/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, type ReactNode } from "react";
import { Navigation } from "./components/Navigation";
import { ProgressiveBlurEdges } from "./components/ProgressiveBlurEdges";
import { HeroSection } from "./components/sections/HeroSection";
import { CapabilitiesSection } from "./components/sections/CapabilitiesSection";
import { TimelineAnimation } from "./components/TimelineAnimation";
import ContactSection from "./components/ContactSection";
import { MotionFooter } from "./components/MotionFooter";
import ErrorBoundary from "./components/ErrorBoundary";
import { LayerFallback } from "./components/LayerFallback";

const AboutSection = lazy(() => import("./components/AboutSection"));
const NeoBrutalismLayer = lazy(() =>
  import("./components/layers/NeoBrutalismLayer").then((module) => ({
    default: module.NeoBrutalismLayer,
  })),
);
const LiveBuildsSection = lazy(() => import("./components/LiveBuildsSection"));

function SectionBoundary({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <ErrorBoundary label={label}>
      <Suspense fallback={<LayerFallback label={label} />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <>
      <Navigation />
      <ProgressiveBlurEdges />
      <main className="relative min-h-screen bg-black text-white selection:bg-indigo-500/20">
        <HeroSection />

        <SectionBoundary label="About">
          <AboutSection />
        </SectionBoundary>

        <TimelineAnimation />

        <CapabilitiesSection />

        <SectionBoundary label="Live builds">
          <LiveBuildsSection />
        </SectionBoundary>

        <SectionBoundary label="Pricing">
          <NeoBrutalismLayer />
        </SectionBoundary>

        <ContactSection />
      </main>
      <MotionFooter />
    </>
  );
}
