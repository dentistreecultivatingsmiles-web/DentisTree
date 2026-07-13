import { MessageCircle, Phone } from "lucide-react";

export default function StickyBar({ clinic, onBook }) {
  return (
    <div
      data-testid="sticky-cta-bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl bg-black/85 border-t border-zinc-800 p-3 flex gap-3"
    >
      <button
        data-testid="sticky-book-btn"
        onClick={onBook}
        className="flex-[3] inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 active:bg-emerald-400 text-black font-bold py-3.5 text-sm transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        Book Appointment
      </button>
      <a
        data-testid="sticky-call-btn"
        href={`tel:${clinic.phone}`}
        className="flex-[2] inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 text-white font-semibold py-3.5 text-sm"
      >
        <Phone className="w-4 h-4" />
        Call Now
      </a>
    </div>
  );
}
