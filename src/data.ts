export const CONTACT_EMAIL = "sumankd0000@gmail.com";
export const PROJECT_INQUIRY_SUBJECT = "Project Inquiry — via portfolio website";

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi Suman, I saw your portfolio and I'd like a website for my business",
);

export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(
  /\D/g,
  "",
);

// If the environment variable is not set yet, WhatsApp still opens with the
// prefilled message instead of linking to a literal placeholder.
export const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`
  : `https://wa.me/?text=${WHATSAPP_MESSAGE}`;
