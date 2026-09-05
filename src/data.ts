import { PortfolioProject } from "./types";

export const CONTACT_EMAIL = "sumankd0000@gmail.com";

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "proj-1",
    title: "Suman Project — Loco Bear Demo",
    category: "web",
    year: "2026",
    client: "Suman Project",
    description:
      "This site shows multi-layer designing, custom-built cursor, interactive elements and a neumorphic design style.",
    imageUrl: "/images/projects/suman-project-preview.jpg",
    thumbnailUrl: "/images/projects/suman-project-thumb.jpg",
    tags: ["Web Design", "Interactive UI", "Multi-Layer"],
    role: "Web Developer",
  },
  {
    id: "proj-2",
    title: "Kites Sports Foundation",
    category: "web",
    year: "2025",
    client: "Kites Sports Foundation",
    description:
      "Informational website for a sports foundation — programmes, events, and community outreach presented in a bold, high-energy layout.",
    imageUrl: "/images/projects/kites-sports-foundation-preview.jpg",
    thumbnailUrl: "/images/projects/kites-sports-foundation-thumb.jpg",
    tags: ["Web Development", "Sports", "Non-Profit Web"],
    role: "Web Developer",
    siteUrl: "https://www.kitessportsfoundation.in/",
  },
  {
    id: "proj-3",
    title: "Play 365 Titan FA",
    category: "web",
    year: "2025",
    client: "Play 365",
    description:
      "Web portal for Play 365 Titan Football Academy — academy news, fixtures, and a talent showcase built to put the academy on the map.",
    imageUrl: "/images/projects/play-365-titanfa-preview.jpg",
    thumbnailUrl: "/images/projects/play-365-titanfa-thumb.jpg",
    tags: ["Web Development", "Football", "Academy Portal"],
    role: "Web Developer",
    siteUrl: "https://www.play365titanfa.in/",
  },
];