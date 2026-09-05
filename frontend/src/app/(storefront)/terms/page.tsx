import { api } from "@/lib/api";
import PolicyPageLayout, { PolicyContent } from "@/components/policy/PolicyPageLayout";

const DEFAULT_CONTENT: PolicyContent = {
  heading: "Terms of Service",
  intro: "By placing an order with us, you agree to the following terms.",
  sections: [],
};

export default async function TermsPage() {
  const content = (await api.getTermsContent().catch(() => null)) as PolicyContent | null;
  return <PolicyPageLayout content={content ?? DEFAULT_CONTENT} />;
}
