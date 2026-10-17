/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { CSSProperties } from "react";

export interface PortfolioProject {
  id: string;
  title: string;
  category: "web";
  year: string;
  client: string;
  description: string;
  videoUrl?: string;
  tags: string[];
  role?: string;
  siteUrl?: string;
  caseStudy: {
    clientNeeded: string;
    whatIBuilt: string;
    tools: string[];
    screenshots: {
      desktop?: string; // TODO: add /images/projects/<slug>-desktop.jpg
      phone?: string;   // TODO: add /images/projects/<slug>-phone.jpg
    };
    result?: string; // TODO(result): only fill if truthful, never invent
  };
}

export enum PortfolioLayer {
  CINEMATIC_SPACE = "Cinematic Space",
  NEUMORPHISM = "Tactile Neumorphism",
  BRUTALISM = "Raw Brutalism",
  NEO_BRUTALISM = "Neo-Brutalist Playground",
  EXPERIMENTAL = "Awwwards WebGL Experimental"
}

export interface FadingVideoProps {
  src: string;
  className?: string;
  style?: CSSProperties;
}
