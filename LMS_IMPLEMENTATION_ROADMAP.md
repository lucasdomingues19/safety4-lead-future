# SafetyTech Academy LMS Implementation Roadmap

**Status**: Core foundation complete | Payment system ready | Admin features pending

**Last Updated**: 2026-09-11

---

## ✅ COMPLETED (Phase 1: Core Foundation)

### Database Schema & Security
- [x] LMS database schema (courses, modules, lessons, enrollments, progress, certificates)
- [x] Row Level Security (RLS) policies on all tables
- [x] Performance indexes on foreign keys
- [x] Drip-content scheduling (module unlock timing)

### Authentication
- [x] Email/password signup & signin via Supabase Auth
- [x] Google OAuth integration
- [x] Session persistence & auto-redirect
- [x] Admin role detection

### Student Experience
- [x] Course catalogue with free/paid courses
- [x] Course enrollment (free courses)
- [x] Lesson viewing with embedded video (YouTube, Vimeo, Mux, Bunny)
- [x] Progress tracking (watch duration, completion)
- [x] Module unlock scheduling (drip-content)
- [x] Next/previous lesson navigation
- [x] Breadcrumb navigation

### Type Safety
- [x] Fixed Course interface (price_cents, currency, cover_image_url, cpd_hours)
- [x] Fixed Quiz interface (module_id instead of lesson_id)
- [x] Added QuizAttempt interface for tracking

### Payment System (Phase 2: JUST COMPLETED)
- [x] Stripe checkout session creation
- [x] Stripe customer management (auto-create/retrieve)
- [x] Stripe product & price management
- [x] Webhook handler for Stripe events
- [x] Webhook signature verification (security)
- [x] Enrollment creation on payment success
- [x] Subscription lifecycle management (updated, deleted, cancelled)
- [x] Enrollment verification utility

---

## 🚧 IN PROGRESS (Phase 3: Integration)

### Student Dashboard Enhancement
- [ ] Update paid course enrollment flow
- [ ] Add "Enroll" button that triggers Stripe checkout
- [ ] Redirect to Stripe payment page
- [ ] Handle checkout success/cancel
- [ ] Display enrollment status after purchase

### Access Control
- [ ] Add enrollment verification to CourseView
- [ ] Add enrollment verification to LessonView
- [ ] Block access to paid course content without active subscription
- [ ] Show "Enroll to continue" message for locked content

### Admin Interface
- [ ] Implement admin course manager component (stub)
- [ ] Implement admin user management component (stub)
- [ ] Implement admin analytics/reports component (stub)
- [ ] Implement admin billing dashboard component (stub)
- [ ] Add role-based access control verification

---

## ⏭️ TODO (Phase 4: Quiz & Certificates)

### Quiz System
- [ ] Create quiz_attempts table (track quiz submissions)
- [ ] Implement quiz UI component
- [ ] Quiz question rendering (multiple choice, T/F, short answer)
- [ ] Quiz answer submission & validation
- [ ] Score calculation & pass/fail logic
- [ ] Quiz pass requirement before advancing
- [ ] Quiz retry logic (allow retakes)
- [ ] Quiz progress tracking in dashboard

### Certificates
- [ ] Create certificate_template table
- [ ] Implement certificate generation edge function
- [ ] Add certificate viewer/download page
- [ ] Email certificate to user on completion
- [ ] Certificate download as PDF
- [ ] Certificate verification page (public)

### Email Notifications
- [ ] Enrollment confirmation email
- [ ] Course completion email
- [ ] Certificate issuance email
- [ ] Weekly progress reminder (optional)
- [ ] Course expiration warning (30 days before)

---

## ⏸️ TODO (Phase 5: Analytics & Admin)

### Student Analytics
- [ ] Course enrollment trends
- [ ] Completion rates by course
- [ ] Average time to complete
- [ ] Student performance heatmap
- [ ] Revenue by course

### Instructor Dashboard
- [ ] Student list per course
- [ ] Student progress tracking
- [ ] Completion certificates issued
- [ ] Course feedback/reviews

### Billing & Subscriptions
- [ ] Subscription management dashboard
- [ ] Refund handling
- [ ] Revenue reporting
- [ ] Subscription pause/resume
- [ ] Plan upgrades/downgrades

---

## 📋 CONFIGURATION REQUIRED

### Environment Variables Needed
```
STRIPE_SECRET_KEY=sk_live_xxxxx          # Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx     # Stripe public key (for frontend)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx        # Webhook signing secret
```

### Stripe Setup Required
1. [ ] Create Stripe account (production)
2. [ ] Configure webhook endpoint → `https://your-domain/functions/v1/handle-stripe-webhook`
3. [ ] Subscribe to webhook events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. [ ] Set up payment method collection (cards, Apple Pay, Google Pay)
5. [ ] Configure tax settings (UK VAT if applicable)

