import { motion } from "framer-motion";
import { FADE_UP, FADE_UP_VISIBLE, VIEWPORT_ONCE } from "@/components/site/motionPresets";
import { GraduationCap } from "lucide-react";

export default function Doctors({ doctors }) {
  return (
    <section id="doctors" data-testid="doctors-section" className="py-16 sm:py-24 bg-[#0A0A0A] border-y border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Meet the Team</span>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-3">
          Specialists who care
        </h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((d, i) => (
            <motion.div
              key={d.id}
              data-testid={`doctor-card-${i}`}
              initial={FADE_UP}
              whileInView={FADE_UP_VISIBLE}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col sm:flex-row gap-5 rounded-2xl bg-[#121212] border border-zinc-800 p-5 hover:border-emerald-500/30 transition-colors"
            >
              <div className="w-full sm:w-36 h-48 sm:h-auto shrink-0 overflow-hidden rounded-xl">
                <img src={d.photo} alt={d.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-heading font-semibold text-xl text-zinc-100">{d.name}</h3>
                <span className="text-emerald-400 text-sm font-semibold mt-0.5">{d.role}</span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2">
                  <GraduationCap className="w-3.5 h-3.5" /> {d.qualification}
                </span>
                <p className="text-sm text-zinc-400 leading-relaxed mt-3">{d.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
