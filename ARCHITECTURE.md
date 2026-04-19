# CuidaMascotas — Local Pet-Care Ecosystem (Spain)

## Overview

A **local pet-care ecosystem** for Spain — not a pure marketplace. Connects four stakeholders: **owners, sitters, and the neighborhood businesses around them** (vets, pet shops, peluquerías caninas, dog trainers). The partner-discount network is the Phase 0 differentiator and the moat Rover cannot replicate at city-level scale: a global platform negotiates with national chains; we negotiate with the vet across the street.

Framed as a **lifestyle business** (€0.3-1M ARR over 3-5 years is success), not a VC-scale bet. Geographic expansion is city-at-a-time; brand and design system are deliberately portable — local character comes from photography and partner networks, not from hard-coded Asturian motifs.

**Launch scope:** Gijón (Asturias) → wider Asturias (Oviedo, Avilés, Langreo) → selective wider Spain (Madrid, Barcelona, Valencia, Bilbao).
**Target Phase 0 (supply-first):** first 20 sitters + 5-10 partner businesses signed in Gijón.
**Target Phase 1 (owner launch):** flip landing to owner-primary once supply exists.
**Stack:** Next.js 16 App Router + React 19 + TypeScript + Supabase + Tailwind CSS 4.
**Languages:** Spanish (primary) + English (secondary — for expats/tourists in Spain).
**Development base:** Charleston, SC, USA.
**Jurisdiction:** Spain / EU — all users, data, and operations are Spanish-market only.
**Business entity:** TBD — will need a Spanish legal entity (S.L. or autónomo) to operate.
**Deployment:** Vercel (EU edge region, Frankfurt).

---

## Business Model

**Four revenue streams, diversified beyond a pure marketplace take-rate.**

1. **Booking commission** (Phase 0, live) — 18% sitter commission per booking; undercuts Rover's 20%. Owners pay no platform fee (vs. Rover's ~11%).
2. **Partner-network listings** (Phase 0, day 1 differentiator) — local vets, pet shops, peluquerías caninas, and dog trainers sign up for a monthly listing fee OR revenue share on app-referred customer spend. Partner discounts flow back to sitters' clients as a perk.
3. **Sitter Pro tools** (Phase 2) — optional subscription for compliant `facturas` (Spanish-autónomo-aware, Verifactu-ready), client CRM across Rover + WhatsApp + platform bookings, quarterly tax dashboard (`modelo 130`, `modelo 303`), gestor-friendly export. Closes the "Rover doesn't help me stay legit" gap for professional sitters.
4. **Owner premium membership** (Phase 2+) — priority booking access, enhanced partner perks, annual loyalty rewards. Optional, not gatekeeping.

**Per-booking pricing:** €10-22 per visit in Gijón (validated against Rover/Gudog Gijón listings).

**Unit economics note:** €22/night × 18% = €3.96 per booking. Marketplace-only math is brutal in a 270k city — this is why the ecosystem (stream 2) + sitter tools (stream 3) are essential, not nice-to-haves.

---

## MVP Feature Status

### Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| User onboarding & auth | ✅ Done | Email/password via Supabase Auth, auto-profile creation |
| User roles | ✅ Done | `owner`, `sitter`, `admin` — strict separation, no dual roles |
| Sitter search + map | ✅ Done | PostGIS nearby search + Leaflet interactive map with split/list/map views |
| Pet management (CRUD) | ✅ Done | Species, breed, age, weight, medical notes, photos |
| Booking + Stripe payments | ✅ Done | Pay upfront via Stripe Checkout, auto-refund on sitter decline |
| Multi-day visit tracking | ✅ Done | Per-day check-in/check-out, photo uploads, health notes, GPS |
| Sitter availability calendar | ✅ Done | Monthly calendar, sitters toggle days, owners view on profile |
| In-app messaging | ✅ Done | Direct messages with read/unread tracking + realtime |
| Reviews & ratings | ✅ Done | 1–5 stars, post-booking, one per booking |
| User profile editing | ✅ Done | Name, bio, city, phone, avatar upload |
| Admin portal | ✅ Done | Stats dashboard, sitter/user management (role change, delete), booking status, discount CRUD, verification |
| i18n (es/en) | ✅ Done | `next-intl` with route-level locale prefix |
| Toast notifications | ✅ Done | Sonner — success/error feedback on all key actions |
| Security headers | ✅ Done | HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy |
| RLS policies | ✅ Done | All tables secured, admin override policies, no role self-escalation |
| Audit logging | ✅ Done | GDPR-compliant data access/modification tracking |
| Dashboard navigation | ✅ Done | Desktop top nav + mobile bottom tab bar, consistent logo on all pages |
| Shared UI library | ✅ Done | Button, Input, Textarea, Select, Card, Badge, Avatar, Header, DashboardShell, PageShell |
| Meet & greet flow | ✅ Done | Free intro meeting before booking, request/accept/complete flow |
| PWA (Progressive Web App) | ✅ Done | Manifest, service worker, offline page, installable on mobile home screen |
| Search filters | ✅ Done | Service type, pet type, price range, date availability, verified only — client-side filtering |
| Booking overlap prevention | ✅ Done | Server-side check in checkout + client-side check on sitter accept |
| Repeat bookings | ✅ Done | "Book again" button on completed bookings for owners |
| Reviews-for-discounts | ✅ Done | After submitting a review, owner receives partner discount code via toast |
| Push notifications | ✅ Done | VAPID web push, service worker handles push/click, sends on booking/decline/meet-greet |
| Sitter verification (DNI) | ✅ Done | Upload DNI/NIE/passport, status tracking (pending→submitted→approved/rejected), admin approve/reject with document viewer |
| Avatar dropdown menu | ✅ Done | Profile avatar in navbar with dropdown (role badge, profile link, logout) |
| Branded icons | ✅ Done | Two-paw logo from source image — favicon, PWA icons, navbar, no emojis anywhere |
| Landing → search flow | ✅ Done | City input on landing page passes to search page and auto-searches |
| Cancellation policy tiers | ✅ Done | Flexible/moderate/strict — sitter chooses, shown on profile |
| Sitter response metrics | ✅ Done | Response rate + avg time, calculated from booking data via RPC |
| GPS live map for owners | ✅ Done | Real-time sitter location on Leaflet map during active visits, with trail polyline |
| Navbar notification badges | ✅ Done | Realtime unread message count + pending booking badges on nav items |
| Sitter insurance requirement | ✅ Done | Upload proof of liability insurance (RC profesional), admin approve/reject, "Asegurado" badge on profile |
| Admin user management API | ✅ Done | Server-side API with service role for role changes and cascading user deletion |
| Password visibility toggle | ✅ Done | Show/hide password on login form |
| Role badges | ✅ Done | Colored role badge in avatar dropdown for all user types |
| Daycare service type | ✅ Done | Added to services enum, all forms, search filters, checkout API |
| Two-way reviews | ✅ Done | Both owner and sitter can review each other after completed booking |
| Referral program | ✅ Done | Unique referral code per user, €5 credit for both, code input on signup, credit shown in profile |
| Availability-aware booking | ✅ Done | Calendar date picker on booking form, shows sitter's available days, blocks unavailable dates, range validation |
| Search date filter | ✅ Done | Date range filter on search page, only shows sitters available for all requested days |
| Enriched search cards | ✅ Done | Bio excerpt, city, star rating, review count, experience, verified + insured badges |
| Profile completion card | ✅ Done | Dashboard progress tracker with pending/in-review/done states, role-aware steps |
| Admin invite users | ✅ Done | Invite form on admin/users, creates user via Supabase inviteUserByEmail |
| Admin verification badges | ✅ Done | Pending verification count badge on admin nav Sitters tab |
| Passport verification | ✅ Done | Accepts DNI, NIE, or passport for non-Spanish sitters |
| Secure document storage | ✅ Done | Identity documents stored as private paths, admin views via signed URLs (5-min expiry) |
| Input validation | ✅ Done | Phone format, file size limits, maxLength on all fields, password strength checks |
| Consistent navigation | ✅ Done | DashboardShell on all logged-in pages (search, sitter profile, booking, pets), public Header for visitors only |
| Signup security | ✅ Done | Generic error messages prevent email enumeration, identity check for existing users |
| Design system (OKLCH tokens) | ✅ Done | Full palette in `@theme`: canvas/surface/ink/line/brand/brand-ink/brand-soft/mist/rust/warning/danger + semantic aliases; brand at oklch(47% 0.085 170°) — cool Asturian moss |
| Typography system | ✅ Done | Source Serif 4 (display 600 + italic) + Source Sans 3 (UI 400/500/600) via next/font; fluid `@utility` classes for `text-display`/`text-hero`/`text-h2`/`text-lede` via `clamp()` |
| Logo component | ✅ Done | Inline SVG React `<Logo>` component (5-ellipse asymmetric paw, `currentColor` stroke) + regenerated PNG icons (favicon, apple-touch, 192, 512) via ImageMagick |
| Landing page — ecosystem positioning | ✅ Done | Pet-voice hero + 3 editorial photos + "why sitters join" + partner network + honest-about-stage block + owner waitlist; no AI-slop motifs |
| Owner waitlist (Phase 0) | ✅ Done | `/api/waitlist` route + `public.waitlist` table (migration 020) + RLS; landing form captures email + barrio |
| Contact page | ✅ Done | `/contact` — general / partners / press mailto rows, replaces previously broken landing + footer links |
| Touch-target compliance | ✅ Done | Button sm/md/lg → 36/44/48px via `min-h-*`; mobile bottom-nav profile pill → 48px; meets WCAG 2.5.5 |
| Service-worker dev-mode fix | ✅ Done | SW v2 cache; does NOT cache HTML navigations (prevents stale-hydration); auto-unregisters in dev `NODE_ENV !== "production"` |
| Full token migration | ✅ Done | 435 raw Tailwind color classes migrated to tokens (100% complete); zero residual stone/green/amber/blue/purple/red raw classes in src/ |
| Badge variants rationalized | ✅ Done | 6 color variants → 4 semantic slots (brand/warning/danger/neutral); legacy aliases (green/amber/red/blue/purple/stone) mapped for back-compat |

