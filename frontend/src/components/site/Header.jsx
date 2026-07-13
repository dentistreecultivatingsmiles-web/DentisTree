import { Star } from "lucide-react";

export default function Header({ clinic, onBook }) {
  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" data-testid="header-logo">
          <span className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-500/30 bg-black flex items-start justify-center">
            <img
              src={clinic.logo}
              alt="DentisTree logo"
              className="w-full h-auto origin-top scale-150"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading font-bold text-lg tracking-tight">DentisTree</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400">Cultivating Smiles</span>
          </span>
        </a>
        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-300" data-testid="header-rating">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-white">{clinic.rating}</span>
            <span className="text-zinc-500">({clinic.review_count})</span>
          </span>
          <button
            data-testid="header-book-btn"
            onClick={onBook}
            className="hidden md:inline-flex items-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-5 py-2.5 transition-colors"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </header>
  );
}
