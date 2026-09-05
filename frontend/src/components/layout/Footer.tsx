import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterContent {
  tagline: string;
  phone: string;
  email: string;
  address: string;
  instagramUrl?: string;
  facebookUrl?: string;
  columns: FooterColumn[];
  copyrightText: string;
}

const DEFAULT_FOOTER_CONTENT: FooterContent = {
  tagline:
    "Premium vapes, e-liquids and accessories, delivered discreetly across the UK.",
  phone: "+44 7443 176197",
  email: "hello@ecosmok.co.uk",
  address: "United Kingdom",
  instagramUrl: "",
  facebookUrl: "",
  columns: [
    {
      title: "Shop",
      links: [
        { label: "New Arrivals", href: "/collections/all" },
        { label: "Disposable Vapes", href: "/collections/disposable-vapes" },
        { label: "E-Liquids", href: "/collections/e-liquids" },
        { label: "Pod Kits", href: "/collections/pod-kits" },
        { label: "Accessories", href: "/collections/accessories" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { label: "Track Order", href: "/track-order" },
        { label: "Rewards Club", href: "/account" },
        { label: "Returns & Exchanges", href: "/returns" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ],
  copyrightText: "EcoSmoke. All rights reserved. 18+ only.",
};

export default function Footer({ content = DEFAULT_FOOTER_CONTENT }: { content?: FooterContent }) {
  const { tagline, phone, email, address, instagramUrl, facebookUrl, columns, copyrightText } = content;

  return (
    <footer className="mt-20 border-t border-neutral-200 bg-[#0A2540] text-neutral-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="font-serif text-xl text-white">ECOSMOK</p>
          <p className="mt-3 max-w-xs text-sm text-neutral-400">{tagline}</p>
          <div className="mt-5 flex gap-4">
            <Link href={instagramUrl || "#"} aria-label="Instagram">
              <Instagram className="h-5 w-5 hover:text-[#C5DC3B]" />
            </Link>
            <Link href={facebookUrl || "#"} aria-label="Facebook">
              <Facebook className="h-5 w-5 hover:text-[#C5DC3B]" />
            </Link>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-sm font-semibold text-white">{col.title}</p>
            <ul className="space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#C5DC3B]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="mb-4 text-sm font-semibold text-white">Get in Touch</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {copyrightText}
      </div>
    </footer>
  );
}