### Not Yet Started

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Bizum payments | ❌ | High | Schema ready, needs Redsys merchant account — key Spanish differentiator |
| WhatsApp integration | ❌ | High | Booking notifications via WhatsApp — high engagement in Spain |
| Sitter badges | ❌ | High | "Top Sitter", "X repeat clients", "Quick responder" — builds trust on search cards |
| Sitter safety quiz | ❌ | High | Questionnaire before receiving bookings — Rover and Wag both require this |
| Instant booking option | ❌ | Medium | Let sitters opt into instant-accept — Rover offers this |
| Last-minute / available today | ❌ | Medium | Sitters flag "available today" for urgent walks — Wag's core feature |
| Booking confirmation emails | ❌ | Medium | Email confirmations for bookings, cancellations, reminders |
| Background checks API | ❌ | Medium | External verification provider (DNI upload works, external not wired) |
| Blog / content marketing | ❌ | Medium | SEO content for "cuidador de mascotas" — Snau has active blog |
| Phone verification (SMS OTP) | ❌ | Medium | Verify phone via Twilio/Vonage SMS — Supabase Auth built-in support |
| In-app customer support chat | ❌ | Low | Live chat or chatbot for user issues |
| In-app video chat | ❌ | Low | Video calls between owner and sitter — no competitor has this yet |
| Mobile app (React Native) | ❌ | Phase 2 | PWA covers mobile for now |

---

## Competitive Analysis

### Competitors in Spain

| | **Us** | **Rover** | **Wag** | **Snau** | **PetBacker** |
|---|---|---|---|---|---|
| **Commission** | 18% sitter | 20% sitter + 11% owner | ~40% sitter | ~15-18% | ~15% |
| **Insurance** | Sitter must carry RC | Platform €25K | Platform $1M | Partner insurer | Basic |
| **DNI verification** | ✅ + passport | ❌ | ❌ | ✅ | ❌ |
| **GPS live map** | ✅ Real-time + trail | Walking only | Walking only | Walking only | Walking only |
| **Meet & greet** | ✅ First-class flow | Encouraged | ❌ | Promoted | Basic |
| **Bizum** | ❌ Planned | ❌ | ❌ | Exploring | ❌ |
| **WhatsApp** | ❌ Planned | ❌ | ❌ | ❌ | ❌ |
| **Native apps** | PWA | iOS + Android | iOS + Android | iOS + Android | iOS + Android |
| **Sitter pool** | Launching (Gijón) | Largest globally | US-focused | Medium (Spain) | Small |
| **Referral program** | ✅ €5 both | ✅ ~$20 | ✅ ~$20 | ✅ | ✅ |
| **Instant booking** | ❌ | Optional | AI matching | ❌ | ❌ |
| **Two-way reviews** | ✅ | ✅ | Limited | ❌ | ❌ |
| **Daycare** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Cancellation tiers** | ✅ Sitter chooses | ✅ | Platform-defined | Platform-defined | Platform-defined |
| **Background checks** | DNI upload | Required | Required + training | Interview | Basic |
| **Sitter badges** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Safety quiz** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **24/7 support** | ❌ | Phone + chat | Phone + chat | Email | Email |
| **Owner fee** | 0% | 11% | Bundled | 0% | 0% |
| **Availability calendar** | ✅ On booking | Basic date picker | Basic | ✅ | Basic |
| **Date filter search** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Multi-language** | es + en | 10+ | en only | es only | 20+ |
| **Video chat** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Snau status** | — | Active | Active | Appears offline | Active |

### What We Do Better

