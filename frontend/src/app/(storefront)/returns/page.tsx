import { api } from "@/lib/api";
import PolicyPageLayout, { PolicyContent } from "@/components/policy/PolicyPageLayout";

const DEFAULT_CONTENT: PolicyContent = {
  heading: "Returns & Exchanges",
  intro:
    "We want you to love what you ordered. If something isn't right, here's how returns and exchanges work.",
  sections: [],
};

export default async function ReturnsPage() {
  const content = (await api.getReturnsContent().catch(() => null)) as PolicyContent | null;
  return <PolicyPageLayout content={content ?? DEFAULT_CONTENT} />;
}
