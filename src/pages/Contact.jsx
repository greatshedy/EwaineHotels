import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Button from "../components/Button";

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const faqs = [
  { q: "How do I book a hotel?", a: "Simply search for your destination, select a hotel, choose your dates and room type, then complete your booking." },
  { q: "Can I cancel my booking?", a: "Yes, most bookings can be cancelled free of charge up to 24 hours before check-in." },
  { q: "Is my payment secure?", a: "Absolutely. We use industry-standard encryption to protect all payment information." },
  { q: "How do I contact a hotel?", a: "Each hotel's contact information is listed on their detail page." },
];

export default function Contact() {
  return (
    <div>
      <section className="relative py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 dark:from-primary/20 dark:via-accent/10 dark:to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-bold mb-4">Contact Us</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-lg text-text-secondary">We would love to hear from you.</motion.p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <motion.div variants={fadeUp}><input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary transition-all" /></motion.div>
              <motion.div variants={fadeUp}><input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary transition-all" /></motion.div>
              <motion.div variants={fadeUp}><input type="text" placeholder="Subject" className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary transition-all" /></motion.div>
              <motion.div variants={fadeUp}><textarea rows={5} placeholder="Your Message" className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" /></motion.div>
              <motion.div variants={fadeUp}><Button size="lg">Send Message</Button></motion.div>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            {[
              { icon: MapPin, label: "Address", value: "123 Marina Road, Lagos Island, Lagos, Nigeria" },
              { icon: Phone, label: "Phone", value: "+234 800 123 4567" },
              { icon: Mail, label: "Email", value: "hello@ewainehotels.com" },
              { icon: Clock, label: "Hours", value: "Monday - Saturday: 8:00 AM - 8:00 PM" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0"><item.icon className="w-6 h-6 text-primary" /></div>
                <div><h3 className="font-semibold">{item.label}</h3><p className="text-sm text-text-secondary">{item.value}</p></div>
              </div>
            ))}

            {/* Map Placeholder */}
            <div className="rounded-2xl overflow-hidden h-48 bg-surface-alt dark:bg-dark-surface flex items-center justify-center mt-6">
              <div className="text-center"><MapPin className="w-8 h-8 text-primary mx-auto mb-2" /><p className="text-sm text-text-secondary">Map Location</p><p className="text-xs text-text-secondary">Lagos, Nigeria</p></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-surface-alt dark:bg-dark-surface">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 [&[open]]:pb-4 group cursor-pointer">
                <summary className="font-semibold list-none flex items-center justify-between cursor-pointer">{faq.q}<span className="text-primary group-open:rotate-180 transition-transform">▼</span></summary>
                <p className="mt-3 text-sm text-text-secondary">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
