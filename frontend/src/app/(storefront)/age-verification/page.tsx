import VapeContentPage from "@/components/content/VapeContentPage";

export default function AgeVerificationPage() {
  return (
    <VapeContentPage
      title="Age verification"
      intro="EcoSmok is an 18+ retailer. We use age checks to help prevent restricted products reaching underage customers."
      sections={[
        { heading: "Why checks are required", body: "UK law restricts the sale of vaping and nicotine products to adults. We may ask for proof of age during checkout or delivery." },
        { heading: "Accepted identification", body: "A valid photo driving licence, passport or approved proof-of-age document may be requested by our verification or delivery partners." },
        { heading: "Failed verification", body: "If verification cannot be completed, the order may be paused or cancelled. Contact support if you believe a check was incorrect." },
      ]}
      links={[{ label: "Contact support", href: "/contact" }, { label: "Shop responsibly", href: "/collections/all" }]}
    />
  );
}
