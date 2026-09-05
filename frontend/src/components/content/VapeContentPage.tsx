import Link from "next/link";

export interface VapeContentSection {
  heading: string;
  body: string;
}

export default function VapeContentPage({
  eyebrow = "EcoSmok UK",
  title,
  intro,
  sections,
  links = [],
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  sections: VapeContentSection[];
  links?: { label: string; href: string }[];
}) {
  return (
    <article className="mx-auto max-w-5xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0A2540]">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl text-[#0A2540]">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600">{intro}</p>
      {links.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full border border-[#0A2540] px-4 py-2 text-sm text-[#0A2540] hover:bg-[#0A2540] hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {sections.map((section) => (
          <section key={section.heading} className="border-t border-neutral-200 pt-5">
            <h2 className="text-xl font-semibold text-[#0A2540]">{section.heading}</h2>
            <p className="mt-3 leading-7 text-neutral-600">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