### Database Migrations Needed
```sql
-- Quiz attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificate templates
CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  template_url TEXT,
  custom_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔒 SECURITY CHECKLIST

### ✅ Already Implemented
- [x] Row Level Security on all LMS tables
- [x] Enrollment verification before lesson access
- [x] Webhook signature verification (Stripe)
- [x] Service role separation for webhooks
- [x] Admin role detection in UI

### 🚧 In Progress
- [ ] Payment verification before enrollment access
- [ ] Rate limiting on quiz attempts
- [ ] Video URL validation (XSS prevention)
- [ ] Resource link validation

### ⏳ TODO
- [ ] Certificate authenticity verification
- [ ] Drip-content unlock enforcement (backend check)
- [ ] Quiz attempt limits per subscription
- [ ] IP-based fraud detection
- [ ] SSL/TLS enforcement
- [ ] GDPR compliance (data retention, deletion)

---

## 🎯 IMMEDIATE NEXT STEPS (This Week)

### Day 1-2: Integration
1. [x] Fix type schema mismatches
2. [x] Implement Stripe checkout & webhooks
3. [ ] Update LearnDashboard for paid enrollment
4. [ ] Test payment flow end-to-end

### Day 3-4: Access Control
1. [ ] Add enrollment checks to CourseView
2. [ ] Add enrollment checks to LessonView
3. [ ] Block content access without subscription
4. [ ] Show enrollment upsell

### Day 5: Admin & Testing
1. [ ] Implement core admin components
2. [ ] Add role-based access control
3. [ ] Test admin course management
4. [ ] Load test enrollment workflow

---

## 📊 FEATURE COMPLETION MATRIX

| Feature | Status | Priority | Est. Hours |
|---------|--------|----------|-----------|
| **Type Schema Fixes** | ✅ | CRITICAL | 1 |
| **Stripe Checkout** | ✅ | CRITICAL | 4 |
| **Stripe Webhooks** | ✅ | CRITICAL | 3 |
| **Dashboard Integration** | ⏳ | HIGH | 3 |
| **Enrollment Verification** | ⏳ | HIGH | 2 |
| **Admin Components** | ⏳ | HIGH | 8 |
| **Quiz System** | 🚧 | HIGH | 10 |
| **Certificates** | 🚧 | HIGH | 6 |
| **Email Notifications** | ⏳ | MEDIUM | 5 |
| **Analytics** | ⏳ | MEDIUM | 12 |
| **GDPR Compliance** | ⏳ | MEDIUM | 4 |

**Estimated Total**: ~58 hours to production-ready

---

## 💡 TESTING STRATEGY

### Unit Tests
- [ ] Type interfaces
- [ ] Stripe utility functions
- [ ] Enrollment verification logic
- [ ] Quiz scoring calculations

### Integration Tests
- [ ] End-to-end payment flow
- [ ] Webhook processing
- [ ] Enrollment creation & access
- [ ] Quiz submission & scoring

### Security Tests
- [ ] RLS policy enforcement
- [ ] Webhook signature verification
- [ ] XSS prevention (video URLs, content)
- [ ] CSRF protection

### Load Tests
- [ ] Concurrent enrollment spikes
- [ ] Quiz submission throughput
- [ ] Video streaming performance
- [ ] Database query optimization

---

## 📝 DOCUMENTATION

### User-Facing
- [ ] Student handbook (how to use LMS)
- [ ] FAQ
- [ ] Troubleshooting guide
- [ ] Certificate policy

### Developer-Facing
- [ ] API documentation (edge functions)
- [ ] Database schema diagram
- [ ] RLS policy documentation
- [ ] Stripe integration guide
- [ ] Deployment checklist

---

## 🚀 GO-LIVE CRITERIA

Before launching paid courses, ensure:

✅ **Functional**
- [x] Authentication working
- [x] Free course enrollment working
- [ ] Paid course enrollment working
- [ ] Webhook processing working
- [ ] Payment verification working
- [ ] Quiz system working
- [ ] Certificates issuing

✅ **Secure**
- [x] RLS policies enforced
- [ ] No XSS vulnerabilities
- [ ] No SQL injection vectors
- [ ] Webhook signatures verified
- [x] Payment data encrypted (Stripe)
- [ ] Rate limiting active

✅ **Trustworthy**
- [ ] Automated backups configured
- [ ] Disaster recovery plan ready
- [ ] Monitoring & alerting set up
- [ ] Incident response plan documented
- [ ] User data privacy guaranteed
- [ ] Certificate authenticity verifiable

---

## 🔄 CONTINUOUS IMPROVEMENT

After launch, monitor:
- Student completion rates
- Payment success rates
- Support tickets
- Performance metrics
- Security incidents

Iterate based on user feedback and analytics.

---

## QUESTIONS FOR LUCAS

1. Should quizzes be required to complete courses?
2. What's the certificate issuing service? (Syngraph, custom PDF, browser-rendered?)
3. Should there be course prerequisites?
4. Do you want student progress emails (weekly, monthly)?
5. Should certificates auto-expire after N years?
6. What's the refund policy for subscriptions?
