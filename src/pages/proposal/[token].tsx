import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/integrations/supabase/client";
import { BespokeProposalDocument } from "@/components/proposal/BespokeProposalDocument";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface Proposal {
  id: string;
  organisation: string;
  contact_name?: string;
  intro_note?: string;
  sections: any[];
  valid_until: number;
  token: string;
  created_at: string;
  status: string;
}

export default function ProposalPage() {
  const router = useRouter();
  const { token } = router.query;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchProposal = async () => {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("proposals")
          .select("*")
          .eq("token", token)
          .single();

        if (fetchError) {
          setError("Proposal not found or access denied");
          return;
        }

        if (!data) {
          setError("Proposal not found");
          return;
        }

        // Check if proposal is still valid
        const expiresAt = new Date(data.created_at);
        expiresAt.setDate(expiresAt.getDate() + data.valid_until);

        if (new Date() > expiresAt) {
          setError("This proposal has expired");
          return;
        }

        setProposal(data);
      } catch (err) {
        console.error("Error fetching proposal:", err);
        setError("Failed to load proposal");
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Proposal</h1>
          <Button
            onClick={() => window.print()}
            variant="outline"
          >
            Print / Save as PDF
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <BespokeProposalDocument
            organisation={proposal.organisation}
            contact_name={proposal.contact_name}
            intro_note={proposal.intro_note}
            sections={proposal.sections || []}
            valid_until={String(proposal.valid_until)}
            token={proposal.token}
            created_at={proposal.created_at}
          />
        </div>

        <div className="mt-6 bg-slate-100 rounded-lg p-4 text-sm text-slate-600">
          <p>This proposal is confidential and for the exclusive use of the recipient.</p>
          <p className="mt-2">Valid until {new Date(new Date(proposal.created_at).getTime() + proposal.valid_until * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
