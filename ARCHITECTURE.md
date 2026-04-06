# Pet Sitter App — Spain Marketplace Architecture

## Overview

A localized pet sitting marketplace for Spain, filling the gap left by Gudog's merger with Rover. The platform connects pet owners with verified sitters, emphasizing trust, home security, and Spanish-native payment/communication workflows.

**Initial market:** Gijón, Asturias (Spain-only)  
**Target MVP launch:** June 2026  
**Stack:** Next.js App Router (web-first) → Expo/React Native (mobile) + Supabase  
**Languages:** Spanish (primary) + English (secondary — for expats/tourists in Spain)  
**Development base:** Charleston, SC, USA  
**Jurisdiction:** Spain / EU — all users, data, and operations are Spanish-market only  
**Business entity:** TBD — will need a Spanish legal entity (S.L. or autónomo) to operate

---

## Business Model

- **Owners:** Free to use. Pay sitter rate + platform commission.
- **Sitters:** 15–20% commission per booking (undercuts Rover's 20%).
- **Affiliate revenue:** Discount partnerships with local pet shops, vets, and grooming salons.
- **Estimated rates:** €10–20 per visit (validate with Gijón market research).

---

## Core Features (MVP)

### 1. User Onboarding & Verification
- Sitter registration with identity verification (DNI/NIE)
- Background checks via API (Checkr, Persona, or Spanish-compliant provider)
- Owner registration (lighter verification)
- Verified badge system for trusted sitters

### 2. Pet Sitters Near You (Map View)
- Geolocation-based sitter discovery
- Map view with distance, availability, ratings
- Filter by service type, pet type, price range

### 3. Booking & Payments
- Booking flow: search → select sitter → meet-and-greet → confirm
- **Bizum** integration (primary — how Spaniards pay each other)
- **Stripe** integration (fallback / international)
- Commission deducted automatically from sitter payout

### 4. Messaging & Communication
- **WhatsApp integration** for direct owner-sitter communication
- In-app messaging as fallback
- Pre-booking meet-and-greet scheduling

### 5. GPS Tracking
- Real-time sitter location during visits
- Arrival/departure timestamps visible to owner
- Builds trust around home access — key differentiator

### 6. Photo & Video Updates
- Sitters send photo/video updates during visits
- Push notifications to owners
- Visit gallery stored per booking

### 7. Pet Health Tracker
- Sitters log feeding times, walks, medications
- Notes and observations per visit
- Accessible to owners in real time

### 8. Ratings & Reviews
- Post-booking reviews for both owners and sitters
- Reviews-for-discounts program (leave a review → unlock partner discount code)
- Gamification: 5 reviews → bigger discount tier

### 9. Loyalty & Partner Discounts
- Partner with local vets, pet shops, grooming salons in Gijón
- Discount codes distributed through app (affiliate model)
- Early adopter incentives: first booking free or 10% off
- Sitter incentive: commission waived on first few bookings

### 10. Internationalization (i18n) — Spanish & English
- **Spanish (es-ES)** as default locale — all UI, emails, notifications, legal text
- **English (en)** as secondary locale — for expats, tourists, and international users
- Language auto-detected from browser/device settings, user can override in profile
- **Default locale is es-ES** — the app is designed for Spain, English is a convenience for expats/tourists
- Implementation: `react-i18next` (web) / `i18next` (React Native)
- All content stored in translation JSON files (`/locales/es/`, `/locales/en/`)
- Reviews displayed in original language with optional translation toggle
- Legal documents (Terms of Service, Privacy Policy) must exist in both languages
- Date/time formatting: Spanish format (DD/MM/YYYY, 24h) as default
- Currency: EUR with Spanish locale formatting (1.234,56 €)

### 11. Admin Portal (`/admin`)
- **Role-based access** — admin role stored in Supabase `profiles.role` column (not env vars)
- **Overview dashboard** — total users, sitters, bookings, revenue, ratings, pending verifications
- **Sitter management** — approve/reject ID verifications, view all sitters, toggle verified status
- **Booking management** — view all bookings across all users, commission tracking
- **User management** — view all profiles, roles, registration dates, locations
- **Partner discounts** — create/edit/deactivate discount codes for local businesses
- Admin RLS policies allow full read access to all tables
- `admin_dashboard_stats()` PostgreSQL function for aggregated metrics

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLIENTS                        │
│                                                  │
│   Phase 1: Next.js App Router (SSR/SSG, PWA)     │
│   Phase 2: Expo / React Native (iOS + Android)   │
│                                                  │
│   UI: Tailwind CSS + shadcn/ui                   │
│   i18n: next-intl (es-ES default, en secondary)  │
│   Hosting: Vercel (EU edge region)               │
└──────────────────────┬──────────────────────────┘
                       │
            Next.js API Routes
            (webhooks, callbacks,
             server actions)
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│         SUPABASE (EU Region — Frankfurt)         │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐              │
│  │  Auth        │  │  Realtime     │              │
│  │  (email,     │  │  (messaging,  │              │
│  │   Google,    │  │   GPS feed,   │              │
│  │   phone)     │  │   updates)    │              │
│  └─────────────┘  └──────────────┘              │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐              │
│  │  PostgreSQL  │  │  Storage      │              │
│  │  (users,     │  │  (photos,     │              │
│  │   bookings,  │  │   videos,     │              │
│  │   reviews,   │  │   documents)  │              │
│  │   pets)      │  │              │              │
│  └─────────────┘  └──────────────┘              │
│                                                  │
│  ┌─────────────────────────────────┐            │
│  │  Edge Functions                  │            │
│  │  (commission calc, scheduled     │            │
│  │   jobs, background tasks)        │            │
│  └─────────────────────────────────┘            │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│            THIRD-PARTY INTEGRATIONS              │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │ Stripe API │  │ Bizum API  │  │ WhatsApp   ││
│  │ (payments, │  │ (Spanish   │  │ Business   ││
│  │  PSD2/SCA) │  │  payments) │  │ API        ││
│  └────────────┘  └────────────┘  └────────────┘│
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │ Background │  │ Mapbox /   │  │ Push       ││
│  │ Check API  │  │ Google Maps│  │ Notifs     ││
│  │ (Persona/  │  │ (geo, map  │  │ (FCM/APNs) ││
│  │  Checkr)   │  │  view)     │  │            ││
│  └────────────┘  └────────────┘  └────────────┘│
└─────────────────────────────────────────────────┘
```

---

## Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `users` | Owners and sitters (role-based), preferred locale (es/en), GDPR consent timestamps |
| `pets` | Pet profiles (type, name, health notes, microchip ID) |
| `sitter_profiles` | Availability, services, rates, GPS coords, verification status |
| `bookings` | Booking lifecycle (requested → confirmed → completed), cancellation/refund tracking |
| `payments` | Transaction records, commission tracking, IVA calculations, invoice references |
| `reviews` | Ratings, text reviews, linked to bookings, original language stored |
| `messages` | In-app messaging threads |
| `visit_logs` | GPS check-in/out, photos, health notes per visit |
| `partner_discounts` | Affiliate codes from local businesses |
| `verification` | Background check status, DNI/NIE verification, criminal record check status |
| `consent_records` | GDPR consent log — what was consented to, when, and version of policy |
| `legal_documents` | Terms, privacy policy, aviso legal — versioned, in es and en |
| `invoices` | Auto-generated invoices per transaction (Spanish tax compliance) |
| `audit_log` | Data access and modification log (GDPR accountability) |

---

## Security & Compliance

### Development in US, Operating in Spain
- Code is developed from Charleston, SC — but the app serves **only Spanish users**
- All user data must be stored in **EU-based regions** (Supabase allows EU region selection — choose Frankfurt or EU-West)
- No user data should be transferred to or stored in US servers
- If any US-based tools process EU personal data (analytics, error tracking), a **Standard Contractual Clauses (SCC)** agreement is required
- Business entity needed in Spain to operate legally: either a **Sociedad Limitada (S.L.)** or register as **autónomo** (self-employed)
- Spanish tax obligations: quarterly IVA (VAT) filings, annual tax returns via Agencia Tributaria
- You'll need a **NIF** (tax ID number) for the business entity to issue invoices
- Consider a **gestoría** (Spanish tax/legal advisor) to handle ongoing compliance

### GDPR / LOPDGDD (Spanish Data Protection)
- Spain enforces GDPR through **LOPDGDD** (Ley Orgánica de Protección de Datos y Garantía de los Derechos Digitales, 2018)
- Supervisory authority: **AEPD** (Agencia Española de Protección de Datos)
- Requirements:
  - Cookie consent banner (compliant with AEPD guidelines)
  - Privacy policy in both Spanish and English
  - Explicit consent for data collection at registration
  - Right to access, rectification, deletion, and data portability
  - Data Processing Agreement (DPA) with Supabase and all third-party providers
  - Data breach notification to AEPD within 72 hours
  - Designated data controller and clear legal basis for each data processing activity
  - Users under 14 require parental consent (Spain's age of consent for data)

### LSSI-CE (Spanish E-Commerce Law)
- **Ley de Servicios de la Sociedad de la Información y de Comercio Electrónico**
- Requirements:
  - Legal notice (Aviso Legal) with company name, NIF/CIF, registered address, contact email
  - Terms of Service (Condiciones de Uso) in Spanish and English
  - Clear pricing with taxes included (IVA)
  - Cancellation and refund policy compliant with Spanish consumer protection
  - Electronic contract confirmation sent to users after booking

### Spain Animal Welfare Law (Ley 7/2023)
- Ley de Protección de los Derechos y el Bienestar de los Animales
- Requirements:
  - Sitters must demonstrate knowledge of animal care responsibilities
  - Platform must not facilitate services that violate animal welfare standards
  - Liability coverage for animals in sitter care
  - Compliance with pet identification requirements (microchip verification)

### Consumer Protection (Ley General para la Defensa de los Consumidores)
- 14-day withdrawal right for digital services
- Transparent pricing — all fees and commissions clearly displayed before booking
- Dispute resolution mechanism required
- Must provide access to ODR platform (ec.europa.eu/odr) for online dispute resolution

### Background Checks & Identity Verification
- DNI/NIE verification for all sitters (mandatory)
- **Certificado de Antecedentes Penales** (criminal background check) — sitters must provide or authorize
- Spanish law requires explicit consent for background checks
- Background check data must be stored securely and deleted when no longer needed
- Consider Spanish providers: TrustYou, Evident ID, or direct integration with Spanish Ministry of Justice API

### Payment Compliance
- **PSD2 (SCA)** — Strong Customer Authentication required for European payments
- PCI DSS compliance via Stripe (Stripe handles this)
- Bizum operates under Spanish banking regulations
- Invoice generation required for all transactions (Spanish tax law)
- IVA (21%) applied to platform commission fees
- Must register as payment intermediary or use licensed payment processor
- Anti-money laundering (AML) compliance for transaction monitoring

### Technical Security
- **Row Level Security (RLS)** — Supabase RLS policies to ensure users only access their own data
- HTTPS everywhere, TLS 1.3 minimum
- GPS data encrypted at rest and in transit
- Photo/video storage with access controls (only booking participants)
- Rate limiting and abuse prevention on all API endpoints
- Audit logging for all data access and modifications

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
| Domain + hosting | ~€50/yr |
| Background check API | ~€2–5/check |
| Stripe fees | 1.4% + €0.25/transaction |
| Bizum integration | TBD (research required) |
| Maps API | Free tier likely sufficient for MVP |
| WhatsApp Business API | ~€0.04–0.09/message |
| **Total MVP estimate** | **Under €5,000** |
