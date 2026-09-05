"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";

export interface ContactContent {
  heading: string;
  intro: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  imageUrl: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function ContactPageClient({ content }: { content: ContactContent }) {
  const { heading, intro, phone, email, address, hours, imageUrl } = content;

  const infoItems = [
    { icon: Phone, label: "Phone", value: phone },
    { icon: Mail, label: "Email", value: email },
    { icon: MapPin, label: "Address", value: address },
    { icon: Clock, label: "Hours", value: hours },
  ].filter((item) => item.value);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h1 className="font-serif text-3xl text-[#0A2540] sm:text-4xl">{heading}</h1>
        {intro && <p className="mt-3 text-neutral-600">{intro}</p>}
      </motion.div>

      {infoItems.length > 0 && (
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {infoItems.map((item, idx) => (
            <motion.div
              key={item.label}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="rounded-xl border border-neutral-200 bg-white p-4 text-center"
            >
              <item.icon className="mx-auto mb-2 h-5 w-5 text-[#0A2540]" />
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{item.label}</p>
              <p className="mt-1 text-sm text-[#0A2540]">{item.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-14">
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative min-h-[320px] overflow-hidden rounded-2xl"
          >
            <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center rounded-2xl border border-neutral-200 bg-white p-8"
        >
          <ContactForm />
        </motion.div>
      </div>
    </div>
  );
}
