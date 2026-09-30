import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, CheckCircle2, ClipboardCheck, ExternalLink, Loader2, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Course } from "@/lib/lms";
import {
  SYNGRAPH_ORIGIN,
  getFinalAssessmentStatus,
  launchFinalAssessment,
  syncFinalAttempt,
  attemptsLeftLabel,
  type FinalAssessmentStatus,
  type FinalAttempt,
} from "@/lib/finalAssessment";
import brandMarkBlue from "@/assets/brand-mark-blue.png";

type Phase = "loading" | "overview" | "taking" | "checking" | "result";

const FinalAssessmentView = () => {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [status, setStatus] = useState<FinalAssessmentStatus | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [launch, setLaunch] = useState<{ url: string; attemptId: string } | null>(null);
  const [result, setResult] = useState<FinalAttempt | null>(null);
  const [starting, setStarting] = useState(false);
  const checkingRef = useRef(false);

  const load = useCallback(async () => {
    const { data: c } = await supabase.from("courses").select("*").eq("slug", courseSlug ?? "").maybeSingle();
    if (!c) { toast.error("Course not found"); navigate("/learn"); return; }
    setCourse(c as Course);
    try {
      const s = await getFinalAssessmentStatus(c.id);
      if (!s.configured) { navigate(`/learn/${courseSlug}`, { replace: true }); return; }
      setStatus(s);
      if (s.passed) { setResult(s.passed); setPhase("result"); } else setPhase("overview");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load the final assessment");
      navigate(`/learn/${courseSlug}`);
    }
  }, [courseSlug, navigate]);
  useEffect(() => { load(); }, [load]);

  // Ask the server for the real result (it checks with Syngraph) until it's in.
  const checkResult = useCallback(async (attemptId: string) => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setPhase("checking");
    for (let i = 0; i < 12; i++) {
      try {
        const { attempt } = await syncFinalAttempt(attemptId);
        if (attempt.status !== "launched") {
          setResult(attempt);
          setPhase("result");
          checkingRef.current = false;
          if (course) getFinalAssessmentStatus(course.id).then(setStatus).catch(() => undefined);
          return;
        }
      } catch { /* retry */ }
      await new Promise((r) => setTimeout(r, 2500));
    }
    checkingRef.current = false;
    toast.error("We're still waiting for your result — refresh this page in a minute.");
    setPhase("overview");
  }, [course]);

  // The embedded Syngraph page nudges us when the learner submits.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== SYNGRAPH_ORIGIN || e.data?.source !== "syngraph" || e.data?.type !== "attempt.completed") return;
      if (launch) checkResult(launch.attemptId);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [launch, checkResult]);

  const start = async () => {
    if (!course) return;
    setStarting(true);
    try {
      const { url, attempt_id } = await launchFinalAssessment(course.id);
      setLaunch({ url, attemptId: attempt_id });
      setResult(null);
      setPhase("taking");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The assessment couldn't be opened");
    } finally {
      setStarting(false);
    }
  };

  const shell = (children: React.ReactNode, wide = false) => (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%)", color: "white", padding: "22px 24px" }}>
        <div style={{ maxWidth: wide ? "1200px" : "880px", margin: "0 auto", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <img src={brandMarkBlue} alt="SafetyTech Academy" style={{ height: "30px", filter: "brightness(0) invert(1)" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8 }}>Final assessment</div>
            <div style={{ fontSize: "18px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{course?.title}</div>
          </div>
          <Link to={`/learn/${courseSlug}`} style={{ color: "white", fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", opacity: 0.9 }}>
            <ArrowLeft size={15} /> Back to course
          </Link>
        </div>
      </div>
      <div style={{ maxWidth: wide ? "1200px" : "880px", margin: "0 auto", padding: wide ? "16px" : "40px 16px" }}>{children}</div>
    </div>
  );

  const card: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "36px", textAlign: "center" };
  const primaryBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 26px", background: "#3434ff", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "15px", cursor: "pointer", textDecoration: "none", fontFamily: "inherit" };

  if (phase === "loading" || !status) {
    return shell(<div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}><Loader2 size={30} className="animate-spin" color="#3434ff" /></div>);
  }

  if (phase === "taking" && launch) {
    return shell(
      <>
        <iframe
          src={launch.url}
          title="Final assessment"
          allow="clipboard-write"
          style={{ width: "100%", height: "calc(100vh - 120px)", minHeight: "560px", border: "1px solid #e2e8f0", borderRadius: "16px", background: "white", display: "block" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginTop: "10px", fontSize: "12.5px", color: "#69697b", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><ShieldCheck size={14} color="#3434ff" /> Graded and certified securely by Syngraph AI</span>
          <button onClick={() => checkResult(launch.attemptId)} style={{ background: "none", border: "none", color: "#3434ff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "12.5px" }}>
            Finished? Check my result
          </button>
        </div>
      </>,
      true,
    );
  }

  if (phase === "checking") {
    return shell(
      <div style={card}>
        <Loader2 size={34} className="animate-spin" color="#3434ff" style={{ margin: "0 auto" }} />
        <h2 style={{ margin: "18px 0 6px", fontSize: "22px" }}>Confirming your result…</h2>
        <p style={{ margin: 0, color: "#69697b" }}>This takes a few seconds.</p>
      </div>,
    );
  }

  if (phase === "result" && result) {
    const passed = result.status === "passed";
    return shell(
      <div style={card}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: passed ? "#ecffd1" : "#fff1f2" }}>
          {passed ? <Award size={36} color="#3f6212" /> : <RotateCcw size={32} color="#be123c" />}
        </div>
        <h2 style={{ margin: "20px 0 6px", fontSize: "26px" }}>{passed ? "You passed — congratulations!" : "Not quite this time"}</h2>
        <p style={{ margin: "0 auto", color: "#69697b", maxWidth: "520px", lineHeight: 1.6 }}>
          {passed
            ? "Your verified certificate has been issued. It's signed, tamper-proof and can be checked by anyone — add it to your LinkedIn profile."
            : status.can_attempt === false
              ? "You've used all your attempts for this assessment. Contact hello@safetytech.academy and we'll help you with next steps."
              : `Review the course material and try again whenever you're ready.${attemptsLeftLabel(status) ? ` You have ${attemptsLeftLabel(status)}.` : ""}`}
        </p>
        {result.score !== null && <div style={{ marginTop: "18px", fontSize: "40px", fontWeight: 800, color: passed ? "#16a34a" : "#0b0b2c" }}>{Math.round(Number(result.score))}%</div>}
        <div style={{ marginTop: "26px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {passed && result.credential_url && (
            <a href={result.credential_url} target="_blank" rel="noopener noreferrer" style={primaryBtn}><Award size={18} /> View my certificate <ExternalLink size={14} /></a>
          )}
          {!passed && status.can_attempt !== false && <button onClick={start} disabled={starting} style={{ ...primaryBtn, opacity: starting ? 0.7 : 1 }}>{starting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Try again</button>}
          <Link to={`/learn/${courseSlug}`} style={{ ...primaryBtn, background: "white", color: "#0b0b2c", border: "1px solid #e2e8f0" }}>Back to course</Link>
        </div>
      </div>,
    );
  }

  // Overview
  const outOfAttempts = status.can_attempt === false && !status.passed;
  const locked = !status.eligible || outOfAttempts;
  const last = status.latest && status.latest.status === "failed" ? status.latest : null;
  return shell(
    <div style={card}>
      <div style={{ width: "72px", height: "72px", borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: locked ? "#f1f5f9" : "#f1f4ff" }}>
        {locked ? <Lock size={30} color="#94a3b8" /> : <ClipboardCheck size={32} color="#3434ff" />}
      </div>
      <h2 style={{ margin: "20px 0 8px", fontSize: "26px" }}>{outOfAttempts ? "No attempts left" : locked ? "Final assessment locked" : "Ready for your final assessment?"}</h2>
      <p style={{ margin: "0 auto", color: "#69697b", maxWidth: "540px", lineHeight: 1.6 }}>
        {outOfAttempts
          ? "You've used all your attempts for this assessment. Contact hello@safetytech.academy and we'll help you with next steps."
          : locked
          ? `Finish ${[status.missing_lessons ? `${status.missing_lessons} more ${status.missing_lessons === 1 ? "lesson" : "lessons"}` : "", status.missing_quizzes ? `${status.missing_quizzes} module ${status.missing_quizzes === 1 ? "quiz" : "quizzes"}` : ""].filter(Boolean).join(" and ")} to unlock it.`
          : "Pass it to earn your verified SafetyTech Academy certificate. Set aside uninterrupted time — once you start, complete it in one sitting."}
      </p>
      {status.preview && <p style={{ margin: "14px auto 0", fontSize: "13px", color: "#7a4b00", background: "#fff7e6", border: "1px solid #f5d9a8", borderRadius: "10px", padding: "8px 12px", display: "inline-block" }}>Admin preview — you're not enrolled, but you can open the assessment.</p>}
      {(last || (!locked && attemptsLeftLabel(status))) && (
        <p style={{ margin: "14px 0 0", fontSize: "14px", color: "#69697b" }}>
          {last && <>Your last attempt: <strong style={{ color: "#0b0b2c" }}>{Math.round(Number(last.score ?? 0))}%</strong>{attemptsLeftLabel(status) ? " · " : ""}</>}
          {!outOfAttempts && attemptsLeftLabel(status)}
        </p>
      )}
      <div style={{ marginTop: "26px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
        {locked ? (
          <Link to={`/learn/${courseSlug}`} style={primaryBtn}>{outOfAttempts ? "Back to course" : "Continue the course"}</Link>
        ) : (
          <button onClick={start} disabled={starting} style={{ ...primaryBtn, opacity: starting ? 0.7 : 1 }}>
            {starting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} {last ? "Try again" : "Start final assessment"}
          </button>
        )}
      </div>
      <p style={{ marginTop: "22px", fontSize: "12.5px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <ShieldCheck size={14} /> Graded and certified securely by Syngraph AI
      </p>
    </div>,
  );
};

export default FinalAssessmentView;
