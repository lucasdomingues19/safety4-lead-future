// Call an edge function and surface the server's own error message.
// supabase.functions.invoke hides the JSON body on non-2xx responses behind a
// generic "Edge Function returned a non-2xx status code".
import { supabase } from "@/integrations/supabase/client";

export async function invokeFunction<T = Record<string, unknown>>(name: string, body?: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, body === undefined ? undefined : { body });
  if (data && typeof data === "object" && "error" in data && (data as { error?: unknown }).error) {
    throw new Error(String((data as { error: unknown }).error));
  }
  if (error) {
    const ctx = (error as { context?: Response }).context;
    const msg = ctx ? await ctx.clone().json().then((j) => j?.error ?? j?.message).catch(() => null) : null;
    throw new Error(msg || error.message);
  }
  return data as T;
}
