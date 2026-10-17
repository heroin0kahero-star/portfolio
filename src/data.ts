import { PortfolioProject } from "./types";

export const CONTACT_EMAIL = "sumankd0000@gmail.com";

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "proj-1",
    title: "Zenvora Aesthetics — Skin, Hair & Fat-Loss Clinic",
    category: "web",
    year: "2026",
    client: "Zenvora Aesthetics",
    description:
      "A premium aesthetic clinic website I designed and built — clean, soft-neutral skincare and clinic visuals for Zenvora Aesthetics in Indiranagar.",
    videoUrl: "/images/projects/imeags/zenvora-clinic.mp4",
    tags: ["Aesthetic Clinic", "Skincare", "Web Design"],
    role: "Web Developer & Designer",
    siteUrl: "https://www.zenvoraaesthetics.in/",
    caseStudy: {
      clientNeeded:
        "A premium, trustworthy online presence for an aesthetic clinic offering skin, hair, and fat-loss treatments.",
      whatIBuilt:
        "A clean, soft-neutral clinic website with service pages, booking inquiry, and mobile-responsive design.",
      result: "TODO(result): add conversion or inquiry metric",
    },
  },
  {
    id: "proj-2",
    title: "Kites Sports Foundation",
    category: "web",
    year: "2025",
    client: "Kites Sports Foundation",
    description:
      "Informational website for a sports foundation — programmes, events, and community outreach presented in a bold, high-energy layout.",
    videoUrl: "/images/projects/imeags/kites-sports-foundation.mp4",
    tags: ["Web Development", "Sports", "Non-Profit Web"],
    role: "Web Developer",
    siteUrl: "https://www.kitessportsfoundation.in/",
    caseStudy: {
      clientNeeded:
        "A bold, high-energy website to showcase programmes, events, and community outreach for a cricket and football arena.",
      whatIBuilt:
        "An informational sports foundation site with event listings, programme details, and community outreach sections.",
      result: "TODO(result): add registration or traffic metric",
    },
  },
  {
    id: "proj-3",
    title: "Play 365 Titan FA",
    category: "web",
    year: "2025",
    client: "Play 365",
    description:
      "Web portal for Play 365 Titan Football Academy — academy news, fixtures, and a talent showcase built to put the academy on the map.",
    videoUrl: "/images/projects/imeags/titan-football-academy.mp4",
    tags: ["Web Development", "Football", "Academy Portal"],
    role: "Web Developer",
    siteUrl: "https://www.play365titanfa.in/",
    caseStudy: {
      clientNeeded:
        "A web portal for a football academy to publish news, fixtures, and showcase player talent.",
      whatIBuilt:
        "A football academy portal with news blog, fixture listings, and a talent showcase for players.",
      result: "TODO(result): add signup or engagement metric",
    },
  },
];
