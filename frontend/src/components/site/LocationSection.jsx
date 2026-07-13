import { motion } from "framer-motion";
import { FADE_UP, FADE_UP_VISIBLE } from "@/components/site/motionPresets";
import { MapPin, Clock, Navigation, Phone } from "lucide-react";

export default function LocationSection({ clinic }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <section id="location" data-testid="location-section" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Visit Us</span>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-3">
          Find us in Hari Nagar
        </h2>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={FADE_UP}
            whileInView={FADE_UP_VISIBLE}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 rounded-2xl overflow-hidden border border-zinc-800 min-h-[320px]"
          >
            <iframe
              data-testid="google-map-embed"
              title="DentisTree location map"
              src={clinic.map_embed}
              className="w-full h-full min-h-[320px] grayscale-[30%] contrast-[1.05]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-2xl bg-[#0A0A0A] border border-zinc-800 p-6" data-testid="address-card">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-heading font-semibold text-zinc-100">Address</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-1">
                    {clinic.address}
                    <span className="block text-zinc-500 mt-1">({clinic.landmark})</span>
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <a
                      data-testid="get-directions-btn"
                      href={clinic.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Navigation className="w-4 h-4" /> Get Directions
                    </a>
                    <a
                      data-testid="location-call-link"
                      href={`tel:${clinic.phone}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
                    >
                      <Phone className="w-4 h-4" /> {clinic.phone_display}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0A0A0A] border border-zinc-800 p-6" data-testid="hours-card">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-semibold text-zinc-100">Operating Hours</h3>
              </div>
              <ul className="space-y-2">
                {clinic.hours.map((h) => (
                  <li
                    key={h.day}
                    className={`flex justify-between text-sm ${
                      h.day === today ? "text-emerald-400 font-semibold" : "text-zinc-400"
                    }`}
                  >
                    <span>{h.day}</span>
                    <span className={h.time === "Closed" ? "text-rose-400" : ""}>{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
