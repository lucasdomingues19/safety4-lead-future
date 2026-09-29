// Course-builder AI helpers (admin only), backed by the lms-ai edge function.
import { supabase } from "@/integrations/supabase/client";

const invoke = async <T,>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke("lms-ai", { body });
  if (data?.error) throw new Error(data.error);
  if (error) {
    const ctx = (error as { context?: Response }).context;
    const msg = ctx ? await ctx.json().then((j) => j?.error).catch(() => null) : null;
    throw new Error(msg || error.message);
  }
  return data as T;
};

/** Generate multiple-choice questions for a module quiz from its lessons' content. */
export const generateQuiz = (moduleId: string, count = 5, replace = false) =>
  invoke<{ quiz_id: string; added: number }>({ action: "quiz", module_id: moduleId, count, replace });

/** Write a Markdown lesson overview from the lesson transcript. */
export const generateOverview = (lessonId: string) =>
  invoke<{ overview: string }>({ action: "overview", lesson_id: lessonId });
