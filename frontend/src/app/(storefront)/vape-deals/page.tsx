import VapeContentPage from "@/components/content/VapeContentPage";

export default function VapeDealsPage() {
  return (
    <VapeContentPage
      eyebrow="Offers and bundles"
      title="Vape deals built for better value"
      intro="Save on curated kits, replacement pods, e-liquids and multi-buy offers. Offers can be managed from the admin catalogue and coupon tools."
      sections={[
        { heading: "Kit bundles", body: "Pair a popular pod kit with compatible pods and e-liquid so you can get started with one simple order." },
        { heading: "Multi-buy e-liquids", body: "Stock up on favourite flavours with bundle pricing across selected nic salts and shortfills." },
        { heading: "New product offers", body: "Check this page regularly for new-in launches, seasonal promotions and limited stock deals." },
      ]}
      links={[{ label: "Shop all products", href: "/collections/all" }, { label: "Shop vape kits", href: "/collections/vaping-kits" }, { label: "Shop e-liquids", href: "/collections/e-liquids" }]}
    />
  );
}
