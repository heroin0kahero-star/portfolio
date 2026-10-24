/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, type ReactNode } from "react";
import { ProgressiveBlurEdges } from "./components/ProgressiveBlurEdges";
import { HeroSection } from "./components/sections/HeroSection";
import { CapabilitiesSection } from "./components/sections/CapabilitiesSection";
import { TimelineAnimation } from "./components/TimelineAnimation";
import PricingSection from "./components/PricingSection";
import ContactSection from "./components/ContactSection";
import { MotionFooter } from "./components/MotionFooter";
import ErrorBoundary from "./components/ErrorBoundary";
import { LayerFallback } from "./components/LayerFallback";
import { PortalStage, SectionPortals } from "./components/SectionPortal";

const AboutSection = lazy(() => import("./components/AboutSection"));
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
      <ProgressiveBlurEdges />
      <main className="relative min-h-screen bg-black text-white selection:bg-indigo-500/20">
        <HeroSection />

        <PortalStage name="about">
          <SectionBoundary label="About">
            <AboutSection />
          </SectionBoundary>
        </PortalStage>

        <PortalStage name="process">
          <TimelineAnimation />
        </PortalStage>

        <PortalStage name="capabilities">
          <CapabilitiesSection />
        </PortalStage>

        <PortalStage name="live-builds">
          <SectionBoundary label="Live builds">
            <LiveBuildsSection />
          </SectionBoundary>
        </PortalStage>

        <PortalStage name="pricing">
          <PricingSection />
        </PortalStage>
      </main>

      <PortalStage name="footer">
        <ContactSection />
        <MotionFooter />
      </PortalStage>

      <SectionPortals />
    </>
  );
}
