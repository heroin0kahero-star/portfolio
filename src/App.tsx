/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Suman's portfolio — one visual language, work as hero.
 */

import React from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/sections/Hero";
import { WorkSection } from "./components/sections/Work";
import { PricingSection } from "./components/sections/Pricing";
import { AboutSection } from "./components/sections/About";
import { ContactSection } from "./components/sections/Contact";
import { PORTFOLIO_PROJECTS } from "./data";

export default function App() {
  return (
    <main className="relative min-h-[100dvh] bg-ground text-ink selection:bg-accent/30 selection:text-ink">
      <Nav />

      <Hero />

      <WorkSection projects={PORTFOLIO_PROJECTS} />

      <PricingSection />

      <AboutSection />

      <ContactSection />
    </main>
  );
}
