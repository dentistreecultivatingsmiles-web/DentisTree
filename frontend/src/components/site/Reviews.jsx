import { motion } from "framer-motion";
import { Star } from "lucide-react";

const AVATAR_COLORS = ["bg-rose-600", "bg-sky-600", "bg-amber-600", "bg-violet-600", "bg-teal-600", "bg-orange-600"];

const Stars = ({ rating }) => (
  <span className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`w-4 h-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} />
    ))}
  </span>
);

export default function Reviews({ clinic, reviews }) {
  return (
    <section id="reviews" data-testid="reviews-section" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Patient Reviews</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-3">
              Loved by our patients
            </h2>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#0A0A0A] border border-zinc-800 px-5 py-3" data-testid="reviews-summary">
            <span className="font-heading text-3xl font-bold text-white">{clinic.rating}</span>
            <div className="flex flex-col">
              <Stars rating={5} />
              <span className="text-xs text-zinc-500 mt-1">{clinic.review_count} Google reviews</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              data-testid={`review-card-${i}`}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="min-w-[85%] sm:min-w-[45%] md:min-w-0 rounded-2xl bg-[#0A0A0A] border border-zinc-800 p-6"
            >
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center font-semibold text-white`}>
                  {r.author.charAt(0)}
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-zinc-100">{r.author}</span>
                  <span className="text-xs text-zinc-500">{r.time_ago}</span>
                </div>
              </div>
              <div className="mt-3">
                <Stars rating={r.rating} />
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mt-3">{r.text}</p>
              <div className="flex items-center gap-1.5 mt-4 text-xs text-zinc-600">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Posted on Google
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
