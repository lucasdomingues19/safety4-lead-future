import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { GovernanceReadinessPopup } from "@/components/GovernanceReadinessPopup";
import { CONSENT_SAVED, readConsent } from "@/lib/consent";

const EXCLUDED = ["/admin", "/learn", "/auth", "/governance-readiness", "/scorecard", "/enrol"];

/** Shows the 30s AI Governance Readiness lead magnet on public marketing pages
 *  only — and not until the visitor has answered the cookie banner, so the two
 *  never compete for the same first moment. */
const GovernanceReadinessGate = () => {
  const { pathname } = useLocation();
  const [consentAnswered, setConsentAnswered] = useState(() => !!readConsent());
  useEffect(() => {
    const done = () => setConsentAnswered(true);
    window.addEventListener(CONSENT_SAVED, done);
    return () => window.removeEventListener(CONSENT_SAVED, done);
  }, []);
  if (EXCLUDED.some((p) => pathname.startsWith(p))) return null;
  if (!consentAnswered) return null;
  return <GovernanceReadinessPopup />;
};

export default GovernanceReadinessGate;
