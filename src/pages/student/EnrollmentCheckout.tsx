import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock, Loader2, Shield, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_cents: number | null;
  currency: string;
  cpd_hours: number | null;
}

const formatPrice = (cents: number | null, currency: string) =>
  !cents ? "Free" : new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(cents / 100);

const EnrollmentCheckout = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const cancelled = params.get("cancelled");

  const [course, setCourse] = useState<Course | null>(null);
  const [counts, setCounts] = useState({ modules: 0, lessons: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const guest = params.get("guest") === "1";
  const [guestDone, setGuestDone] = useState(false);
  const [confirming, setConfirming] = useState(!!sessionId && !guest);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const confirmedOnce = useRef(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("courses").select("id, title, slug, description, price_cents, currency, cpd_hours").eq("id", id).maybeSingle();
      setCourse(data as Course | null);
      if (data) {
        const { data: mods } = await supabase.from("modules").select("id").eq("course_id", data.id);
        const ids = (mods ?? []).map((m) => m.id);
        const { count } = ids.length ? await supabase.from("lessons").select("id", { count: "exact", head: true }).in("module_id", ids) : { count: 0 };
        setCounts({ modules: ids.length, lessons: count ?? 0 });
      }
      setLoading(false);
    })();
  }, [id]);

  // Returning from Stripe: confirm the payment server-side, then send them into the course.
  // A guest who paid has no session to confirm yet: their account is created by the payment webhook.
  useEffect(() => {
    if (guest && sessionId) { setGuestDone(true); setConfirming(false); }
  }, [guest, sessionId]);

  useEffect(() => {
    if (!sessionId || guest || confirmedOnce.current) return;
    confirmedOnce.current = true;
    let attempts = 0;
    const confirm = async () => {
      attempts += 1;
      const { data, error } = await supabase.functions.invoke("confirm-course-checkout", { body: { session_id: sessionId } });
      if (error || data?.error) {
        setConfirmError(data?.error ?? "We couldn't confirm your payment.");
        setConfirming(false);
        return;
      }
      if (data.status === "pending" && attempts < 6) {
        setTimeout(confirm, 2500);
        return;
      }
      if (data.status === "enrolled") {
        if (window.oaiq) window.oaiq("measure", "purchase_completed", { type: "customer_action" });
        toast.success("Payment confirmed — welcome to the course!");
        navigate(`/learn/${data.slug}`, { replace: true });
        return;
      }
      setConfirmError("Your payment is still processing. You'll get access as soon as it clears — check your dashboard in a few minutes.");
      setConfirming(false);
    };
    confirm();
  }, [sessionId, navigate]);

  useEffect(() => {
    if (cancelled) toast.info("Checkout cancelled — you haven't been charged.");
  }, [cancelled]);

  const startCheckout = async () => {
    if (!course) return;
    setProcessing(true);
    const { data, error } = await supabase.functions.invoke("create-course-checkout", { body: { course_id: course.id } });
    if (error || data?.error) {
      toast.error(data?.error ?? "Could not start checkout");
      setProcessing(false);
      return;
    }
    if (data.alreadyEnrolled) {
      toast.success("You already have access to this course");
      navigate(`/learn/${data.slug}`);
      return;
    }
    window.location.href = data.url;
  };

  if (guestDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-4 text-[#0b0b2c]">
        <div className="max-w-lg rounded-[20px] border border-slate-200 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-2xl font-extrabold">Payment confirmed</h1>
          <p className="mt-3 leading-relaxed text-[#69697b]">
            Thank you. Check your inbox for an email with a link to set your password. Your course{course ? ` (${course.title})` : ""} is waiting for you.
          </p>
          <p className="mt-3 text-sm text-[#69697b]">Didn't get it after a few minutes? Check your spam folder, or write to hello@safetytech.academy.</p>
          <Link to="/learn/auth" className="mt-6 inline-block font-semibold text-primary">Already have a password? Sign in</Link>
        </div>
      </div>
    );
  }

  if (loading || confirming) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f7fa] text-[#0b0b2c]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {confirming && <p className="text-sm text-[#69697b]">Confirming your payment…</p>}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f7fa] text-[#0b0b2c]">
        <p>This course isn't available.</p>
        <Link to="/learn" className="font-semibold text-primary">Back to your dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] px-4 py-10 text-[#0b0b2c]">
      <div className="mx-auto max-w-3xl">
        <Link to="/learn" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#69697b] hover:text-[#0b0b2c]">
          <ArrowLeft className="h-4 w-4" /> Back to your dashboard
        </Link>

        {confirmError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {confirmError} If you were charged and don't see the course, email hello@safetytech.academy.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="rounded-[20px] border border-slate-200 bg-white p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-[#0b0b2c]">{course.title}</h1>
            {course.description && <p className="mt-3 leading-relaxed text-[#69697b]">{course.description}</p>}
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> {counts.modules} modules · {counts.lessons} lessons</li>
              {course.cpd_hours ? <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> {course.cpd_hours} CPD hours</li> : null}
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Verified certificate on completion</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Community access and instructor Q&amp;A</li>
            </ul>
          </div>

          <div className="h-fit rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-[#69697b]">One-time payment</div>
            <div className="mt-1 text-3xl font-extrabold">{formatPrice(course.price_cents, course.currency)}</div>
            <button
              onClick={startCheckout}
              disabled={processing}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {processing ? "Redirecting…" : "Pay securely"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#94a3b8]">
              <Shield className="h-3.5 w-3.5" /> Secure checkout by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentCheckout;
