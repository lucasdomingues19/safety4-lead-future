// Course final assessments taken in Syngraph AI (see supabase/functions/final-assessment).
import { supabase } from "@/integrations/supabase/client";

export const SYNGRAPH_ORIGIN = "https://syngraph.ai";

export interface FinalAttempt {
  id: string;
  status: "launched" | "passed" | "failed";
  score: number | null;
  credential_url: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface FinalAssessmentStatus {
  configured: boolean;
  preview?: boolean;
  eligible?: boolean;
  missing_lessons?: number;
  missing_quizzes?: number;
  latest?: FinalAttempt | null;
  passed?: FinalAttempt | null;
  attempts?: number;
}

const invoke = async <T,>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke("final-assessment", { body });
  if (data?.error) throw new Error(data.error);
  if (error) {
    const ctx = (error as { context?: Response }).context;
    const msg = ctx ? await ctx.json().then((j) => j?.error).catch(() => null) : null;
    throw new Error(msg || error.message);
  }
  return data as T;
};

export const getFinalAssessmentStatus = (courseId: string) => invoke<FinalAssessmentStatus>({ action: "status", course_id: courseId });
export const launchFinalAssessment = (courseId: string) => invoke<{ url: string; attempt_id: string }>({ action: "launch", course_id: courseId });
export const syncFinalAttempt = (attemptId: string) => invoke<{ attempt: FinalAttempt }>({ action: "sync", attempt_id: attemptId });

export const isValidAssessmentRef = (ref: string) => /^ASS-[A-Z0-9]{4,}$/i.test(ref.trim());

export interface SyngraphAssessment {
  id: string;
  code: string | null;
  title: string;
  published: boolean;
  questionCount: number;
  passingScore: number;
  updatedAt: string;
}

/** Admin only: the organisation's Syngraph assessments, for linking to a course. */
export const listSyngraphAssessments = () => invoke<{ assessments: SyngraphAssessment[] }>({ action: "list" });

const words = (s: string) =>
  new Set(s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !["final", "assessment", "the", "and", "for", "with", "course"].includes(w)));

/** Best title match for a course (share of the course's words found in the assessment title). */
export const suggestAssessment = (courseTitle: string, list: SyngraphAssessment[]): SyngraphAssessment | null => {
  const target = words(courseTitle);
  if (!target.size) return null;
  let best: { a: SyngraphAssessment; score: number } | null = null;
  for (const a of list) {
    const w = words(a.title);
    const overlap = [...target].filter((t) => w.has(t)).length / target.size;
    if (!best || overlap > best.score) best = { a, score: overlap };
  }
  return best && best.score >= 0.5 ? best.a : null;
};
