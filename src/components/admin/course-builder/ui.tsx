import { useRef, useState, type ReactNode } from "react";
import { Check, CloudOff, Loader2, UploadCloud } from "lucide-react";
import type { SaveStatus } from "./useSaver";

// Small presentational pieces shared by the builder panels.

export const Section = ({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) => (
  <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 md:p-6">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[15px] font-bold text-[#0b0b2c]">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] leading-relaxed text-[#69697b]">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const FieldLabel = ({ children, hint }: { children: ReactNode; hint?: string }) => (
  <label className="mb-1.5 block text-[13px] font-semibold text-[#0b0b2c]">
    {children}
    {hint && <span className="ml-1.5 font-normal text-[#94a3b8]">{hint}</span>}
  </label>
);

export const inputClass =
  "w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2.5 text-sm text-[#0b0b2c] outline-none transition placeholder:text-[#94a3b8] focus:border-[#3434ff] focus:ring-4 focus:ring-[#3434ff]/10";

export const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-start gap-3 rounded-xl border border-[#e2e8f0] p-3.5 text-left transition hover:border-[#c7cdf9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3434ff]/15"
  >
    <span className={`relative mt-0.5 inline-flex h-[22px] w-[40px] shrink-0 rounded-full transition ${checked ? "bg-[#3434ff]" : "bg-[#cbd5e1]"}`}>
      <span className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[21px]" : "left-[3px]"}`} />
    </span>
    <span>
      <span className="block text-sm font-semibold text-[#0b0b2c]">{label}</span>
      {description && <span className="mt-0.5 block text-[13px] leading-relaxed text-[#69697b]">{description}</span>}
    </span>
  </button>
);

export const SaveIndicator = ({ status }: { status: SaveStatus }) => {
  if (status === "error")
    return <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-600"><CloudOff className="h-4 w-4" /> Couldn't save — check your connection</span>;
  if (status === "saving" || status === "pending")
    return <span className="inline-flex items-center gap-1.5 text-[13px] text-[#69697b]"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</span>;
  return <span className="inline-flex items-center gap-1.5 text-[13px] text-[#69697b]"><Check className="h-4 w-4 text-[#16a34a]" /> All changes saved</span>;
};

/** Click-or-drop file target. */
export const Dropzone = ({
  accept,
  onFile,
  disabled,
  title,
  hint,
  compact,
}: {
  accept: string;
  onFile: (file: File) => void;
  disabled?: boolean;
  title: string;
  hint?: string;
  compact?: boolean;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !disabled) input.current?.click(); }}
      onDragOver={(e) => { if (disabled || !e.dataTransfer.types.includes("Files")) return; e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setOver(false);
        if (!disabled) onFile(e.dataTransfer.files[0]);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3434ff]/15 ${
        compact ? "gap-1 px-4 py-4" : "gap-2 px-6 py-10"
      } ${over ? "border-[#3434ff] bg-[#f1f4ff]" : "border-[#cfd6e4] bg-[#fafbff] hover:border-[#3434ff] hover:bg-[#f5f7ff]"} ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <UploadCloud className={`${compact ? "h-5 w-5" : "h-8 w-8"} text-[#3434ff]`} />
      <span className="text-sm font-semibold text-[#0b0b2c]">{title}</span>
      {hint && <span className="text-xs text-[#69697b]">{hint}</span>}
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
      />
    </div>
  );
};

export const ProgressBar = ({ label, percent }: { label: string; percent: number }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs text-[#69697b]"><span className="truncate pr-4">{label}</span><span className="font-semibold tabular-nums">{percent}%</span></div>
    <div className="h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]"><div className="h-full rounded-full bg-[#3434ff] transition-all" style={{ width: `${percent}%` }} /></div>
  </div>
);