1. **Ecosystem, not just marketplace** — local partner-discount network (vets, pet shops, peluquerías, trainers) that Rover cannot replicate at city-level scale. Rover negotiates with national chains; we negotiate with the vet across the street.
2. **Lower total cost** — 18% sitter commission, 0% owner fee vs Rover's 31% total (20% + 11%)
3. **Real-time GPS live map** — full map with trail polyline, not just walking pings
4. **DNI/NIE/passport + insurance verification** — strongest trust pipeline in Spain
5. **Meet & greet as first-class feature** — built into booking flow, not just "encouraged"
6. **Availability calendar on booking** — shows available days visually, blocks unavailable dates
7. **Spanish-first localization** — designed for Spain from day one, not adapted from US
8. **No platform guarantee liability** — sitters carry their own RC insurance, zero financial exposure
9. **Profile completion tracking** — guided onboarding with progress bar and status tracking
10. **Honest-about-stage messaging** — no fabricated stats, no fake testimonials; "empezamos en Gijón, únete desde el primer día" vs Rover's inflated-testimonial theater
11. **Editorial design language** — typographic-led hierarchy (Source Serif + Sans), OKLCH palette, zero AI-slop template motifs (no glassmorphism, no 4-up feature grids, no hero-metric layouts)

### What Competitors Have That We Don't (Priority Gaps)

1. **Bizum payments** — uniquely Spanish, nobody has it yet — first-mover advantage
2. **WhatsApp notifications** — Spain's #1 messaging app, huge engagement potential
3. **Sitter badges** — "Top Sitter", repeat clients, quick responder — builds trust
4. **Sitter safety quiz** — basic questionnaire before receiving bookings
5. **Instant/same-day booking** — Rover offers opt-in, Wag uses AI matching
6. **Native mobile apps** — PWA works but app store presence builds trust
7. **24/7 customer support** — both Rover and Wag offer phone + chat
8. **Background check API** — external verification beyond DNI upload
9. **Blog/SEO content** — organic acquisition, Snau had active blog

---

## Project Structure

