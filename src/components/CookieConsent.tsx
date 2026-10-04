import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { OPEN_COOKIE_SETTINGS, readConsent, saveConsent } from "@/lib/consent";

/** Cookie banner for the public website. Nothing non-essential runs until the
 *  visitor chooses; "Reject all" is as prominent as "Accept all". */
export const CookieConsent = () => {
  const [open, setOpen] = useState(() => !readConsent());
  const [customise, setCustomise] = useState(false);
  const [analytics, setAnalytics] = useState(() => readConsent()?.analytics ?? false);
  const [marketing, setMarketing] = useState(() => readConsent()?.marketing ?? false);

  useEffect(() => {
    const reopen = () => {
      const c = readConsent();
      setAnalytics(c?.analytics ?? false);
      setMarketing(c?.marketing ?? false);
      setCustomise(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
  }, []);

  if (!open) return null;

  const choose = (choice: { analytics: boolean; marketing: boolean }) => {
    saveConsent(choice);
    setOpen(false);
    setCustomise(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="print:hidden fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 text-slate-700 shadow-2xl sm:inset-x-auto sm:left-6 sm:bottom-6"
    >
      <p className="text-base font-semibold text-[#0b0b2c]">Your privacy choices</p>
      <p className="mt-1.5 text-sm leading-relaxed">
        We use essential cookies to run this site. With your permission we'd also use analytics cookies to understand
        how the site is used, and marketing cookies (LinkedIn, Meta, Google, OpenAI) to measure our ads. See our{" "}
        <Link to="/cookies-policy" className="font-medium text-[#3434ff] underline underline-offset-2">
          Cookies Policy
        </Link>
        .
      </p>

      {customise && (
        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
          <Row title="Essential" desc="Sign-in, security and your cookie choice. Always on." checked disabled />
          <Row title="Analytics" desc="Anonymous usage statistics (Google Analytics and our own page counts)." checked={analytics} onChange={setAnalytics} />
          <Row title="Marketing" desc="Ad measurement and retargeting on LinkedIn, Meta, Google and OpenAI." checked={marketing} onChange={setMarketing} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => choose({ analytics: false, marketing: false })} variant="outline" className="flex-1 border-slate-300 bg-white text-[#0b0b2c] hover:bg-slate-50 hover:text-[#0b0b2c] sm:flex-none">
          Reject all
        </Button>
        <Button onClick={() => choose({ analytics: true, marketing: true })} className="flex-1 bg-[#3434ff] hover:bg-[#2c23d2] sm:flex-none">
          Accept all
        </Button>
        {customise ? (
          <Button onClick={() => choose({ analytics, marketing })} variant="ghost" className="w-full text-[#0b0b2c] hover:bg-slate-100 hover:text-[#0b0b2c] sm:w-auto">
            Save choices
          </Button>
        ) : (
          <Button onClick={() => setCustomise(true)} variant="ghost" className="w-full text-[#0b0b2c] hover:bg-slate-100 hover:text-[#0b0b2c] sm:w-auto">
            Customise
          </Button>
        )}
      </div>
    </div>
  );
};

function Row({ title, desc, checked, onChange, disabled }: {
  title: string; desc: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean;
}) {
  const id = `consent-${title.toLowerCase()}`;
  return (
    <div className="flex items-start justify-between gap-4 p-3">
      <label htmlFor={id} className="min-w-0">
        <span className="block text-sm font-semibold text-[#0b0b2c]">{title}</span>
        <span className="block text-xs leading-relaxed text-slate-500">{desc}</span>
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={title}
        className="shrink-0 data-[state=checked]:bg-[#3434ff] data-[state=unchecked]:bg-slate-300 [&>span]:bg-white"
      />
    </div>
  );
}

export default CookieConsent;
