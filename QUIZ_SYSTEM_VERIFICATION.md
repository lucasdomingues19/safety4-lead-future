# Quiz System Verification Plan

**Status:** Testing phase  
**Goal:** Verify end-to-end quiz submission, grading, and feedback

---

## 🧪 Phase 1: Manual Verification

### Step 1: Create Test Quiz (SQL)

Run these queries in Supabase SQL Editor:

```sql
-- 1. Create a test course first (if doesn't exist)
INSERT INTO courses (title, slug, description, published)
VALUES ('Quiz Test Course', 'quiz-test-course', 'Test course for quiz verification', true)
RETURNING id;
-- Copy the returned ID as [COURSE_ID]

-- 2. Create a module
INSERT INTO modules (course_id, title, position)
VALUES ('[COURSE_ID]', 'Test Module', 1)
RETURNING id;
-- Copy the returned ID as [MODULE_ID]

-- 3. Create a quiz
INSERT INTO quizzes (module_id, title, pass_mark, allow_retakes)
VALUES ('[MODULE_ID]', 'Verification Quiz', 70, true)
RETURNING id;
-- Copy the returned ID as [QUIZ_ID]

-- 4. Create test questions
INSERT INTO quiz_questions (quiz_id, text, type, options, correct_answer, position)
VALUES
  (
    '[QUIZ_ID]',
    'What is the primary goal of AI adoption in safety?',
    'multiple_choice',
    '["Automation of reporting", "Risk prediction and prevention", "Compliance documentation", "Cost reduction"]',
    'Risk prediction and prevention',
    1
  ),
  (
    '[QUIZ_ID]',
    'AI can eliminate all workplace hazards',
    'true_false',
    NULL,
    'False',
    2
  ),
  (
    '[QUIZ_ID]',
    'Name three applications of AI in workplace safety',
    'short_answer',
    NULL,
    'Hazard detection, incident prediction, safety compliance monitoring',
    3
  ),
  (
    '[QUIZ_ID]',
    'Explain how AI improves safety culture in your organization',
    'essay',
    NULL,
    'Real-time monitoring, predictive analytics, faster incident response',
    4
  );
```

### Step 2: Verify Edge Function Deployment

Check if the edge function is deployed:

```bash
# From the CLI, verify the function exists
supabase functions list

# Expected output should include: grade-quiz-attempt
```

### Step 3: Test Quiz Submission (UI)

1. Go to `/learn/[course-slug]`
2. Enroll in "Quiz Test Course"
3. Navigate to the lesson at the end of "Test Module"
4. Quiz dialog should appear
5. **Answer all 4 questions:**
   - MC: Select "Risk prediction and prevention"
   - T/F: Select "False"
   - Short: Type "risk prediction, incident prevention, compliance"
   - Essay: Type "AI helps predict hazards before they happen and enables faster response"
6. Click "Submit Quiz"
7. **Verify Results:**
   - Score displays (should be ~70-100%)
   - "You passed" or "Try again" message appears
   - Detailed feedback shows for each question

### Step 4: Verify Database Storage

Check quiz_attempts table:

```sql
SELECT 
  score,
  passed,
  submitted_at,
  answers
FROM quiz_attempts
WHERE quiz_id = '[QUIZ_ID]'
ORDER BY submitted_at DESC
LIMIT 1;
```

Expected:
- ✓ Score: 70-100
- ✓ Passed: true
- ✓ Answers: JSON with all 4 questions
- ✓ Submitted_at: Current timestamp

---

## 🤖 Phase 2: Edge Function Testing

### Step 1: Test Claude API Integration

The edge function should:
1. Receive quiz submission
2. Grade MC/TF instantly
3. Send short answer & essay to Claude
4. Receive score & feedback from Claude
5. Calculate final score
6. Store attempt in database

### Step 2: Check Supabase Secrets

Verify edge function has required secrets:

```bash
# Check if secrets are set in Supabase
# Go to Project Settings > Edge Functions > Secrets
# Required: ANTHROPIC_API_KEY
```

If missing, add it:
- Key: `ANTHROPIC_API_KEY`
- Value: [Your Claude API key]

### Step 3: Monitor Edge Function Logs

```bash
# Check logs for any errors
supabase functions logs grade-quiz-attempt
```

Look for:
- Request payload logged
- Claude API calls
- Score calculations
- Database insert success

---

## 📧 Phase 3: Email Notification Trigger

Once quiz passes, verify email is sent:

```sql
-- Check email_logs table
SELECT recipient, email_type, status, data
FROM email_logs
WHERE email_type = 'completion'
ORDER BY created_at DESC
LIMIT 5;
```

Expected:
- ✓ Recipient: Student's email
- ✓ Email_type: 'completion'
- ✓ Status: 'sent' or 'pending'
- ✓ Message_id: From Resend API

---

## 🐛 Phase 4: Troubleshooting

### Quiz doesn't appear at end of lesson
- [ ] Verify quiz was created (check quizzes table)
- [ ] Verify quiz_questions were created
- [ ] Verify the lesson is the last in the module
- [ ] Check browser console for errors

### Grading fails
- [ ] Check edge function logs
- [ ] Verify ANTHROPIC_API_KEY is set
- [ ] Check Claude API rate limits
- [ ] Verify network connectivity

### Scores seem wrong
- [ ] Check rubric text in quiz_questions
- [ ] Verify correct_answer values
- [ ] Test with very clear answers first
- [ ] Review Claude's grading prompt

### Email doesn't send
- [ ] Verify RESEND_API_KEY in edge function secrets
- [ ] Check email_logs table for failure status
- [ ] Verify student email is in database
- [ ] Check Resend dashboard for errors

---

## ✅ Success Criteria

- [x] QuizDialog component renders
- [ ] Questions load from database
- [ ] All 4 question types display correctly
- [ ] Answer submission validates all answered
- [ ] Edge function receives submission
- [ ] Claude API grades open-ended questions
- [ ] Final score calculated correctly
- [ ] Results display with feedback
- [ ] Attempt stored in quiz_attempts table
- [ ] Email sent on quiz pass (Phase 3)

---

## 📊 Metrics to Track

After verification, monitor:

```sql
-- Quiz attempt rate
SELECT 
  COUNT(*) total_attempts,
  SUM(CASE WHEN passed THEN 1 ELSE 0 END) passed_count,
  ROUND(100.0 * SUM(CASE WHEN passed THEN 1 ELSE 0 END) / COUNT(*), 1) pass_rate
FROM quiz_attempts;

-- Average grading time (from submitted_at to DB insert)
SELECT 
  AVG(EXTRACT(EPOCH FROM (created_at - submitted_at))) avg_seconds
FROM quiz_attempts;

-- Most common scores
SELECT score, COUNT(*) count
FROM quiz_attempts
GROUP BY score
ORDER BY count DESC
LIMIT 10;
```

---

## Next Steps

1. ✓ Verify quiz system works end-to-end
2. → Build enrollment flow (students can enroll in courses)
3. → Build student dashboard (see enrolled courses)
4. → Integrate email notifications on quiz pass
5. → Build certificate generation (with Syngraph)

