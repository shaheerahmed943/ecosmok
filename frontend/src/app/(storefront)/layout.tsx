import Header, { HeaderNavLink } from "@/components/layout/Header";
import Footer, { FooterContent } from "@/components/layout/Footer";
import MiniCart from "@/components/cart/MiniCart";
import ChatWidget from "@/components/ai/ChatWidget";
import AgeGate from "@/components/compliance/AgeGate";
import WhatsAppButton from "@/components/contact/WhatsAppButton";
import { api } from "@/lib/api";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [headerResult, footerResult] = await Promise.allSettled([
    api.getHeaderContent() as Promise<{ navLinks: HeaderNavLink[] }>,
    api.getFooterContent() as Promise<FooterContent>,
  ]);

  const navLinks = headerResult.status === "fulfilled" ? headerResult.value.navLinks : undefined;
  const footerContent = footerResult.status === "fulfilled" ? footerResult.value : undefined;

  return (
    <>
      <Header navLinks={navLinks} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer content={footerContent} />
      <MiniCart />
      <ChatWidget />
      <WhatsAppButton />
      <AgeGate />
    </>
  );
}
