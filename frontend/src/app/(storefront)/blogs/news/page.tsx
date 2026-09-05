import VapeContentPage from "@/components/content/VapeContentPage";

export default function NewsBlogPage() {
  return (
    <VapeContentPage
      title="Vaping news and product guides"
      intro="Practical, plain-English guidance for choosing devices, e-liquids, pods and accessories in the UK."
      sections={[
        { heading: "Choosing your first kit", body: "Compare simple prefilled pods, refillable pod systems and compact vape kits by battery life, draw style and running cost." },
        { heading: "Flavour and nicotine basics", body: "Learn the difference between nic salts, freebase liquids and shortfills before choosing your next bottle." },
        { heading: "Product comparisons", body: "Our editorial team breaks down new releases, replacement pods, coils and popular UK brands." },
      ]}
      links={[{ label: "Shop Vape Kits", href: "/collections/vaping-kits" }, { label: "Shop E-Liquids", href: "/collections/e-liquids" }]}
    />
  );
}
