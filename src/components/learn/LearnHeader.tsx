import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/safety-academy-logo.png";

interface LearnHeaderProps {
  email?: string | null;
}

export const LearnHeader = ({ email }: LearnHeaderProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/learn/auth");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/learn" className="flex items-center gap-2">
          <img src={logo} alt="Safety 4.0 Academy" className="h-8 w-auto" />
          <span className="hidden items-center gap-1.5 text-sm font-semibold text-white sm:flex">
            <GraduationCap className="h-4 w-4 text-primary" />
            Learning Hub
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden text-sm text-white/70 md:inline">{email}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
};
