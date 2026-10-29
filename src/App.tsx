/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ReactNode } from "react";
import { ProgressiveBlurEdges } from "./components/ProgressiveBlurEdges";
import { HeroSection } from "./components/sections/HeroSection";
import { CapabilitiesSection } from "./components/sections/CapabilitiesSection";
import { HowWeWorkSection } from "./components/sections/HowWeWorkSection";
import PricingSection from "./components/PricingSection";
import ContactSection from "./components/ContactSection";
import { MotionFooter } from "./components/MotionFooter";
import ErrorBoundary from "./components/ErrorBoundary";
import { PortalStage, SectionPortals } from "./components/SectionPortal";
import AboutSection from "./components/AboutSection";
import LiveBuildsSection from "./components/LiveBuildsSection";

// About and Live Builds are part of the first paint. They own scroll-pinned
// timelines whose measurements feed every later trigger, so mounting them on
// demand (React.lazy) made the page grow after load, shifted every section
// below them, and left first-time visitors looking at empty placeholders.
function SectionBoundary({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return <ErrorBoundary label={label}>{children}</ErrorBoundary>;
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
          <HowWeWorkSection />
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
