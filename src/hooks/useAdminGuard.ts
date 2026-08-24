import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Shared admin-access check for /admin pages. Redirects to /auth if there's
 * no session, or to / if the session isn't an admin. This is UX only — the
 * real security boundary is Supabase RLS (has_role(auth.uid(),'admin')).
 */
export const useAdminGuard = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roles) {
          toast.error("Access denied. Admin privileges required.");
          navigate("/");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Admin access error:", error);
        navigate("/auth");
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { checking, isAdmin };
};
