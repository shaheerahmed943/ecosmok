import { api } from "@/lib/api";
import ContactPageClient, { ContactContent } from "@/components/contact/ContactPageClient";

const DEFAULT_CONTENT: ContactContent = {
  heading: "Get in Touch",
  intro:
    "Questions about an order, sizing, or a custom stitching request? Reach out and our team will respond within 24 hours.",
  phone: "+92 300 0000000",
  email: "hello@boutique.example",
  address: "Karachi, Pakistan",
  hours: "Mon – Sat, 11am – 8pm",
  imageUrl: "",
};

export default async function ContactPage() {
  const content = (await api.getContactContent().catch(() => null)) as ContactContent | null;
  return <ContactPageClient content={content ?? DEFAULT_CONTENT} />;
}
