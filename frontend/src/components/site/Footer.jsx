export default function Footer({ clinic }) {
  return (
    <footer data-testid="site-footer" className="border-t border-zinc-900 py-10 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-heading font-bold text-lg">DentisTree</span>
          <p className="text-sm text-zinc-500 mt-1">{clinic.tagline} · Hari Nagar, New Delhi</p>
        </div>
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} DentisTree Dental Hospital. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
