import { PortfolioProject } from "./types";

export const CONTACT_EMAIL = "sumankd0000@gmail.com";
export const WHATSAPP_NUMBER = "8792009091";
export const WHATSAPP_MESSAGE =
  "Hi Suman, I saw your portfolio and I'd like a website for my business";
export const CITY = "Bangalore";

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "proj-zenvora",
    title: "Zenvora Aesthetics",
    category: "web",
    year: "2026",
    client: "Zenvora Aesthetics",
    description:
      "A premium aesthetic clinic website for skin, hair, and fat-loss treatments in Bangalore.",
    videoUrl: "/images/projects/imeags/zenvora-clinic.mp4",
    tags: ["Clinic", "Skincare", "Web Design"],
    role: "Web Developer & Designer",
    siteUrl: "https://www.zenvoraaesthetics.in/",
    caseStudy: {
      clientNeeded:
        "A clean, trustworthy online presence for an aesthetic clinic offering skin, hair, and fat-loss treatments.",
      whatIBuilt:
        "A soft-neutral clinic website with service pages, booking inquiry, and a mobile-responsive layout.",
      tools: ["React", "Vite", "Tailwind CSS"],
      screenshots: {
        desktop: "/images/projects/zenvora-desktop.jpg", // TODO: add screenshot
        phone: "/images/projects/zenvora-phone.jpg", // TODO: add screenshot
      },
      result: "TODO(result): add truthful metric if available",
    },
  },
  {
    id: "proj-kites",
    title: "Kites Sports Foundation",
    category: "web",
    year: "2025",
    client: "Kites Sports Foundation",
    description:
      "An informational website for a sports foundation — programmes, events, and community outreach.",
    videoUrl: "/images/projects/imeags/kites-sports-foundation.mp4",
    tags: ["Sports Foundation", "Non-Profit", "Web Development"],
    role: "Web Developer",
    siteUrl: "https://www.kitessportsfoundation.in/",
    caseStudy: {
      clientNeeded:
        "A bold website to present programmes, events, and community outreach for a cricket and football arena.",
      whatIBuilt:
        "A high-energy informational site with event listings, programme details, and outreach sections.",
      tools: ["React", "Vite", "Tailwind CSS"],
      screenshots: {
        desktop: "/images/projects/kites-desktop.jpg", // TODO: add screenshot
        phone: "/images/projects/kites-phone.jpg", // TODO: add screenshot
      },
      result: "TODO(result): add truthful metric if available",
    },
  },
  {
    id: "proj-titan",
    title: "Play 365 Titan FA",
    category: "web",
    year: "2025",
    client: "Play 365 Titan FA",
    description:
      "A web portal for a football academy — academy news, fixtures, and a talent showcase.",
    videoUrl: "/images/projects/imeags/titan-football-academy.mp4",
    tags: ["Football Academy", "Portal", "Web Development"],
    role: "Web Developer",
    siteUrl: "https://www.play365titanfa.in/",
    caseStudy: {
      clientNeeded:
        "A portal for a football academy to publish news, fixtures, and showcase player talent.",
      whatIBuilt:
        "A football academy portal with a news blog, fixture listings, and a player talent showcase.",
      tools: ["React", "Vite", "Tailwind CSS"],
      screenshots: {
        desktop: "/images/projects/titan-desktop.jpg", // TODO: add screenshot
        phone: "/images/projects/titan-phone.jpg", // TODO: add screenshot
      },
      result: "TODO(result): add truthful metric if available",
    },
  },
];
