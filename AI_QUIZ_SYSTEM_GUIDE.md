# AI-Powered Quiz System - Complete Guide

**Status:** ✅ IMPLEMENTATION COMPLETE  
**Date:** 2026-09-14  
**Architecture:** Claude AI + Supabase Edge Functions + React UI

---

## 🎯 What's Built

An intelligent quiz system that:
- ✅ **Supports 4 question types**: Multiple choice, True/False, Short answer, Essay
- ✅ **AI-powered grading**: Claude evaluates open-ended answers
- ✅ **Automatic scoring**: Computes pass/fail based on admin-set pass mark
- ✅ **Detailed feedback**: Each question gets personalized feedback
- ✅ **Quiz attempts tracking**: Stores all attempts with answers and scores
- ✅ **Retake support**: Admins can allow or disable quiz retakes
- ✅ **Student progress**: Shows score after quiz submission

---

## 📋 Question Types

### 1. Multiple Choice
```
Question: "What is AI?"
Options: 
  - Artificial Intelligence
  - Automatic Integration
  - Advanced Imaging
  - Automated Indexing
Correct Answer: "Artificial Intelligence"
```
**Grading:** Automatic (exact match)

### 2. True/False
```
Question: "Machine learning requires human feedback"
Correct Answer: "True"
```
**Grading:** Automatic (case-insensitive match)

### 3. Short Answer
```
Question: "Name three types of machine learning"
Expected: "Supervised, Unsupervised, Reinforcement"
Student: "Supervised learning, unsupervised learning, reinforcement learning"
```
**Grading:** AI evaluation (Claude scores 0-100)

### 4. Essay
```
Question: "Explain how AI is transforming workplace safety"
Rubric: "Should mention: automation, risk prediction, worker monitoring, compliance"
Student: "AI helps predict safety risks before they happen, automates hazard detection..."
```
**Grading:** AI evaluation using rubric (Claude scores 0-100)

---

## 🏗️ Architecture

### Components

1. **QuizDialog** (`src/components/learn/QuizDialog.tsx`)
   - Quiz UI (questions + answer inputs)
   - Answer submission handling
   - Results display with detailed feedback
   - Renders different input types per question type

2. **Quiz Utilities** (`src/lib/quiz.ts`)
   - `getQuiz()` - Load quiz metadata
   - `getQuizQuestions()` - Load questions
   - `submitQuizAttempt()` - Submit answers for grading
   - `getUserQuizAttempts()` - Fetch attempt history
   - `canRetakeQuiz()` - Check if retake is allowed

3. **Edge Function** (`supabase/functions/grade-quiz-attempt/index.ts`)
   - Receives quiz submission
   - Grades each question:
     - Multiple choice/True-False: Exact match
     - Short answer/Essay: Claude AI grading
   - Calculates final score
   - Stores attempt in database
   - Returns detailed results

### Data Flow

```
Student Answers Quiz
    ↓
QuizDialog captures answers
    ↓
Calls submitQuizAttempt()
    ↓
Invokes grade-quiz-attempt edge function
    ↓
Edge function grades each question:
  - MC/TF: Instant match check
  - Short/Essay: Send to Claude API
    ↓
Claude returns score + feedback
    ↓
Edge function calculates final score
    ↓
Stores quiz_attempts record
    ↓
Returns results to frontend
    ↓
Shows score + feedback to student
```

---

## 📊 Database Schema

### `quizzes` table
```sql
id UUID PRIMARY KEY
module_id UUID (references modules)
title VARCHAR(255)
description TEXT
pass_mark INTEGER (0-100)
allow_retakes BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `quiz_questions` table
```sql
id UUID PRIMARY KEY
quiz_id UUID (references quizzes)
text VARCHAR(1000)
type VARCHAR(20)  -- "multiple_choice", "true_false", "short_answer", "essay"
options JSONB     -- ["Option 1", "Option 2", ...] for MC questions
correct_answer VARCHAR(1000)
rubric TEXT       -- Grading guidance for AI (optional)
position INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `quiz_attempts` table
```sql
id UUID PRIMARY KEY
user_id UUID (references auth.users)
quiz_id UUID (references quizzes)
score INTEGER (0-100)
passed BOOLEAN
answers JSONB     -- {question_id: student_answer, ...}
submitted_at TIMESTAMP
created_at TIMESTAMP
```

---

## 🎓 Creating a Quiz

### Via SQL

