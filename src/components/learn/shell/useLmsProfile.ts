import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";

export interface LmsProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  tour_completed_at?: string | null;
  tour_status?: string | null;
  isAdmin: boolean;
  cpdHours: number;
  /** Companies this person manages (owner or manager). */
  managedOrgs: { id: string; name: string; role: string }[];
}

/** Fired by Settings when the name or photo changes. */
export const PROFILE_UPDATED_EVENT = "lms-profile-updated";

// Kept between page changes so the shell doesn't flash empty when moving
// from the dashboard into a course and back.
let cache: LmsProfile | null = null;

/** The signed-in learner as the LMS shell shows them (name, photo, admin, CPD). */
export function useLmsProfile() {
  const { user, loading } = useAuthUser();
  const [profile, setProfile] = useState<LmsProfile | null>(cache && user && cache.id === user.id ? cache : null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const [{ data: p }, { data: role }, { data: orgRows }] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url, tour_completed_at, tour_status").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
        supabase.from("organisation_members").select("organisation_id, role, organisations(name)").eq("user_id", user.id).in("role", ["owner", "manager"]),
      ]);
      const metaName = (user.user_metadata as { full_name?: string } | undefined)?.full_name;
      const base: LmsProfile = {
        id: user.id,
        email: user.email ?? "",
        full_name: p?.full_name || metaName || undefined,
        avatar_url: p?.avatar_url || undefined,
        tour_completed_at: p?.tour_completed_at ?? null,
        tour_status: p?.tour_status ?? null,
        isAdmin: role?.role === "admin",
        cpdHours: cache?.id === user.id ? cache.cpdHours : 0,
        managedOrgs: (orgRows ?? []).map((o) => ({ id: o.organisation_id, name: (o.organisations as { name?: string } | null)?.name ?? "Your company", role: o.role })),
      };
      if (cancelled) return;
      cache = base;
      setProfile(base);

      const [{ data: certs }, { data: cpdCourses }] = await Promise.all([
        supabase.from("certificates").select("course_name").eq("recipient_email", (user.email ?? "").toLowerCase()),
        supabase.from("courses").select("title, cpd_hours"),
      ]);
      const byTitle = new Map((cpdCourses ?? []).map((c) => [c.title, Number(c.cpd_hours ?? 0)]));
      const cpdHours = Math.round((certs ?? []).reduce((s, c) => s + (byTitle.get(c.course_name) ?? 0), 0) * 10) / 10;
      if (cancelled) return;
      cache = { ...base, cpdHours };
      setProfile(cache);
    };
    load().catch((e) => console.error("LMS profile load failed", e));
    const onUpdated = () => { load().catch(() => undefined); };
    window.addEventListener(PROFILE_UPDATED_EVENT, onUpdated);
    return () => { cancelled = true; window.removeEventListener(PROFILE_UPDATED_EVENT, onUpdated); };
  }, [user]);

  return { authUser: user, authLoading: loading, profile };
}
