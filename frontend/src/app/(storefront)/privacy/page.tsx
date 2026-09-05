import { api } from "@/lib/api";
import PolicyPageLayout, { PolicyContent } from "@/components/policy/PolicyPageLayout";

const DEFAULT_CONTENT: PolicyContent = {
  heading: "Privacy Policy",
  intro:
    "We respect your privacy. This page explains what information we collect when you shop with us and how it's used.",
  sections: [],
};

export default async function PrivacyPage() {
  const content = (await api.getPrivacyContent().catch(() => null)) as PolicyContent | null;
  return <PolicyPageLayout content={content ?? DEFAULT_CONTENT} />;
}
