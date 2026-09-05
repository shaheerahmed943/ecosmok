import VapeContentPage from "@/components/content/VapeContentPage";

export default function VapingKnowledgePage() {
  return (
    <VapeContentPage
      title="Vaping knowledge"
      intro="A practical starting point for safer, more informed product choices."
      sections={[
        { heading: "Vaping is for adult smokers", body: "Vaping products are intended for adults who already smoke or use nicotine. They are not for non-smokers, children or young people." },
        { heading: "Keep products secure", body: "Store devices, e-liquids and batteries away from children and pets. Follow the charging and storage guidance supplied with each product." },
        { heading: "Responsible use", body: "Read product instructions, avoid damaged batteries and stop using a product if it becomes unusually hot, damaged or leaks." },
      ]}
      links={[{ label: "Read FAQs", href: "/faq" }, { label: "Shop accessories", href: "/collections/accessories" }]}
    />
  );
}
