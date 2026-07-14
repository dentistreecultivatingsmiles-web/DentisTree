# DentisTree Microsite — PRD

## Original Problem Statement
Mobile-first, one-page microsite for a dental clinic (Google Business Profile style) that drives bookings via WhatsApp. React + FastAPI + MongoDB. Black/green theme, GBP-style card sections, sticky mobile CTAs, WhatsApp booking modal (Name, Phone, DOB) via wa.me deep link, bookings saved to DB.

## Clinic Details (real)
- Name: DentisTree · Tagline: "Cultivating Smiles"
- Address: LIG Flat No. JA/1A, Ground Floor, Hari Nagar, Hari Enclave, New Delhi 110064 (Near Swarg Ashram Mandir)
- Phone/WhatsApp: +91 8383935992 · Email: dentistree.cultivatingsmiles@gmail.com
- Hours: Mon–Sat 10 AM–8 PM, Sun closed
- Google rating: 4.9 (69 reviews)
- Real assets imported from dentistree.me: logo, Dr. Manmohan Bhutani photo/bio, 5 real clinic photos, real service list

## Architecture
- Backend: FastAPI (`/app/backend/server.py`) — GET /api/content (clinic+services+doctors+reviews+gallery), POST /api/bookings, GET /api/bookings. Seed data on startup (idempotent, seeds only if collections empty).
- Frontend: React SPA (`/app/frontend/src/App.js` + `components/site/*`): Header, Hero, Services, Doctors, Reviews, Gallery (portal lightbox), LocationSection (Google Maps embed), Footer, StickyBar (mobile), BookingModal.
- WhatsApp: wa.me/918383935992 with URL-encoded pre-filled message; booking saved to Mongo first.
- SEO: meta tags + Dentist JSON-LD schema in public/index.html.

## Implemented (June 2026)
- [x] Full microsite MVP: hero, sticky mobile CTA bar, services (8 real), doctor (real), Google-style reviews, gallery + lightbox, map + hours, WhatsApp booking modal, booking persistence
- [x] Authentic content import from dentistree.me (logo, doctor, photos, services)
- [x] Lightbox stacking-context bug fixed (createPortal + Escape key)
- [x] Real Google reviews added (Hitesh Malhotra, Sachin Premi, Ganga Pun, Yashika Dogra — all 5★, extracted from user's maps.app.goo.gl share links)
- [x] New front board photos (user-uploaded, hosted at customer-assets.emergentagent.com) placed as gallery lead tiles
- [x] Admin panel at /admin: JWT cookie auth (admin@dentistree.me, creds in backend/.env + test_credentials.md), edit clinic info/logo/hours/hero text, full CRUD for services/doctors/reviews/gallery, image uploads to Emergent object storage (POST /api/admin/upload, served at /api/files/{path}), bookings viewer. Public GET /api/bookings removed (PII protected).
- [x] Tested: iteration_2 — 17/17 admin pytest + 13/13 legacy + full admin UI E2E pass
- [x] Code review fixes: test creds from .env, seed_data split into seed_content/seed_admin, EntityTab refactored (ItemRow/FieldEditor subcomponents), motion presets extracted to motionPresets.js, console statements replaced with toasts, stale bookings tests updated (31/31 pass)
- [x] New official logo (user-uploaded webp, customer-assets URL) set in DB + DEFAULT_CLINIC + header restyled
- [x] Logo bug fix: startup migration replaces old/empty logo in settings with new logo (fixes production on redeploy); verified by testing agent (iteration_3, all pass)
- [x] Reviews refreshed: added 3 more real Google reviews (Rojina Khatiwada, Arthur Kokkinos, Suraj Neupane) — 7 total; rating still 4.9/69
- [x] Tested: backend 13/13 pytest pass; frontend E2E flows verified

## User Personas
- Local patients finding the clinic via Google search (mobile-first)
- Existing patients needing quick contact/directions/booking
- [x] Favicon/branding: tooth-tree icon cropped from user's logo → favicon.ico, logo192/512.png, apple-touch-icon; index.html links added
- [x] Deployment readiness check: PASS (deployment_agent, no blockers)

## Backlog
- P1: Admin payload validation (Pydantic models per collection), secure=True cookies for production
- P2: Auto-sync Google reviews via Places API, multi-language, payment deposit, WhatsApp reminders

## Notes
- All content is now REAL (reviews, photos, doctor, services)
- To reseed content: drop services/doctors/reviews/gallery collections and restart backend
- Backend tests: pytest /app/backend/tests/test_dentistree_api.py
