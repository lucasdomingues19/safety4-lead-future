import { useEffect, useRef, useState } from "react";
import { Check, Loader2, NotebookPen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** A private note per lesson, saved as you type. On reflection lessons it's
 *  the learner's written reflection. */
export function LessonNotes({ lessonId, userId, reflection, preview }: { lessonId: string; userId: string; reflection: boolean; preview?: boolean }) {
  const [body, setBody] = useState("");
  const [state, setState] = useState<"loading" | "idle" | "saving" | "saved" | "error">("loading");
  const timer = useRef<number>();
  const latest = useRef("");
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    supabase.from("lesson_notes").select("body").eq("user_id", userId).eq("lesson_id", lessonId).maybeSingle()
      .then(({ data }) => { if (cancelled) return; setBody(data?.body ?? ""); latest.current = data?.body ?? ""; setState("idle"); });
    return () => { cancelled = true; };
  }, [lessonId, userId]);

  const save = async (text: string) => {
    dirty.current = false;
    setState("saving");
    const { error } = await supabase.from("lesson_notes").upsert({ user_id: userId, lesson_id: lessonId, body: text, updated_at: new Date().toISOString() });
    if (latest.current === text) setState(error ? "error" : "saved");
  };

  const onChange = (text: string) => {
    setBody(text);
    latest.current = text;
    if (preview) return;
    dirty.current = true;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => save(text), 800);
  };
  // Leaving the lesson with unsaved typing: save it.
  useEffect(() => () => {
    window.clearTimeout(timer.current);
    if (dirty.current) supabase.from("lesson_notes").upsert({ user_id: userId, lesson_id: lessonId, body: latest.current, updated_at: new Date().toISOString() }).then(() => undefined);
  }, [lessonId, userId]);

  return (
    <section style={{ marginTop: reflection ? 4 : 24, borderTop: reflection ? "none" : "1px solid #eef1f6", paddingTop: reflection ? 0 : 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <label htmlFor={`note-${lessonId}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800 }}>
          <NotebookPen size={17} color="#3434ff" /> {reflection ? "Your reflection" : "My notes"}
        </label>
        <span aria-live="polite" style={{ fontSize: 12, color: state === "error" ? "#b91c1c" : "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
          {state === "saving" && <><Loader2 size={12} className="animate-spin" /> Saving…</>}
          {state === "saved" && <><Check size={12} /> Saved</>}
          {state === "error" && "Couldn't save — check your connection"}
        </span>
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 13, color: "#69697b" }}>
        {reflection
          ? "Write your answers to the questions above. Only you can see this, and it's kept with your course."
          : "Private to you. Saved automatically."}
        {preview ? " (Admin preview: notes aren't saved.)" : ""}
      </p>
      <textarea
        id={`note-${lessonId}`}
        value={body}
        disabled={state === "loading"}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => { if (dirty.current) { window.clearTimeout(timer.current); save(latest.current); } }}
        maxLength={20000}
        rows={reflection ? 9 : 4}
        placeholder={reflection ? "In my organisation…" : "Key takeaways, questions to follow up…"}
        style={{ width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 16, lineHeight: 1.6, fontFamily: "inherit", resize: "vertical", outline: "none", background: reflection ? "#fbfcff" : "#fff" }}
      />
    </section>
  );
}
