import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { SCALE_IN, SCALE_IN_VISIBLE, VIEWPORT_ONCE } from "@/components/site/motionPresets";
import { X } from "lucide-react";

export default function Gallery({ gallery }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section id="gallery" data-testid="gallery-section" className="py-16 sm:py-24 bg-[#0A0A0A] border-y border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Clinic Gallery</span>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-3">
          Step inside DentisTree
        </h2>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] sm:auto-rows-[180px] gap-3">
          {gallery.map((g, i) => (
            <motion.button
              key={g.id}
              data-testid={`gallery-item-${i}`}
              onClick={() => setActive(g)}
              initial={SCALE_IN}
              whileInView={SCALE_IN_VISIBLE}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className={`relative overflow-hidden rounded-2xl group focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                i === 0 || i === 3 ? "col-span-2 row-span-2" : ""
              }`}
            >
              <img
                src={g.url}
                alt={g.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left text-xs text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity">
                {g.caption}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {active &&
        createPortal(
          <div
            data-testid="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActive(null)}
          >
            <button
              data-testid="lightbox-close-btn"
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={() => setActive(null)}
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <figure className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={active.url} alt={active.caption} className="w-full max-h-[80vh] object-contain rounded-2xl" />
              <figcaption className="text-center text-sm text-zinc-400 mt-3">{active.caption}</figcaption>
            </figure>
          </div>,
          document.body
        )}
    </section>
  );
}