```
dog_sitter_app/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (HTML shell, fonts, globals.css)
│   │   ├── globals.css                # Tailwind v4 + CSS custom properties
│   │   ├── [locale]/
│   │   │   ├── layout.tsx             # Locale layout (NextIntlClientProvider, Toaster)
│   │   │   ├── page.tsx               # Landing page (auth-aware redirect)
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── search/page.tsx        # Sitter search
│   │   │   ├── sitter/[id]/page.tsx   # Sitter profile
│   │   │   ├── booking/[id]/page.tsx  # Booking confirmation
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx           # Main dashboard (bookings list)
│   │   │   │   ├── profile/          # User profile editing
│   │   │   │   ├── pets/             # Pet CRUD pages
│   │   │   │   ├── messages/         # Messaging inbox
│   │   │   │   ├── booking/[id]/     # Active booking + visit tracking
│   │   │   │   ├── sitter-setup/     # Sitter settings + availability calendar
│   │   │   │   └── review/[bookingId]/ # Post-booking review
│   │   │   └── admin/
│   │   │       ├── page.tsx           # Stats dashboard (RPC)
│   │   │       ├── sitters/          # Sitter management
│   │   │       ├── bookings/         # Booking administration
│   │   │       ├── users/            # User management
│   │   │       └── discounts/        # Partner discount CRUD
│   │   └── api/
│   │       ├── auth/callback/        # OAuth callback
│   │       ├── auth/logout/          # Sign out
│   │       ├── checkout/             # Booking creation + Stripe Checkout
│   │       ├── bookings/decline/     # Sitter decline + auto-refund
│   │       ├── admin/users/          # Admin user management (role change, delete via service role)
│   │       └── webhooks/stripe/      # Stripe event handler
│   │
│   ├── components/
│   │   ├── ui/                       # Reusable UI library (custom, not shadcn)
│   │   │   ├── button.tsx            # Button + LinkButton variants; sm/md/lg sizes meet WCAG 2.5.5 touch minimums
│   │   │   ├── input.tsx             # Input + Textarea; token-based focus ring on brand
│   │   │   ├── select.tsx            # Select dropdown
│   │   │   ├── card.tsx              # Card container; bg-surface + border-line, no heavy shadow
│   │   │   ├── badge.tsx             # 4 semantic variants (brand/warning/danger/neutral) + legacy aliases for back-compat
│   │   │   ├── dashboard-shell.tsx   # Dashboard layout (top nav + mobile bottom tabs); solid bg-canvas + hairline border — no glassmorphism
│   │   │   ├── avatar.tsx            # Initials-based avatar; brand→brand-ink gradient (token-driven)
│   │   │   ├── header.tsx            # Sticky top nav; solid bg-canvas + border-b border-line
│   │   │   ├── page-shell.tsx        # Centered content wrapper
│   │   │   └── index.ts             # Barrel export
│   │   ├── logo.tsx                  # <Logo> React component — inline SVG, 5-ellipse asymmetric paw, inherits currentColor, scales from 16px favicon to 512px PWA
│   │   ├── landing-page.tsx
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── sitter-search.tsx         # GPS + city search + map split view
│   │   ├── sitter-map.tsx            # Leaflet/OpenStreetMap interactive map
│   │   ├── availability-calendar.tsx # Monthly calendar for sitter availability
│   │   ├── booking-form.tsx
│   │   ├── booking-actions.tsx       # Accept/decline/start visit buttons
│   │   ├── pet-form.tsx
│   │   ├── delete-pet-button.tsx
│   │   ├── sitter-setup-form.tsx
│   │   ├── profile-form.tsx          # User profile editing
│   │   ├── review-form.tsx
│   │   ├── payment-toast.tsx         # Post-payment feedback
│   │   ├── message-list.tsx
│   │   ├── active-booking-view.tsx   # Multi-day visit tracking + live map
│   │   ├── sitter-live-map.tsx       # Real-time sitter location map (Leaflet)
│   │   ├── dashboard-nav.tsx         # Client nav with notification badges
│   │   ├── nav-badges.tsx            # Realtime unread/pending count hook
│   │   ├── admin-nav.tsx
│   │   ├── admin-header.tsx
│   │   ├── admin-sitter-actions.tsx
│   │   ├── admin-user-actions.tsx     # Role change + delete (via API route)
│   │   ├── admin-booking-actions.tsx  # Status change dropdown
│   │   ├── admin-discount-actions.tsx # Toggle active + delete
│   │   ├── user-menu.tsx              # Avatar dropdown with role badge
│   │   └── discount-form.tsx
│   │
│   ├── lib/
│   │   ├── supabase/client.ts        # Browser Supabase client
│   │   ├── supabase/server.ts        # Server Supabase client (cookies)
│   │   ├── stripe.ts                 # Stripe singleton (lazy init)
│   │   └── admin.ts                  # requireAdmin() auth guard
│   │
│   ├── i18n/
│   │   ├── routing.ts                # Locale routing config (es default, en)
│   │   ├── navigation.ts             # Link/redirect helpers
│   │   └── request.ts               # Server-side i18n loader
│   │
│   └── middleware.ts                 # next-intl locale routing
│
├── supabase/migrations/
│   ├── 001_initial_schema.sql        # Full schema (13 tables, PostGIS, RLS)
│   ├── 002_admin_role.sql            # Admin role + policies
│   ├── 003_security_fixes.sql        # RLS hardening
│   ├── 004_pending_payment_status.sql # Add pending_payment booking status
│   ├── 005_sitter_coords_in_search.sql # Return lat/lng from nearby search
│   ├── 006_sitter_availability.sql   # Sitter availability calendar table
│   ├── ...                           # 007–012: meet & greet, push, cancellation, response stats
│   ├── 013_sitter_insurance.sql      # Insurance verification type + has_insurance on sitter_profiles
│   ├── ...                           # 014–019: cascade deletes, enriched search, sitter home details
│   └── 020_waitlist.sql              # Owner waitlist (email, barrio, source, user_agent) + RLS (anon insert, service-role read)
│
├── messages/
│   ├── es.json                       # Spanish translations (~82 keys)
│   └── en.json                       # English translations
│
├── next.config.ts                    # next-intl plugin + security headers
├── package.json
└── tsconfig.json                     # Strict mode, @/* path alias
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   CLIENTS                        │
│                                                  │
│   Phase 1: Next.js 16 App Router (SSR, PWA)     │
│   Phase 2: Expo / React Native (iOS + Android)   │
│                                                  │
│   UI: Tailwind CSS 4 + custom component library  │
│   i18n: next-intl (es default, en secondary)     │
│   Hosting: Vercel (EU edge region)               │
└──────────────────────┬──────────────────────────┘
                       │
            Next.js API Routes
            (/api/checkout, /api/auth/*,
             /api/webhooks/stripe)
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│         SUPABASE (EU Region — Frankfurt)         │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐              │
│  │  Auth        │  │  Realtime     │              │
│  │  (email/     │  │  (messaging   │              │
│  │   password)  │  │   — planned)  │              │
│  └─────────────┘  └──────────────┘              │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐              │
│  │  PostgreSQL  │  │  Storage      │              │
│  │  + PostGIS   │  │  (photos —   │              │
│  │  (13 tables, │  │   planned)   │              │
│  │   full RLS)  │  │              │              │
│  └─────────────┘  └──────────────┘              │
│                                                  │
│  ┌─────────────────────────────────┐            │
│  │  RPC Functions                   │            │
│  │  find_nearby_sitters()           │            │
│  │  admin_dashboard_stats()         │            │
│  └─────────────────────────────────┘            │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│            THIRD-PARTY INTEGRATIONS              │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │ Stripe     │  │ Bizum      │  │ WhatsApp   ││
│  │ 🔶 Ready   │  │ ❌ Planned │  │ ❌ Planned ││
│  └────────────┘  └────────────┘  └────────────┘│
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │ Background │  │ Leaflet /  │  │ Push       ││
│  │ Check API  │  │ OpenStreet │  │ Notifs     ││
│  │ ❌ Planned │  │ Map        │  │ ✅ Ready   ││
│  │            │  │ ✅ Ready   │  │            ││
│  └────────────┘  └────────────┘  └────────────┘│
└─────────────────────────────────────────────────┘
```

