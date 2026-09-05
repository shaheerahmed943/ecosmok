"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Gem, Hammer, ShieldCheck, Truck } from "lucide-react";

export interface AboutValue {
  title: string;
  description: string;
}

export interface AboutContent {
  heroImageUrl: string;
  heroSubheading: string;
  heading: string;
  paragraphs: string[];
  storyImageUrl: string;
  values: AboutValue[];
  galleryImages: string[];
}

const VALUE_ICONS = [Gem, Hammer, ShieldCheck, Truck];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function AboutPageClient({ content }: { content: AboutContent }) {
  const { heroImageUrl, heroSubheading, heading, paragraphs, storyImageUrl, values, galleryImages } = content;

  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[50vh] min-h-[360px] w-full items-end overflow-hidden bg-[#0A2540]">
        {heroImageUrl && (
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image src={heroImageUrl} alt={heading} fill priority className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 px-6 pb-14 sm:px-14"
        >
          <h1 className="font-serif text-4xl text-white sm:text-5xl">{heading}</h1>
          {heroSubheading && <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base">{heroSubheading}</p>}
        </motion.div>
      </section>

      {/* Story */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="order-2 lg:order-1"
        >
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="mt-4 leading-relaxed text-neutral-700 first:mt-0">
              {paragraph}
            </p>
          ))}
        </motion.div>
        {storyImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative order-1 aspect-[4/5] w-full overflow-hidden rounded-2xl lg:order-2"
          >
            <Image src={storyImageUrl} alt="Our atelier" fill className="object-cover" unoptimized />
          </motion.div>
        )}
      </section>

      {/* Values */}
      {values.length > 0 && (
        <section className="bg-[#F5F2EC] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center font-serif text-2xl text-[#0A2540] sm:text-3xl"
            >
              What Sets Us Apart
            </motion.h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, idx) => {
                const Icon = VALUE_ICONS[idx % VALUE_ICONS.length];
                return (
                  <motion.div
                    key={value.title}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={fadeUp}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="rounded-2xl border border-neutral-200 bg-white p-6"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A2540]/10 text-[#0A2540]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-[#0A2540]">{value.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center font-serif text-2xl text-[#0A2540] sm:text-3xl"
          >
            From the Atelier
          </motion.h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {galleryImages.map((url, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
