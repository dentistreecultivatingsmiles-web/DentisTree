import { motion } from "framer-motion";
import { FADE_UP, FADE_UP_VISIBLE, VIEWPORT_ONCE } from "@/components/site/motionPresets";
import {
  Sparkles, Sun, Activity, AlignCenterVertical, Anchor, Smile, Baby, ShieldPlus,
} from "lucide-react";

const ICONS = { Sparkles, Sun, Activity, AlignCenterVertical, Anchor, Smile, Baby, ShieldPlus };

export default function Services({ services, onBook }) {
  return (
    <section id="services" data-testid="services-section" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Our Services</span>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-3">
          Everything your smile needs
        </h2>
        <p className="text-base text-zinc-400 leading-relaxed mt-3 max-w-xl">
          Complete dental care under one roof by specialists from every branch of dentistry.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon] || Sparkles;
            return (
              <motion.div
                key={s.id}
                data-testid={`service-card-${i}`}
                initial={FADE_UP}
                whileInView={FADE_UP_VISIBLE}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.45, delay: (i % 4) * 0.07 }}
                className="group rounded-2xl bg-[#0A0A0A] border border-zinc-800 p-6 hover:border-emerald-500/40 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-emerald-400" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-zinc-100">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mt-2">{s.description}</p>
                <button
                  onClick={onBook}
                  data-testid={`service-book-btn-${i}`}
                  className="mt-4 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Book now →
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
