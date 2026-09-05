import VapeContentPage from "@/components/content/VapeContentPage";

export default function FaqPage() {
  return (
    <VapeContentPage
      title="Vaping FAQs"
      intro="Answers to common questions about products, compatibility, delivery and responsible vaping."
      sections={[
        { heading: "Which kit should I start with?", body: "Prefilled pods are the simplest option. Refillable pod systems give you more flavour choice and can reduce ongoing cost." },
        { heading: "How do I choose e-liquid?", body: "Match the nicotine strength and VG/PG ratio to your device. Smaller pod systems generally suit higher-PG or nic salt liquids." },
        { heading: "Which pod or coil fits my device?", body: "Check the product name and compatible range before ordering. Our support team can help confirm compatibility." },
        { heading: "How old do I need to be?", body: "You must be 18 or over to buy age-restricted products in the UK. Age verification may be required at checkout or delivery." },
      ]}
      links={[{ label: "Customer Support", href: "/contact" }, { label: "Age Verification", href: "/age-verification" }]}
    />
  );
}
