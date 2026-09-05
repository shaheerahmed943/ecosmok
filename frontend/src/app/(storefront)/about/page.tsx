import { api } from "@/lib/api";
import AboutPageClient, { AboutContent } from "@/components/about/AboutPageClient";

const DEFAULT_CONTENT: AboutContent = {
  heroImageUrl: "",
  heroSubheading: "Elevated stitched & unstitched apparel, made with intention.",
  heading: "About Us",
  paragraphs: [
    "We curate boutique stitched and unstitched apparel, working with skilled artisans and fine fabrics — Lawn, Chiffon, Organza, and Velvet — to bring you considered, elevated pieces for everyday wear and special occasions.",
    "Every order is quality-checked before dispatch, and our styling desk (say hello to Aanya, our AI stylist, in the bottom-right corner) is always on hand to help you find the right piece.",
  ],
  storyImageUrl: "",
  values: [],
  galleryImages: [],
};

export default async function AboutPage() {
  const content = (await api.getAboutContent().catch(() => null)) as AboutContent | null;
  return <AboutPageClient content={content ?? DEFAULT_CONTENT} />;
}
