// Unticked-by-default newsletter consent (UK GDPR / PECR). Ticking it adds the
// person to the SafetyTech Academy newsletter; the lead is saved either way.
export const MarketingConsent = ({
  checked,
  onChange,
  id = "marketing-consent",
  tone = "light",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
  tone?: "light" | "dark";
}) => (
  <label htmlFor={id} className={`flex items-start gap-3 text-sm cursor-pointer text-left ${tone === "dark" ? "text-white/80" : "text-slate-600"}`}>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
    />
    <span>
      Send me practical AI-in-EHS tips and course news by email. You can unsubscribe at any time.
    </span>
  </label>
);
