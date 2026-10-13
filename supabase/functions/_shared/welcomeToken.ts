// Our own long-lived sign-in token for welcome emails. Only the SHA-256 hash is stored.
// The raw token travels in the email link and is swapped for a fresh one-time Supabase sign-in
// (by the welcome-link function) when the person presses the button.

export const WELCOME_TOKEN_DAYS = 14;
export const WELCOME_TOKEN_MAX_USES = 5;

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// deno-lint-ignore no-explicit-any
export async function createWelcomeToken(db: any, userId: string, days = WELCOME_TOKEN_DAYS): Promise<string> {
  const token = randomToken();
  const { error } = await db.from("welcome_tokens").insert({
    user_id: userId,
    token_hash: await sha256Hex(token),
    expires_at: new Date(Date.now() + days * 86_400_000).toISOString(),
  });
  if (error) throw new Error(`Could not create sign-in token: ${error.message}`);
  return token;
}