---

## Database Schema

**Extensions:** PostGIS (geospatial), uuid-ossp

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | Full name, email, phone, role, bio, locale, avatar | Public read, own write (no role changes) |
| `sitter_profiles` | Hourly rate, services[], pet_types[], PostGIS location, verification | Public read, own write |
| `pets` | Species, breed, age, weight, medical notes, photo, microchip | Owner full access |
| `bookings` | Owner↔sitter, service type, dates, pricing, status workflow | Participants only |
| `payments` | Amount, method (stripe/bizum), Stripe intent ID, status | Participants only |
| `invoices` | Spanish compliance — invoice number, NIF, IVA 21%, PDF | Participants only |
| `reviews` | 1–5 stars, comment, unique per booking/reviewer | Public read, participants write |
| `messages` | Sender/recipient, content, read_at | Sender + recipient only |
| `visit_logs` | Check-in/out timestamps, photos, health notes, GPS | Booking participants |
| `verifications` | DNI/NIE, background check status | Own read, admin write |
| `partner_discounts` | Code, percent off, city, valid_until | Public read, admin write |
| `consent_records` | GDPR consent tracking (terms, privacy, marketing) | Own read |
| `sitter_availability` | Per-day availability calendar for sitters | Public read, own write |
| `audit_log` | Data access/modification trail (GDPR accountability) | Admin only |

### Key Indexes
- `idx_sitter_profiles_location` — GiST index on PostGIS location
- `idx_bookings_owner`, `idx_bookings_sitter`, `idx_bookings_status`
- `idx_messages_recipient`

### Key Functions
- `handle_new_user()` — Auto-create profile on auth signup (trigger)
- `handle_updated_at()` — Auto-update timestamps (trigger)
- `find_nearby_sitters(lat, lng, radius_meters)` — PostGIS geospatial search
- `admin_dashboard_stats()` — Aggregated metrics (12 stats) for admin dashboard

---

## Booking Flow

```
Owner searches → checks sitter availability calendar → fills booking form
                                         │
                              POST /api/checkout
                         (server-side price calc,
                          18% commission applied)
                                         │
                              Stripe Checkout →  Owner pays upfront
                                         │
                         "pending_payment" → Stripe webhook → "requested"
                                         │
                         Sitter accepts or declines
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
              "confirmed"                    POST /api/bookings/decline
           (sitter accepted)                (auto-refund via Stripe)
                    │                              → "cancelled"
         Sitter taps "Start visit"
         (auto check-in + GPS)
                    │
              "in_progress"
         (daily check-in/check-out,
          photos, health notes)
                    │
         Sitter taps "Complete booking"
                    │
              "completed"
                    │
             Owner can review
```

---

## Authentication Flow

1. **Signup:** Form → Supabase `auth.signUp()` → `handle_new_user()` trigger creates profile
2. **Login:** Email + password → Supabase `auth.signInWithPassword()` → redirect to dashboard
3. **OAuth callback:** `/api/auth/callback?code=...` → exchange code for session → redirect
4. **Logout:** POST `/api/auth/logout` → `auth.signOut()` → redirect to home
5. **Admin guard:** `requireAdmin(locale)` checks `profiles.role = 'admin'`, redirects non-admins

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.2 | App Router framework |
| `react` | 19.2.4 | UI library |
| `@supabase/supabase-js` | 2.101.1 | Database + auth client |
| `@supabase/ssr` | 0.10.0 | SSR cookie-based sessions |
| `stripe` | 22.0.0 | Payment server SDK |
| `@stripe/stripe-js` | 9.0.1 | Payment client SDK |
| `next-intl` | 4.9.0 | Internationalization |
| `lucide-react` | 1.7.0 | Icon library |
| `sonner` | 2.0.7 | Toast notifications |
| `leaflet` | latest | Interactive maps (OpenStreetMap) |
| `react-leaflet` | latest | React wrapper for Leaflet |
| `tailwindcss` | 4 | CSS framework |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL (EU/Frankfurt)
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public anon key
SUPABASE_SERVICE_ROLE_KEY=         # Server-only service role key

