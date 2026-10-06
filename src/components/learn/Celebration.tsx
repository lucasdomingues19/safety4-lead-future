import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Check, Copy, ExternalLink, Linkedin, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { courseMeta, linkedInAddToProfileUrl, linkedInPostText, linkedInPostUrl } from "@/lib/courseMeta";

const COLORS = ["#9EFF1F", "#3434FF", "#FAFAFA", "#8F8FFF", "#CFCFDB"];

/** A short burst of brand-coloured confetti. Skipped for people who prefer reduced motion. */
export function Confetti({ run }: { run: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!run || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const w = (cv.width = cv.offsetWidth * 2), h = (cv.height = cv.offsetHeight * 2);
    const bits = Array.from({ length: 150 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * w * 0.25, y: h * 0.32,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 4,
      s: 8 + Math.random() * 10, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: COLORS[(Math.random() * COLORS.length) | 0],
    }));
    let raf = 0, t = 0;
    const tick = () => {
      t++;
      ctx.clearRect(0, 0, w, h);
      for (const b of bits) {
        b.vy += 0.38; b.x += b.vx; b.y += b.vy; b.vx *= 0.995; b.r += b.vr;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.globalAlpha = Math.max(0, 1 - t / 170);
        ctx.fillStyle = b.c; ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); ctx.restore();
      }
      if (t < 170) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/** Share on LinkedIn, add to profile, copy the post, open the certificate. */
export function ShareActions({ courseTitle, slug, verifyUrl, certNumber, compact }: { courseTitle: string; slug?: string; verifyUrl: string; certNumber?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const meta = courseMeta(courseTitle, slug);
  const text = linkedInPostText(courseTitle, verifyUrl, meta.landing);
  const num = certNumber ?? verifyUrl.split("/").pop() ?? "";
  const track = () => { if (num) void supabase.functions.invoke("track-certificate-interaction", { body: { certificateNumber: num, event: "linkedin" } }); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("Post copied"); }
    catch { toast.error("Couldn't copy. Select the text and copy it instead."); }
  };
  const btn = (primary: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: compact ? "9px 14px" : "12px 18px", borderRadius: 10,
    border: primary ? 0 : "1px solid #cbd5e1", background: primary ? "#0A66C2" : "#fff", color: primary ? "#fff" : "#0b0b2c",
    fontWeight: 700, fontSize: compact ? 13 : 14, fontFamily: "inherit", cursor: "pointer", textDecoration: "none",
  });
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
      <a href={linkedInPostUrl(text)} target="_blank" rel="noopener noreferrer" onClick={track} style={btn(true)}><Linkedin size={16} /> Share on LinkedIn</a>
      <a href={linkedInAddToProfileUrl(courseTitle, verifyUrl, certNumber)} target="_blank" rel="noopener noreferrer" onClick={track} style={btn(false)}><Award size={16} /> Add to profile</a>
      <button type="button" onClick={copy} style={btn(false)}>{copied ? <Check size={16} /> : <Copy size={16} />} Copy post text</button>
    </div>
  );
}

interface NextCourse { id: string; title: string; slug: string; price_cents: number | null; currency: string | null }

/** The moment a learner finishes a course: badge, certificate, share, and what to do next. */
export function CourseCelebration({ open, onClose, courseTitle, slug, verifyUrl, certNumber }: {
  open: boolean; onClose: () => void; courseTitle: string; slug?: string; verifyUrl: string; certNumber?: string;
}) {
  const navigate = useNavigate();
  const meta = courseMeta(courseTitle, slug);
  const [others, setOthers] = useState<NextCourse[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: all }, { data: mine }] = await Promise.all([
        supabase.from("courses").select("id, title, slug, price_cents, currency").eq("published", true),
        user ? supabase.from("enrollments").select("course_id").eq("user_id", user.id) : Promise.resolve({ data: [] as { course_id: string }[] }),
      ]);
      const have = new Set((mine ?? []).map((e) => e.course_id));
      setOthers(((all ?? []) as NextCourse[]).filter((c) => !have.has(c.id) && c.slug !== slug).slice(0, 2));
    })();
  }, [open, slug]);

  const money = (c: NextCourse) => (c.price_cents ? new Intl.NumberFormat("en-GB", { style: "currency", currency: (c.currency ?? "gbp").toUpperCase(), maximumFractionDigits: 0 }).format(c.price_cents / 100) : "");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto border-0 bg-white p-0 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c]">
        <DialogTitle className="sr-only">Course complete</DialogTitle>
        <DialogDescription className="sr-only">You completed {courseTitle}. Share your credential or choose what to do next.</DialogDescription>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(160deg,#202058 0%,#0E0E33 100%)", color: "#fff", padding: "34px 28px 26px", textAlign: "center", position: "relative" }}>
            <Confetti run={open} />
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".16em", color: "#9EFF1F" }}>COURSE COMPLETE</div>
            {meta.badge
              ? <div style={{ width: 168, height: 168, margin: "16px auto 8px", background: "#fff", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 40px rgba(0,0,0,.45), 0 0 0 6px rgba(158,255,31,.18)" }}>
                  <img src={meta.badge} alt={`${courseTitle} badge`} style={{ width: 148, height: 148, objectFit: "contain" }} />
                </div>
              : <Award size={84} color="#9EFF1F" style={{ margin: "18px auto 8px", display: "block" }} />}
            <h2 style={{ margin: "14px 0 4px", fontSize: 26, fontWeight: 800, lineHeight: 1.2, color: "#fff" }}>You did it.</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: "#CFCFDB", lineHeight: 1.5 }}>You've completed <strong style={{ color: "#fff" }}>{courseTitle}</strong>. Your verified certificate is issued and emailed to you.</p>
          </div>

          <div style={{ padding: "22px 26px 26px", display: "grid", gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, textAlign: "center" }}>Tell your network</div>
              <ShareActions courseTitle={courseTitle} slug={slug} verifyUrl={verifyUrl} certNumber={certNumber} />
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <a href={verifyUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, color: "#3434ff", display: "inline-flex", alignItems: "center", gap: 6 }}>View your certificate <ExternalLink size={13} /></a>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>What's next</div>
              <div style={{ display: "grid", gap: 8 }}>
                <button type="button" onClick={() => { onClose(); navigate("/learn?view=community"); }} style={nextRow}>
                  <Users size={18} color="#3434ff" /><span style={{ flex: 1, textAlign: "left" }}><strong>Share what you learned</strong><br /><span style={{ fontSize: 12.5, color: "#69697b" }}>Post in the community and help others apply it.</span></span><ArrowRight size={16} />
                </button>
                {others.map((c) => (
                  <a key={c.id} href={courseMeta(c.title, c.slug).landing} target="_blank" rel="noopener noreferrer" style={{ ...nextRow, textDecoration: "none", color: "inherit" }}>
                    <Award size={18} color="#8ab815" /><span style={{ flex: 1, textAlign: "left" }}><strong>Continue with {c.title}</strong><br /><span style={{ fontSize: 12.5, color: "#69697b" }}>{money(c) ? `${money(c)} · ` : ""}Learn more</span></span><ArrowRight size={16} />
                  </a>
                ))}
              </div>
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <button type="button" onClick={() => { onClose(); navigate("/learn"); }} style={{ border: 0, background: "none", fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#69697b", cursor: "pointer", textDecoration: "underline" }}>Back to my dashboard</button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const nextRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "#0b0b2c" };
