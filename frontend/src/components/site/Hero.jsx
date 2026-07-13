import { motion } from "framer-motion";
import { Star, MapPin, Clock, Phone, MessageCircle } from "lucide-react";

const HERO_IMG =
  "https://images.pexels.com/photos/9062527/pexels-photo-9062527.jpeg?auto=compress&cs=tinysrgb&h=1000&w=1600";

export default function Hero({ clinic, onBook }) {
  return (
    <section id="top" data-testid="hero-section" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="DentisTree clinic" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-6">
            Multispecialty Dental Clinic · Hari Nagar
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            {clinic.name}
            <span className="block text-emerald-400 mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold">
              {clinic.tagline}
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
            Where your smile blossoms with care & precision — a premier multispecialty dental
            clinic offering implants, Invisalign, root canals and smile designing under one roof.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-300">
            <span className="flex items-center gap-1.5" data-testid="hero-rating">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-white">{clinic.rating}</span>
              <span className="text-zinc-400">· {clinic.review_count} Google reviews</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> Hari Nagar, New Delhi
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" /> Mon–Sat · 10 AM – 8 PM
            </span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              data-testid="hero-whatsapp-btn"
              onClick={onBook}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 text-base transition-colors shadow-[0_8px_30px_rgba(16,185,129,0.35)]"
            >
              <MessageCircle className="w-5 h-5" />
              Book on WhatsApp
            </button>
            <a
              data-testid="hero-call-btn"
              href={`tel:${clinic.phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 hover:border-emerald-500 hover:text-emerald-400 text-white font-semibold px-8 py-4 text-base transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
