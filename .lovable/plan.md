## B2B-First Overhaul — Proposal

Goal: make the site speak primarily to organisational buyers (Heads of EHS, L&D, Operations, procurement) while keeping a clean secondary path for individuals. No content gets deleted — it gets resequenced and reframed so a company buyer instantly recognises this is for them.

The core principle: **one audience per page, one primary action per screen, proof before pricing.** `/in-company` already does this well — the rest of the site should follow its model.

---

### 1. Navigation (`AudienceNav.tsx`)

Today the nav leads with individual-learner items and a "Join the Waitlist" button. B2B buyers can't self-identify.

- Promote **"For Teams"** (→ `/in-company`) to a prominent, early nav position with visual emphasis.
- Group individual offerings (eLearning, Accelerator, Alumni) under a **"For Individuals"** dropdown.
- Change the primary nav button from "Join the Waitlist" to **"Book a Team Demo"** (→ `/contact` or a scheduling link).
- Keep IOSH & CPD, Scorecard, Blog, FAQ, Contact as supporting items.

```text
[Logo]  For Teams ▸   For Individuals ▾   IOSH & CPD   Resources ▾   [Book a Team Demo]
```

### 2. Homepage hero (`HeroSection.tsx`)

The hero currently mixes individual and company signals with two soft CTAs ("Start Learning", "Talk to Us").

- Reframe the headline around an **organisational** outcome (e.g. workforce capability / reducing digital-safety risk across teams), keeping the IOSH/CPD trust badges.
- Subhead names the buyer explicitly ("Upskill your entire EHS function…").
- **Dual CTA, B2B-first:** primary = **"Train My Team"** (→ `/in-company`); secondary = **"For Individuals"** (→ individual pricing).
- Add a thin trust strip beneath the hero ("Approved training provider by IOSH · CPD accredited · Trusted by [logos]").

### 3. Homepage section sequence (`Index.tsx`)

Resequence so the page reads like a B2B buyer journey rather than a stack of equal-weight blocks:

```text
1. Hero (B2B-first, dual CTA)
2. Trusted-by logos (Siemens, LEGO, Marsh, ABB…)
3. Problem framed for organisations (capability gap = risk + cost)
4. Solution: what a team rollout looks like
5. ROI Calculator (moved up — strongest B2B asset, currently only on /in-company)
6. Proof: one case study with a real, sourced metric
7. Pricing: Teams first, Individuals second
8. Founder/credibility + testimonials
9. Final CTA: "Book a team demo"
```

The individual-focused video, curriculum detail, and learner testimonials stay — they move below the team narrative or onto the `/elearning` and `/accelerator` pages.

### 4. Pricing (`PricingSection.tsx`)

- Lead with the **Teams / In-Company** offer (real anchor, e.g. "From £X/seat · Teams of 5–15+", with PILOT→CORE→DEPARTMENT tiers visible) instead of the vague "For Companies — Special pricing".
- Show individual options (eLearning £597, Accelerator £997) as a clearly secondary block.
- Add procurement-friendly signals: invoice/PO accepted, volume pricing, dedicated account manager, completion dashboards.

### 5. Remove B2C tactics from the homepage

- Move scarcity ("only X spots left"), exit-intent discount popups, and countdown urgency **off the homepage** and reserve them for the individual Cohort/Accelerator pages. These undermine B2B credibility with procurement buyers.

### 6. Add B2B proof points

- One or two short case studies / outcome stats on the homepage and `/in-company` (e.g. "reduced safety-admin time by X hrs/week"). Must use real, sourced or client-approved numbers — no invented metrics.

---

### What stays the same
- `/in-company` (already the strongest B2B page — becomes the canonical destination).
- All individual offerings remain fully available under "For Individuals".
- Branding, palette, typography, IOSH/CPD positioning, and existing analytics/tracking.

### Technical notes (for implementation)
- Frontend/presentation only: edits to `AudienceNav.tsx`, `HeroSection.tsx`, `Index.tsx`, `PricingSection.tsx`, and conditional rendering of `StickyCTABar` / `ExitIntentPopup` / scarcity components by route.
- No schema, backend, or data-model changes required.
- Real case-study metrics need to be supplied by you before they go live.

---

This is a proposal only — nothing has been changed. Tell me which parts you want, and I'll implement them (we can also stage it: nav + hero first, then pricing, then proof).