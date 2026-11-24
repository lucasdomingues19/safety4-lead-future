// Adds an opted-in person to Kit through the public "Website opt-in" form (no API key needed).
const KIT_FORM_URL = "https://app.kit.com/forms/10232126/subscriptions";

export async function addToKit(email: string, name: string) {
  try {
    const first = name.trim().split(/\s+/)[0] ?? "";
    const body = new URLSearchParams({ email_address: email, "fields[first_name]": first });
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 5000);
    const res = await fetch(KIT_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
      signal: ctl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) console.error("[kit] sign-up failed:", res.status, (await res.text()).slice(0, 200));
  } catch (e) {
    console.error("[kit] sign-up error:", e instanceof Error ? e.message : e);
  }
}
