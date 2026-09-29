// Minimal Stripe REST helpers (form-encoded, as Stripe's API expects).
const STRIPE_API = "https://api.stripe.com/v1";

export function stripeKey(): string {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return key;
}

export async function stripeRequest<T = Record<string, unknown>>(
  method: "GET" | "POST",
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = method === "GET" && params ? `${STRIPE_API}${path}?${new URLSearchParams(params)}` : `${STRIPE_API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" && params ? new URLSearchParams(params) : undefined,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? `Stripe error ${res.status}`);
  return body as T;
}
