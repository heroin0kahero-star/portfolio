/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CSSProperties } from "react";

export interface PortfolioProject {
  id: string;
  title: string;
  category: "graphic" | "photography" | "3d" | "web" | "all";
  year: string;
  client: string;
  description: string;
  imageUrl: string;
  tags: string[];
  role?: string;
  siteUrl?: string;
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
