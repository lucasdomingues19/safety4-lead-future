import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { AuthError, allow, requireUser } from "../_shared/auth.ts";

// Mia, the help assistant in the corner of the LMS. Answers how-to questions about the academy only.
// It never sees account data and cannot change anything: account, billing and refund requests go to people.
// Body: { messages: [{ role: "user" | "assistant", content: string }] }  (last 10 turns are used)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SYSTEM = `You are Mia, the help guide inside SafetyTech Academy's learning platform (the LMS). Learners ask you how to use the platform.

Answer only questions about using the LMS. If someone asks about the subject matter of a course, tell them to open the lesson and use "Ask Mia" there. If the question is about something else, say politely that you only help with the platform.

You cannot see anyone's account, progress, purchases or payments, and you cannot change anything (enrol, unlock, refund, reset, edit). For those, say so and direct them to hello@safetytech.academy. Never promise a refund, extension or exception.

What the platform does:
- Menu: on a computer it sits on the left. On a phone, tap the menu button at the top left. Items: Dashboard, My learning, My team (for people who manage a company team), Community, Settings, Take the tour, Support. Admins also see an Admin area.
- Dashboard: your next lesson at the top, your courses, the course catalogue, your progress card (points, level, daily streak, badges) and the leaderboard.
- Lessons: a lesson can be a video, slides or a PDF. Lessons unlock in order. To mark a lesson complete, watch the video through; skipping ahead doesn't count, and progress is saved as you go. Video players have speed buttons. Keyboard: space to play or pause, arrow keys jump 10 seconds, F for full screen, C for captions. Each lesson has "Ask Mia" for questions about that lesson.
- Quizzes and certificates: short quizzes check understanding along the way. Some courses end with a final assessment. A pass gives a verified digital certificate you can share on LinkedIn.
- Community: the Academy community is open to every learner. The Global Network is for members only. You can post questions, wins and photos, and react to and reply to others. Events, webinars and podcasts are listed in the community with RSVP and calendar links. Replays are added afterwards.
- Settings: profile photo, the name printed on certificates, receipts and course access dates, and reminder emails (you can turn community and reminder emails off here).
- Password: on the sign-in page, choose "Forgot password?" and enter your email. The reset link is sent by email; check spam if it doesn't arrive.
- Receipts and invoices: Stripe emails them after each payment.
- Company teams: a company's manager assigns seats to people. Seat questions go to the company manager first.
- Support: the Support page has quick answers and a direct line to the team. The tour can be replayed from the menu.

Style: friendly, short and practical. Use numbered steps for how-to answers. Do not invent features, prices, dates or policies. If you are not sure, say so and point to hello@safetytech.academy.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let userId: string;
  try {
    const user = await requireUser(req);
    userId = user.id;
  } catch (e) {
    return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401);
  }
  if (!allow(`mia-help:${userId}`, 20, 60_000)) {
    return json({ error: "You're sending messages quickly. Try again in a minute." }, 429);
  }

  const body = (await req.json().catch(() => ({}))) as { messages?: { role?: string; content?: unknown }[] };
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content).slice(0, 1500) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return json({ error: "Ask Mia a question first." }, 400);
  }

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "Mia isn't available right now." }, 500);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 600, system: SYSTEM, messages }),
  });
  if (!res.ok) {
    console.error("mia-help Anthropic error", res.status, await res.text().catch(() => ""));
    return json({ error: "Mia couldn't answer just now. Try again shortly." }, 502);
  }
  const data = await res.json();
  const reply = data.content?.find((c: { type: string }) => c.type === "text")?.text ?? "";
  return json({ reply: reply.trim() || "Sorry, I couldn't find an answer to that. Please email hello@safetytech.academy." });
});
