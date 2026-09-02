import { PortfolioProject } from "./types";

export const CONTACT_EMAIL = "sumankd0000@gmail.com";

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "proj-1",
    title: "Arts & Cuts Family Salon",
    category: "web",
    year: "2025",
    client: "Arts & Cuts Family Salon",
    description:
      "Business website for a family hair salon — services showcase, pricing, and easy appointment contact for local walk-ins and bookings.",
    imageUrl: "/images/projects/arts-and-cuts-salon.svg",
    tags: ["Web Design", "Business Site", "Services"],
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
    imageUrl: "/images/projects/kites-sports-foundation.svg",
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
    imageUrl: "/images/projects/play-365-titanfa.svg",
    tags: ["Web Development", "Football", "Academy Portal"],
    role: "Web Developer",
    siteUrl: "https://www.play365titanfa.in/",
  },
];