STRIPE_SECRET_KEY=                 # Stripe secret (server-only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Public key for client
STRIPE_WEBHOOK_SECRET=             # Webhook signing secret

NEXT_PUBLIC_APP_URL=http://localhost:3000  # App origin for redirects
```

---

## Security & Compliance

### Technical Security
- **RLS on all tables** — users only access their own data; admin override policies
- **No role self-escalation** — RLS prevents users from changing their own role
- **Server-side price calculation** — checkout API recalculates pricing, never trusts client
- **Security headers** — HSTS (preload), X-Frame-Options: DENY, nosniff, strict Referrer-Policy, Permissions-Policy
- **Lazy Stripe init** — no build-time env var requirement
- **Generic error messages** — no database schema leaks to client
- **Input validation** — on all API endpoints
- **Audit logging** — GDPR-compliant data access/modification trail

### GDPR / LOPDGDD (Spanish Data Protection)
- Supervisory authority: AEPD (Agencia Española de Protección de Datos)
- Cookie consent banner required (AEPD guidelines)
- Privacy policy in Spanish and English
- Explicit consent at registration (tracked in `consent_records` table)
- Right to access, rectification, deletion, and data portability
- Data breach notification to AEPD within 72 hours
- Users under 14 require parental consent
- All user data stored in EU-based regions (Supabase Frankfurt)

### LSSI-CE (Spanish E-Commerce Law)
- Legal notice (Aviso Legal) with company name, NIF/CIF, address, contact
- Terms of Service in Spanish and English
- Clear pricing with IVA included
- Cancellation/refund policy compliant with Spanish consumer protection

### Spain Animal Welfare Law (Ley 7/2023)
- Sitters must demonstrate animal care knowledge (future: formal knowledge quiz before receiving bookings).
- Microchip verification support in pet profiles ✅.
- **Sitter RC (responsabilidad civil) insurance verification** ✅ — sitters upload proof of liability insurance, admin approves, `Asegurado` badge shown on profile. Owner's own mandatory RC (per Ley 7/2023) remains owner responsibility; the platform does not insure directly.

### Payment Compliance
- PSD2 (SCA) — Strong Customer Authentication for European payments (via Stripe)
- Invoice generation with Spanish IVA (21%) — sequential numbering
- Anti-money laundering (AML) compliance via licensed payment processor

---

## Brand & Design System

**Voice:** Pet POV on marketing/emotional copy; direct/human on functional UI (forms, admin, errors). Current landing hero: "Mis humanos a veces tienen que irse. Alguien tiene que cuidarme." (pet-voice) + "Estamos reclutando a los primeros cuidadores..." (direct pitch).

**Design principles** (codified in `.impeccable.md`):
1. **Calm over loud** — fewer things, more confidently. One primary action per screen, not six.
2. **Trust through restraint, not badges** — verification/insurance surfaced typographically, never with stripes or shields.
3. **Local before global** — copy feels specifically Spanish (Gijón-first); "Cuidador del barrio," not "Your pet's best friend."
4. **Typography carries the hierarchy** — serif display + sans body pair does the heavy lifting.
5. **Functional UI stays human** — pet-voice lives in marketing only.
6. **Ecosystem, not marketplace** — surfaces reinforce four-stakeholder model (owners + sitters + vets + shops).
7. **Honest about stage** — no fabricated stats, no fake testimonials.

**Geographic portability** — brand must travel beyond Gijón. Asturian-specific motifs (hórreo silhouette, Cruz de la Victoria, Cudillero imagery, cider-pour animations) are **explicitly NOT** baked into the design system. Local character at each launch city comes from **photography** and **copy** only; palette/typography/principles are universal across Spanish cities.

**Palette** — OKLCH throughout, calibrated for AA contrast:
- `brand` — `oklch(47% 0.085 170)` cool Asturian moss (shifted from original 155° warm-Tuscan-emerald for regional authenticity + cross-city portability)
- `canvas` — `oklch(97% 0.008 95)` warm off-white plaster
- `ink` — `oklch(22% 0.012 95)` + `ink-muted` + `ink-soft` for 3-tier type hierarchy
- `mist` — `oklch(78% 0.012 230)` pewter grey, reserved for secondary surfaces
- `rust` — `oklch(45% 0.12 35)` oxblood accent, never decoratively
- `warning`, `danger` semantic pairs with `-ink` / `-soft` variants

**Typography** — Source Serif 4 (display, 600 normal + italic) + Source Sans 3 (UI, 400/500/600) via `next/font/google`. Fluid sizes via `@utility text-display` / `text-hero` / `text-h2` / `text-lede` using `clamp()` for marketing surfaces; fixed Tailwind scale for app UI.

**Anti-references** — explicit ban list in `.impeccable.md`: no glassmorphism, no hero-metric stat blocks, no 4-up rainbow feature grids, no icon-tile decoration, no Geist reflex font, no gradient text, no bounce easing, no cartoon mascots, no AI-template SaaS landing patterns.

---

## Go-to-Market Strategy

### Phase 0: Supply-first Gijón (Month 0–3)
**Goal: 5-10 partners signed + 20 sitters recruited BEFORE owner launch.**
- **Partner-first sign-ups.** Visit vets, pet shops, peluquerías caninas, dog trainers in Gijón. Sign partnership agreements (listing fee OR rev-share on referred customers). Having signed partners is a sitter-recruitment multiplier: "join and your clients get discounts at 8 Gijón businesses."
- **Sitter recruitment** via personal network, architect/constructor friend referrals, local Facebook groups, neighborhood flyers at vet partners.
- **Owner waitlist** live — landing form captures email + barrio so launch-day is warm, not cold.
- **Landing page sitter-first** (90/10 sitter/owner) until supply exists.
- Waive sitter commission for first bookings; offer partner businesses free first-year listing for early signup.

### Phase 1: Owner launch in Gijón (Month 3–9)
- **Landing flips to owner-primary** once ≥20 verified sitters live.
- **Partner-discount network** surfaces on owner booking confirmations, reviews, sitter profiles — primary differentiator vs Rover.
- **Reviews-for-discounts** program drives repeat engagement.
- **Local PR** — La Nueva España, El Comercio ("app local de cuidado de mascotas con red de partners").
- Target: 100+ active owners, €1-3k MRR in Gijón.

### Phase 2: Asturias expansion (Month 9–18)
- **Oviedo, Avilés, Langreo** — each city gets its own partner network (brand portability test: does the design system work without Gijón-specific photography? answer should be yes).
- **Sitter Pro tools** launch (facturas, tax dashboard, client CRM) as sitter retention + supply-side moat.
- **Asturian regional ad campaigns** (radio, regional press).

### Phase 3: Wider Spain (Year 2+)
- **Selective city rollouts** — Madrid, Barcelona, Valencia, Bilbao. City-by-city with local partner acquisition first, not blanket launch.
- **React Native mobile app** — Expo-based, reusing the OKLCH token system + Logo component + Lucide icons (all portable by design per `.impeccable.md` constraint).
- **Owner premium membership** launches (Phase 2+ revenue stream).
- Investor outreach only if unit economics genuinely warrant it; default path is profitable lifestyle-scale operation.

---

## Challenges & Mitigations

| Challenge | Mitigation |
|-----------|------------|
| Chicken-and-egg (need sitters before owners join) | Phase 0 is explicitly supply-first — 20+ sitters + 5-10 partners signed BEFORE owner-facing marketing. Owner waitlist collects demand without requiring supply. |
| Trust for home access | GPS tracking, DNI/NIE/passport verification, RC insurance verification, meet-and-greets, honest-about-stage brand voice (no fabricated testimonials). |
| Competing with Rover (post-Gudog merger, Blackstone-backed) | **Ecosystem moat** — local partner-discount network Rover cannot replicate at city-level scale. City-by-city, Rover's global BD won't prioritize matching. |
| Small Gijón TAM (~40k pets, ~270k residents) | Lifestyle-business framing accepted from day 1. Success = €0.3-1M ARR over 3-5 years + profitable; multi-city expansion compounds TAM but isn't required for viability. |
| Brand might over-index on Gijón/Asturias | `.impeccable.md` explicitly prohibits Asturian-specific motifs at brand level. Design system travels to Madrid/Barcelona/etc. with only photography + copy changes. |
| Regulatory compliance (GDPR, animal welfare, Ley 7/2023) | Build compliance into MVP from day one (RLS, audit log, consent records, DNI + RC verification all live). |
| Time constraints (solo founder, remote from Charleston, US) | Web-first MVP, keep scope tight, iterate post-launch. Summer trip to Gijón = Phase 0 validation window. |

---

## Estimated MVP Budget

| Item | Cost |
|------|------|
| Supabase (free tier to start) | €0 |
| Domain + hosting (Vercel) | ~€50/yr |
| Background check API | ~€2–5/check |
| Stripe fees | 1.4% + €0.25/transaction |
| Bizum integration | TBD (research required) |
| Maps API | Free tier likely sufficient for MVP |
| WhatsApp Business API | ~€0.04–0.09/message |
| **Total MVP estimate** | **Under €5,000** |
