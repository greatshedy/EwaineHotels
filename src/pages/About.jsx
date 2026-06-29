import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BadgeCheck, Target, Eye, Heart, Award, Users, Building2, MapPin } from "lucide-react";
import { getTeam } from "../services/api";
import Button from "../components/Button";

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

const stats = [
  { icon: Building2, value: "10,000+", label: "Hotels Listed" },
  { icon: Users, value: "500,000+", label: "Happy Customers" },
  { icon: MapPin, value: "120+", label: "Cities" },
  { icon: Award, value: "50+", label: "Awards Won" },
];

const values = [
  { icon: BadgeCheck, title: "Excellence", desc: "We strive for the highest standards in everything we do." },
  { icon: Heart, title: "Hospitality", desc: "Genuine care and warmth in every interaction." },
  { icon: Target, title: "Innovation", desc: "Constantly improving to serve you better." },
  { icon: Eye, title: "Transparency", desc: "Honest pricing and clear communication always." },
];

const timeline = [
  { year: "2018", title: "Founded", desc: "EwaineHotels was born from a vision to transform African hospitality." },
  { year: "2019", title: "100 Hotels", desc: "Reached 100 partner hotels across Nigeria and Ghana." },
  { year: "2021", title: "500,000 Bookings", desc: "Celebrated half a million successful bookings." },
  { year: "2023", title: "Pan-African Expansion", desc: "Expanded to 15 African countries with 10,000+ listings." },
  { year: "2025", title: "Global Reach", desc: "Launched international listings and 24/7 concierge service." },
];

export default function About() {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    getTeam()
      .then((data) => setTeam(data || []))
      .catch(() => {});
  }, []);
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 dark:from-primary/20 dark:via-accent/10 dark:to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-bold mb-4">About EwaineHotels</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-lg text-text-secondary max-w-2xl mx-auto">Connecting travelers with exceptional stays across Africa and beyond.</motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-text-secondary leading-relaxed mb-4">Founded in 2018, EwaineHotels set out to revolutionize the way travelers discover and book accommodations across Africa. What started as a small platform featuring 50 hotels in Lagos has grown into a continent-wide marketplace with over 10,000 properties.</p>
            <p className="text-text-secondary leading-relaxed">Our team is passionate about showcasing the best of African hospitality — from luxury beach resorts to charming boutique hotels — making every trip unforgettable.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" alt="Hotel lobby" className="w-full h-80 object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-surface-alt dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center p-6">
                <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-sm text-text-secondary">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-8">
            <Target className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Our Mission</h3>
            <p className="text-text-secondary">To make booking the perfect stay effortless, secure, and delightful for every traveler — while showcasing the best of African hospitality.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-8">
            <Eye className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Our Vision</h3>
            <p className="text-text-secondary">To become Africa's most trusted hotel booking platform, connecting millions of travelers with unforgettable experiences across the continent and beyond.</p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-surface-alt dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-12">Core Values</motion.h2>
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <motion.div key={v.title} variants={fadeUp} className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4"><v.icon className="w-7 h-7 text-primary" /></div>
                <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-text-secondary">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-12">Meet the Team</motion.h2>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((t) => (
            <motion.div key={t.id} variants={fadeUp} className="glass rounded-2xl p-6 text-center">
              <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
              <h3 className="font-bold text-lg">{t.name}</h3>
              <p className="text-sm text-primary font-medium mb-2">{t.role}</p>
              <p className="text-xs text-text-secondary">{t.bio}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-surface-alt dark:bg-dark-surface">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="space-y-8">
            {timeline.map((t, i) => (
              <motion.div key={t.year} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 text-right"><span className="text-sm font-bold text-primary">{t.year}</span></div>
                <div className="w-px h-full bg-border dark:bg-dark-border relative mt-2">
                  <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-primary" />
                </div>
                <div className="glass rounded-xl p-4 flex-1">
                  <h3 className="font-bold">{t.title}</h3>
                  <p className="text-sm text-text-secondary">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Stay?</h2>
          <p className="text-text-secondary mb-6 max-w-lg mx-auto">Join hundreds of thousands of happy travelers who trust EwaineHotels.</p>
          <Link to="/hotels"><Button size="lg">Browse Hotels</Button></Link>
        </motion.div>
      </section>
    </div>
  );
}
