// Signed one-click unsubscribe links for marketing email (works for any address,
// with or without a course account). Token = HMAC-SHA256(lowercased email).
const FN_URL = "https://yiqnwhxnbbtoxhysgteh.supabase.co/functions/v1/marketing-unsubscribe";

async function hmac(email: string): Promise<string> {
  const secret = Deno.env.get("MARKETING_UNSUB_SECRET");
  if (!secret) throw new Error("MARKETING_UNSUB_SECRET is not configured");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(email.trim().toLowerCase()));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export async function marketingUnsubLink(email: string): Promise<string> {
  const e = email.trim().toLowerCase();
  return `${FN_URL}?e=${encodeURIComponent(e)}&t=${await hmac(e)}`;
}

export async function verifyMarketingUnsub(email: string, token: string): Promise<boolean> {
  if (!email || !token) return false;
  const expected = await hmac(email);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

/** Headers so mail apps show their own one-click "Unsubscribe" button. */
export async function marketingUnsubHeaders(email: string): Promise<Record<string, string>> {
  return { "List-Unsubscribe": `<${await marketingUnsubLink(email)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" };
}