```sql
-- Create quiz
INSERT INTO quizzes (module_id, title, pass_mark, allow_retakes)
VALUES (
  'module-id-here',
  'Safety Fundamentals Quiz',
  70,
  true
);

-- Create questions
INSERT INTO quiz_questions (quiz_id, text, type, options, correct_answer, position)
VALUES 
  (
    'quiz-id',
    'What is the primary goal of workplace safety?',
    'multiple_choice',
    '["Protect worker health and life", "Reduce company costs", "Comply with regulations", "Improve productivity"]',
    'Protect worker health and life',
    1
  ),
  (
    'quiz-id',
    'Safety audits are only needed when accidents occur',
    'true_false',
    NULL,
    'False',
    2
  ),
  (
    'quiz-id',
    'Name three key elements of an effective safety program',
    'short_answer',
    NULL,
    'Training, hazard assessment, incident reporting',
    3
  ),
  (
    'quiz-id',
    'Explain how AI can improve workplace safety management',
    'essay',
    NULL,
    'Risk prediction, hazard detection, compliance monitoring',
    4
  );
```

### UI Admin Component (Future)
Coming soon: Admin UI to create/edit quizzes without SQL

---

## 🤖 AI Grading Details

### Claude API Integration

**Model:** `claude-3-5-sonnet-20241022`  
**Cost:** ~$0.003 per short answer, ~$0.008 per essay  
**Speed:** 1-3 seconds per grading

### Grading Prompt

For short answer/essay questions, Claude receives:

```
Question: [Question text]
[Optional Rubric: Grading guidance]
Expected Answer: [Expected response or rubric]
Student's Answer: "[Student's actual response]"

Grade 0-100 and provide brief feedback
```

**Example Grading:**
- Student writes: "AI helps predict risks early"
- Expected: "Risk prediction, hazard detection"
- Claude: "Score: 75, Feedback: Good mention of prediction. Also consider hazard detection and worker monitoring."

### Quality Control

- **Rubrics optional** but recommended for consistent grading
- **Feedback is brief** (1-2 sentences per question)
- **Scores normalized** (0-100 scale)
- **Passed determination**: `score >= pass_mark`

---

## 📝 Quiz Question Best Practices

### Multiple Choice
- **4-5 options** (not too many)
- **Clear, distinct options** (avoid "all of the above")
- **One obviously correct answer**
- **Avoid negative phrasing** ("NOT important")

**Bad:** "Which is NOT a safety hazard?"  
**Good:** "Which is a primary safety hazard?"

### True/False
- **Use sparingly** (can be ambiguous)
- **Absolutely true or false** (not "sometimes" answers)
- **Similar number of true/false** across quiz

### Short Answer
- **Provide rubric** for consistent grading
- **Accept variations** (use rubric like "Any two of: [list]")
- **10-50 word expected** responses

**Rubric:** "Should mention: training, hazard assessment, and incident reporting"

### Essay
- **Always provide rubric**
- **Rubric guides AI grading** (quality matters)
- **50-200 word expected** responses
- **Test higher-order thinking**

**Rubric:** "Should explain: (1) how AI collects data, (2) what it predicts, (3) how humans use predictions"

---

## 🧪 Testing Quiz System

### Create Test Quiz (SQL)

```sql
INSERT INTO quizzes (module_id, title, pass_mark, allow_retakes)
VALUES (
  (SELECT id FROM modules LIMIT 1),
  'Test Quiz',
  70,
  true
) RETURNING id;

-- Copy returned quiz_id, then:

INSERT INTO quiz_questions (quiz_id, text, type, options, correct_answer, position)
VALUES 
  (
    '[QUIZ_ID]',
    'What does AI stand for?',
    'multiple_choice',
    '["Artificial Intelligence", "Automated Integration", "Advanced Imaging"]',
    'Artificial Intelligence',
    1
  ),
  (
    '[QUIZ_ID]',
    'AI can make decisions without human input',
    'true_false',
    NULL,
    'True',
    2
  );
```

### Test as Student

1. Complete lesson (last lesson in module)
2. Quiz dialog appears
3. Answer all questions
4. Click "Submit Quiz"
5. See results with feedback

---

## 📊 Quiz Attempts & History

### View Student's Quiz History

```sql
SELECT 
  qa.score,
  qa.passed,
  qa.submitted_at,
  qa.answers
FROM quiz_attempts qa
WHERE qa.user_id = '[STUDENT_ID]'
  AND qa.quiz_id = '[QUIZ_ID]'
ORDER BY qa.submitted_at DESC;
```

### Check if Student Passed

