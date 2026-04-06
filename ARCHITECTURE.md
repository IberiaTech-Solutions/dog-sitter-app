# CuidaMascotas — Spain Pet Sitting Marketplace Architecture

## Overview

A localized pet sitting marketplace for Spain, filling the gap left by Gudog's merger with Rover. The platform connects pet owners with verified sitters, emphasizing trust, home security, and Spanish-native payment/communication workflows.

**Initial market:** Gijón, Asturias (Spain-only)  
**Target MVP launch:** June 2026  
**Stack:** Next.js 16 App Router + React 19 + TypeScript + Supabase + Tailwind CSS 4  
**Languages:** Spanish (primary) + English (secondary — for expats/tourists in Spain)  
**Development base:** Charleston, SC, USA  
**Jurisdiction:** Spain / EU — all users, data, and operations are Spanish-market only  
**Business entity:** TBD — will need a Spanish legal entity (S.L. or autónomo) to operate  
**Deployment:** Vercel (EU edge region)

---

## Business Model

- **Owners:** Free to use. Pay sitter rate + platform commission.
- **Sitters:** 18% commission per booking (undercuts Rover's 20%).
- **Affiliate revenue:** Discount partnerships with local pet shops, vets, and grooming salons.
- **Estimated rates:** €10–20 per visit (validate with Gijón market research).

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
| Dashboard navigation | ✅ Done | Desktop top nav + mobile bottom tab bar, back buttons on sub-pages |
| Shared UI library | ✅ Done | Button, Input, Textarea, Select, Card, Badge, Avatar, Header, DashboardShell, PageShell |
| Meet & greet flow | ✅ Done | Free intro meeting before booking, request/accept/complete flow |
| PWA (Progressive Web App) | ✅ Done | Manifest, service worker, offline page, installable on mobile home screen |
| Search filters | ✅ Done | Service type, pet type, price range, verified only — client-side filtering |
| Booking overlap prevention | ✅ Done | Server-side check in checkout + client-side check on sitter accept |
| Repeat bookings | ✅ Done | "Book again" button on completed bookings for owners |
| Reviews-for-discounts | ✅ Done | After submitting a review, owner receives partner discount code via toast |
| Push notifications | ✅ Done | VAPID web push, service worker handles push/click, sends on booking/decline/meet-greet |
| Sitter verification (DNI) | ✅ Done | Upload DNI/NIE, status tracking (pending→submitted→approved/rejected), admin approve/reject |
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

### Not Yet Started

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Bizum payments | ❌ | High | Schema ready, needs Redsys merchant account — key Spanish differentiator |
| WhatsApp integration | ❌ | High | Booking notifications via WhatsApp — high engagement in Spain |
| Instant booking option | ❌ | Medium | Let sitters opt into instant-accept — Rover offers this |
| Background checks API | ❌ | Medium | External verification provider (DNI upload works, external not wired) |
| Blog / content marketing | ❌ | Medium | SEO content for "cuidador de mascotas" — Snau has active blog |
| In-app customer support chat | ❌ | Low | Live chat or chatbot for user issues |
| Mobile app (React Native) | ❌ | Phase 2 | PWA covers mobile for now |

---

## Competitive Analysis

### Competitors in Spain

| | **Us** | **Rover** | **Snau** | **PetBacker** |
|---|---|---|---|---|
| **Commission** | 18% | ~20% | ~15-18% | ~15% |
| **Insurance** | Sitter must carry RC | Platform guarantee €25K | Partner insurer | Basic coverage |
| **DNI verification** | ✅ | ❌ | ✅ | ❌ |
| **GPS live map** | ✅ Real-time map | Walking only | Walking only | Walking only |
| **Meet & greet** | ✅ First-class flow | Encouraged | Promoted | Basic |
| **Bizum** | ❌ Planned | ❌ | Exploring | ❌ |
| **WhatsApp** | ❌ Planned | ❌ | ❌ | ❌ |
| **Native apps** | PWA | iOS + Android | iOS + Android | iOS + Android |
| **Sitter pool** | Launching (Gijón) | Largest in Spain | Medium | Small |
| **Referral program** | ✅ €5 both | ✅ | ✅ | ✅ |
| **Instant booking** | ❌ | Optional | ❌ | ❌ |
| **Two-way reviews** | ✅ | ✅ | ❌ | ❌ |
| **Daycare** | ✅ | ✅ | ✅ | ✅ |
| **Cancellation tiers** | ✅ | ✅ | Platform-defined | Platform-defined |
| **Multi-language** | es + en | 10+ | es only | 20+ |

### What We Do Better

1. **Lower commission (18%)** — undercuts Rover (20%), competitive with Snau/PetBacker
2. **Real-time GPS live map** — competitors only track walking; we show live sitter location on a map with trail
3. **DNI/NIE + insurance verification** — strongest trust pipeline; only Snau does DNI, nobody requires sitter insurance
4. **Meet & greet as first-class feature** — built into booking flow, not just "encouraged"
5. **Spanish-first localization** — Gijón focus, designed for Spanish market from day one (not adapted from US)
6. **No platform guarantee liability** — sitters carry their own RC insurance, zero financial exposure for us
7. **Notification badges** — real-time unread counts in navbar, better UX than competitors

### What Competitors Have That We Don't (Priority Gaps)

1. **Referral program** — all competitors offer this; critical for growth in Gijón
2. **Bizum payments** — uniquely Spanish, nobody has it yet — first-mover advantage
3. **WhatsApp notifications** — Spain's #1 messaging app, huge engagement potential
4. **Native mobile apps** — PWA works but app store presence builds trust
5. **Instant booking** — Rover sitters can opt in, reduces friction
6. **Daycare service** — all competitors offer it, we should add it
7. **Two-way reviews** — builds sitter trust, Rover does this
8. **Blog/SEO content** — Snau has active blog, helps organic acquisition

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
│   │   │   ├── button.tsx            # Button + LinkButton variants
│   │   │   ├── input.tsx             # Input + Textarea
│   │   │   ├── select.tsx            # Select dropdown
│   │   │   ├── card.tsx              # Card container
│   │   │   ├── badge.tsx             # Status badges (6 color variants)
│   │   │   ├── dashboard-shell.tsx   # Dashboard layout (top nav + mobile bottom tabs)
│   │   │   ├── avatar.tsx            # Initials-based avatar with gradient
│   │   │   ├── header.tsx            # Sticky glassmorphic nav bar
│   │   │   ├── page-shell.tsx        # Centered content wrapper
│   │   │   └── index.ts             # Barrel export
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
│   └── 013_sitter_insurance.sql      # Insurance verification type + has_insurance on sitter_profiles
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
- Sitters must demonstrate animal care knowledge
- Microchip verification support in pet profiles
- Liability coverage for animals in sitter care (TBD)

### Payment Compliance
- PSD2 (SCA) — Strong Customer Authentication for European payments (via Stripe)
- Invoice generation with Spanish IVA (21%) — sequential numbering
- Anti-money laundering (AML) compliance via licensed payment processor

---

## Brand Voice — Pet Perspective

All marketing copy written from the pet's point of view:
- Hero: "Encuentra a alguien que me cuide mientras no estás"
- Features: "Siempre saben dónde estoy", "Mira lo bien que estoy"
- Testimonials: reviews "translated by their humans"
- Functional UI (forms, dashboards) stays human-readable

---

## Go-to-Market Strategy

### Phase 1: Soft Launch in Gijón (Month 1–3)
- Recruit 20–30 beta users (owners + sitters) from personal network
- Partner with local vets and pet shops for referrals
- WhatsApp group and Facebook group outreach
- Waive sitter commission for first bookings
- Free first booking for owners

### Phase 2: Iterate & Grow (Month 3–6)
- Collect feedback, fix friction points
- Add partner discount program
- Reviews-for-discounts program live
- Target 100+ active users in Gijón

### Phase 3: Expand (Month 6+)
- Scale to other Spanish cities (Oviedo, Madrid, Barcelona)
- Mobile app launch (React Native)
- Investor outreach with real traction data

---

## Challenges & Mitigations

| Challenge | Mitigation |
|-----------|------------|
| Chicken-and-egg (need sitters before owners join) | Manual recruitment in Gijón, personal network, vet partnerships |
| Trust for home access | GPS tracking, verified badges, background checks, meet-and-greets |
| Competing with Rover/Trusted Housesitters | Deep Spanish localization (Bizum, WhatsApp, Spanish-first UX) |
| Regulatory compliance (GDPR, animal welfare) | Build compliance into MVP from day one |
| Time constraints (full-time job + certs) | Web-first MVP, keep scope tight, iterate post-launch |

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
