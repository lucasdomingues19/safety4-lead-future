import { useLocation } from "react-router-dom";
import { GovernanceReadinessPopup } from "@/components/GovernanceReadinessPopup";

const EXCLUDED = ["/admin", "/learn", "/auth", "/governance-readiness", "/scorecard", "/enrol"];

/** Shows the 30s AI Governance Readiness lead magnet on public marketing pages only. */
const GovernanceReadinessGate = () => {
  const { pathname } = useLocation();
  if (EXCLUDED.some((p) => pathname.startsWith(p))) return null;
  return <GovernanceReadinessPopup />;
};

export default GovernanceReadinessGate;