```sql
SELECT passed, score
FROM quiz_attempts
WHERE user_id = '[STUDENT_ID]'
  AND quiz_id = '[QUIZ_ID]'
ORDER BY submitted_at DESC
LIMIT 1;
```

---

## 🔧 Configuration

### Pass Mark
- Set per quiz (0-100)
- Default: 70%
- Update via: `UPDATE quizzes SET pass_mark = 75 WHERE id = '...'`

### Allow Retakes
- Set per quiz (true/false)
- If true: student can retake unlimited times
- If false: only one attempt allowed

### Rubric Quality
- **Good rubric:** Specific, concrete criteria
- **Bad rubric:** Vague ("student should know this")
- **Example:** "Must mention: data collection, pattern recognition, and prediction"

---

## 🎯 Grading Algorithm

```
For each question:
  If multiple_choice or true_false:
    score = (answer === correct_answer) ? 100 : 0
  Else (short_answer or essay):
    score = Claude AI evaluation (0-100)

Total score = (sum of question scores) / count of questions

Passed = total score >= pass_mark
```

---

## 📈 Quiz Metrics

### Track in Database

```sql
-- Students who passed this quiz
SELECT COUNT(DISTINCT user_id) AS passed_count
FROM quiz_attempts
WHERE quiz_id = '[QUIZ_ID]' AND passed = true;

-- Average score
SELECT AVG(score) AS avg_score
FROM quiz_attempts
WHERE quiz_id = '[QUIZ_ID]';

-- Most difficult question (lowest avg score per question)
-- This requires JSON parsing of answers (complex, future improvement)
```

---

## 🚀 Production Readiness

### Pre-Launch Checklist

- [x] QuizDialog component built
- [x] Edge function for grading
- [x] AI integration via Claude
- [x] Database schema ready
- [x] Attempt tracking
- [ ] Admin UI for quiz creation (future)
- [ ] Quiz analytics dashboard (future)
- [ ] Email notifications (future)

### Known Limitations

1. **No time limits** - Can add per quiz if needed
2. **No randomization** - Questions always in same order
3. **No question banks** - Can't randomize questions from pool
4. **No partial credit for MC** - All or nothing

---

## 🔐 Security

- ✅ **Quiz data** - Retrieved via Supabase (RLS protected)
- ✅ **Attempts storage** - User can only see their own
- ✅ **API keys** - Claude API key in Supabase secrets
- ✅ **Answer validation** - Stored as-is, grading happens server-side

---

## 💾 Environment Setup

### Supabase Secrets

Make sure you have set in Supabase Edge Function Secrets:
- `SUPABASE_URL` (project URL)
- `SUPABASE_SERVICE_ROLE_KEY` (admin key)
- `ANTHROPIC_API_KEY` (Claude API key)

Get Anthropic key at: https://console.anthropic.com/

---

## 🎓 Example Quiz

### "Safety Fundamentals" Quiz (70% pass mark)

**Q1: Multiple Choice**  
"What is the most important principle of workplace safety?"  
A) Cost reduction  
B) **Protecting worker health and life** ✓  
C) Increasing productivity  
D) Compliance with regulations  

**Q2: True/False**  
"A good safety program prevents all accidents"  
**False** ✓ (Perfect safety is impossible; focus is on risk reduction)

**Q3: Short Answer**  
"List three elements of an effective safety program"  
Rubric: "Must mention training, hazard assessment, and incident reporting"  
Expected: Any two = 60 points, all three = 100 points

**Q4: Essay**  
"Explain how AI can help manage workplace safety risks"  
Rubric: "Should address: (1) risk prediction, (2) hazard detection, (3) pattern recognition"

---

## 📞 Support

### Common Issues

**Issue:** Quiz not showing at end of lesson  
**Fix:** Make sure lesson is the last lesson in module, quiz is created, questions exist

**Issue:** Claude grading seems inconsistent  
**Fix:** Improve rubric specificity - more detailed = better grading

**Issue:** AI grading is slow  
**Fix:** Normal - Claude takes 1-3 seconds. This is expected.

---

## 🎉 Summary

The AI quiz system is **production-ready** with:
- ✅ Four question types (MC, TF, short, essay)
- ✅ Automatic grading for MC/TF
- ✅ AI grading for open-ended (via Claude)
- ✅ Detailed feedback per question
- ✅ Pass/fail determination
- ✅ Attempt tracking
- ✅ Retake support

**Next:** Build admin UI for quiz creation (currently SQL only)

