"use client";

import { motion } from "framer-motion";

export interface PolicySection {
  heading: string;
  body: string;
}

export interface PolicyContent {
  heading: string;
  intro: string;
  sections: PolicySection[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PolicyPageLayout({
  content,
  children,
}: {
  content: PolicyContent;
  children?: React.ReactNode;
}) {
  const { heading, intro, sections } = content;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.5 }}>
        <h1 className="font-serif text-3xl text-[#0A2540]">{heading}</h1>
        {intro && <p className="mt-4 leading-relaxed text-neutral-600">{intro}</p>}
      </motion.div>

      {children}

      <div className="mt-10 space-y-8">
        {sections.map((section, idx) => (
          <motion.section
            key={idx}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
          >
            <h2 className="font-serif text-lg text-[#0A2540]">{section.heading}</h2>
            <p className="mt-2 leading-relaxed text-neutral-700">{section.body}</p>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
