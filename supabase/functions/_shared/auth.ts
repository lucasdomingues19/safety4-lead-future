// Caller checks for edge functions. verify_jwt only proves a JWT is valid —
// the public anon key passes it — so functions that cost money, send email or
// touch admin data must check the actual user here.
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

const admin = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

/** The signed-in user behind the request (not the anon key), or throw 401. */
export async function requireUser(req: Request) {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) throw new AuthError("Sign in required", 401);
  const { data } = await admin().auth.getUser(token);
  if (!data?.user) throw new AuthError("Sign in required", 401);
  return data.user;
}

/** A signed-in admin, or throw 401/403. */
export async function requireAdmin(req: Request) {
  const user = await requireUser(req);
  const { data: role } = await admin().from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  if (!role) throw new AuthError("Admins only", 403);
  return user;
}

/** Per-key fixed-window limit (per function instance; enough to blunt abuse). */
const buckets = new Map<string, { n: number; reset: number }>();
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) { buckets.set(key, { n: 1, reset: now + windowMs }); return true; }
  if (b.n >= max) return false;
  b.n++;
  return true;
}

export const clientIp = (req: Request) => (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
