# Stripe Integration Testing Guide

## Pre-Testing Checklist

### 1. Add Stripe Secrets to Supabase
**Path:** Supabase Dashboard → Project → Settings → Edge Functions → Secrets

Add 3 secrets (your live keys):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY`

### 2. Create a Test Course (Paid)
In admin panel:
- Title: "Test Course - $50"
- Price: 5000 (cents) = £50
- Publish: true

Note the course ID

---

## Testing Workflow

### Phase 1: Dashboard → Checkout (10 min)

1. **Start dev server**
   ```bash
   cd /Users/family/dev/safety4-lead-future
   npm run dev
   ```

2. **Log in** as student (not admin)
   - Email: student@example.com
   - Password: Test123!@#

3. **Navigate to** `/learn` → Dashboard
   - Find "Test Course - $50"
   - Click "Enroll Now"
   - Should redirect to Stripe checkout

4. **In Stripe Checkout:**
   - **Test Card:** 4242 4242 4242 4242
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVC:** Any 3 digits (e.g., 123)
   - **Name:** Test Student
   - **Email:** student@example.com
   - **Zip:** 12345

5. **After Payment:**
   - Should redirect back to course view
   - Should see lesson content (previously locked)
   - Dashboard should show "Active" enrollment

### Phase 2: Webhook Processing (5 min)

1. **Verify Enrollment Created**
   ```bash
   # In Supabase dashboard, query:
   SELECT * FROM enrollments 
   WHERE user_id = '<student-id>' 
   AND course_id = '<test-course-id>'
   ```
   - Should have `status: 'active'`
   - Should have `stripe_subscription_id` (populated)

2. **Check Webhook Logs**
   - Supabase Dashboard → Functions → handle-stripe-webhook
   - Should see successful invocation
   - No errors in logs

3. **Verify Stripe Events**
   - Stripe Dashboard → Developers → Events
   - Should see: `checkout.session.completed`
   - Should see: `customer.subscription.created`

### Phase 3: Lesson Access (5 min)

1. **View Lesson Content**
   - Click into the test course
   - View first lesson
   - Should display video + content

2. **Progress Tracking**
   - Watch video (at least 10 seconds)
   - Click "Mark as complete"
   - Progress bar should update

3. **Access Control Test**
   - Log out
   - Try to access lesson directly: `/learn/test-course/lesson-1`
   - Should redirect to login (not enrolled)

### Phase 4: Subscription Lifecycle (Optional, Advanced)

1. **Cancel Subscription** (in Stripe Dashboard)
   - Find customer subscription
   - Click "Cancel subscription"

2. **Verify Enrollment Updated**
   ```bash
   SELECT status FROM enrollments 
   WHERE stripe_subscription_id = '<sub-id>'
   ```
   - Should be `status: 'cancelled'`

3. **Verify Access Revoked**
   - Try to view lesson
   - Should show "Enrollment expired" message

---

## Test Cases (Checklist)

### Core Payment Flow
- [ ] Free course enrollment (immediate access)
- [ ] Paid course → Stripe checkout
- [ ] Test card payment succeeds
- [ ] Invalid card payment fails
- [ ] Enrollment created after payment
- [ ] Lesson access granted after payment
- [ ] Enrollment status is "active"

### Webhook Processing
- [ ] Webhook signature verified
- [ ] checkout.session.completed processed
- [ ] Enrollment record created with correct course_id
- [ ] Enrollment record created with correct user_id
- [ ] stripe_subscription_id saved
- [ ] status set to 'active'

### Access Control
- [ ] Unauthenticated user → login redirect
- [ ] Enrolled student → content accessible
- [ ] Cancelled enrollment → access denied
- [ ] Expired subscription → access denied
- [ ] Free course → accessible without payment

### Edge Cases
- [ ] Double-payment attempt (idempotency)
- [ ] Network timeout → retry logic
- [ ] Webhook received twice (idempotent)
- [ ] User updates profile during checkout
- [ ] Multiple concurrent enrollments

---

## Test Data

### Student Account
```
Email: student@test.safetytech.academy
Password: Test123!@#
Role: user
```

### Test Course
```
Title: Integration Test Course
Price: 5000 cents (£50)
Description: For testing Stripe payment flow
Status: Published
```

### Stripe Test Card
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
Zip: 12345
```

---

## Debugging

### If Checkout Doesn't Open
1. Check browser console for errors
2. Verify `STRIPE_PUBLISHABLE_KEY` is set client-side
3. Check network tab → createCheckoutSession call
4. Verify Supabase edge function is deployed

### If Enrollment Not Created
1. Check webhook logs in Supabase
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check Stripe → Developers → Events → webhook status
4. Look for signature verification errors

### If Lesson Still Locked After Payment
1. Query enrollments table for the record
2. Verify `verifyEnrollmentAccess()` is called
3. Check RLS policies on lessons table
4. Verify user_id in enrollment matches auth user

---

## Success Criteria

✅ **All tests pass when:**
1. Free courses accessible immediately
2. Paid courses redirect to Stripe checkout
3. Payment creates enrollment record
4. Enrollment status is "active"
5. Lesson content becomes accessible
6. Webhook processes silently (no errors)
7. Subscription cancellation revokes access

---

## Performance Baselines

Track these metrics:
- Checkout redirect time: < 2 seconds
- Webhook processing time: < 5 seconds
- Lesson load time: < 1 second
- Database query time: < 100ms

---

## Notes for Production

Before going live:
1. Test with real test data (not production customers)
2. Verify all error messages are user-friendly
3. Test on mobile (checkout mobile experience)
4. Test on different browsers
5. Load test with multiple concurrent enrollments
6. Backup database before enabling payments
7. Set up monitoring on webhook failures
8. Configure Slack alerts for webhook errors
