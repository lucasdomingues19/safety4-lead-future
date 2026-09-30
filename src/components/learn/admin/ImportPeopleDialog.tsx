import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileUp, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseCsv, toCsv, downloadText } from "@/lib/csv";

// Import people from a CSV (e.g. Kajabi's People export): map columns, map
// the export's product names to LMS products, preview, then create accounts
// and grant access in batches through the admin-people function.

export interface Product { key: string; title: string }
type Step = "upload" | "map" | "review" | "running" | "done";
interface Result { email: string; status: "created" | "updated" | "error"; welcomed?: boolean; error?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BATCH = 25;
const WELCOME_DAILY_LIMIT = 100;

const pick = (headers: string[], ...patterns: RegExp[]) => headers.find((h) => patterns.some((p) => p.test(h))) ?? "";
const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2));
const bestProduct = (name: string, products: Product[]) => {
  const w = words(name);
  let best: { key: string; score: number } | null = null;
  for (const p of products) {
    const pw = words(p.title);
    const overlap = [...w].filter((x) => pw.has(x)).length / Math.max(1, Math.min(w.size, pw.size));
    if (!best || overlap > best.score) best = { key: p.key, score: overlap };
  }
  return best && best.score >= 0.5 ? best.key : "";
};

export function ImportPeopleDialog({ products, existingEmails, onClose, onDone }: { products: Product[]; existingEmails: Set<string>; onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [col, setCol] = useState({ email: "", first: "", last: "", full: "", company: "", products: "" });
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [grantAll, setGrantAll] = useState<Set<string>>(new Set());
  const [welcome, setWelcome] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const readFile = async (file: File) => {
    setParseError(null);
    try {
      const { headers: h, rows: r } = parseCsv(await file.text());
      if (!r.length) { setParseError("That file has no rows."); return; }
      const email = pick(h, /e-?mail/i);
      if (!email) { setParseError("Couldn't find an email column. Make sure the file has a header row with 'Email'."); }
      setFileName(file.name);
      setHeaders(h);
      setRows(r);
      setCol({
        email,
        first: pick(h, /^first/i, /first ?name/i, /given/i),
        last: pick(h, /^last/i, /last ?name/i, /surname/i, /family/i),
        full: pick(h, /^name$/i, /full ?name/i),
        company: pick(h, /company/i, /organi[sz]ation/i, /employer/i),
        products: pick(h, /products?/i, /offers?/i, /courses?/i),
      });
      setStep("map");
    } catch {
      setParseError("Couldn't read that file. Export it as CSV and try again.");
    }
  };

  // Distinct product names in the export, split on ; | or comma.
  const exportProducts = useMemo(() => {
    if (!col.products) return [] as string[];
    const all = new Set<string>();
    rows.forEach((r) => (r[col.products] ?? "").split(/\s*[;|]\s*|\s*,\s*(?=[A-Z0-9])/).map((s) => s.trim()).filter(Boolean).forEach((p) => all.add(p)));
    return [...all].sort();
  }, [rows, col.products]);

  const goReview = () => {
    const auto: Record<string, string> = {};
    exportProducts.forEach((p) => { auto[p] = productMap[p] ?? bestProduct(p, products); });
    setProductMap(auto);
    setStep("review");
  };

  const prepared = useMemo(() => rows.map((r) => {
    const email = (r[col.email] ?? "").trim().toLowerCase();
    let first = col.first ? r[col.first] : "";
    let last = col.last ? r[col.last] : "";
    if (!first && !last && col.full) {
      const parts = (r[col.full] ?? "").trim().split(/\s+/);
      first = parts.shift() ?? "";
      last = parts.join(" ");
    }
    const fromExport = col.products
      ? (r[col.products] ?? "").split(/\s*[;|]\s*|\s*,\s*(?=[A-Z0-9])/).map((s) => productMap[s.trim()]).filter(Boolean)
      : [];
    return { email, first_name: first, last_name: last, company: col.company ? r[col.company] : "", products: [...new Set([...fromExport, ...grantAll])], valid: EMAIL_RE.test(email) };
  }), [rows, col, productMap, grantAll]);

  const valid = prepared.filter((p) => p.valid);
  const invalid = prepared.length - valid.length;
  const newPeople = valid.filter((p) => !existingEmails.has(p.email)).length;
  const withAccess = valid.filter((p) => p.products.length).length;

  const run = async () => {
    setStep("running");
    const all: Result[] = [];
    for (let i = 0; i < valid.length; i += BATCH) {
      const chunk = valid.slice(i, i + BATCH).map(({ valid: _v, ...rest }) => rest);
      const sendWelcome = welcome && i < WELCOME_DAILY_LIMIT;
      const { data, error } = await supabase.functions.invoke("admin-people", { body: { action: "import", rows: chunk, welcome: sendWelcome } });
      if (error || data?.error) chunk.forEach((c) => all.push({ email: c.email, status: "error", error: data?.error ?? error?.message ?? "Request failed" }));
      else all.push(...(data.results as Result[]));
      setProgress(Math.min(100, Math.round(((i + chunk.length) / valid.length) * 100)));
      setResults([...all]);
    }
    setStep("done");
    onDone();
  };

  const selectCls = "w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0b0b2c]";
  const created = results.filter((r) => r.status === "created").length;
  const updated = results.filter((r) => r.status === "updated").length;
  const failed = results.filter((r) => r.status === "error" || r.error);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0b0b2c]/50 p-4 md:p-10" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl rounded-3xl bg-white font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eef1f6] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">Import people</h2>
            <p className="text-[13px] text-[#69697b]">From Kajabi (People → Export) or any CSV with an email column.</p>
          </div>
          {step !== "running" && <button onClick={onClose} className="rounded-full p-2 text-[#94a3b8] hover:bg-[#f5f7fa]" aria-label="Close"><X size={18} /></button>}
        </div>

        <div className="px-6 py-6">
          {step === "upload" && (
            <>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) readFile(f); }}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#cfd6e4] bg-[#fafbff] px-6 py-12 text-center hover:border-[#3434ff]"
              >
                <FileUp className="h-9 w-9 text-[#3434ff]" />
                <span className="font-semibold">Drop your CSV here — or click to choose it</span>
                <span className="text-xs text-[#69697b]">In Kajabi: Contacts → People → Export. Existing people are updated, never duplicated.</span>
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
              </label>
              {parseError && <p className="mt-3 flex items-center gap-2 text-sm text-red-600"><AlertTriangle size={16} /> {parseError}</p>}
            </>
          )}

          {step === "map" && (
            <div className="space-y-5">
              <p className="text-sm text-[#69697b]"><strong className="text-[#0b0b2c]">{fileName}</strong> · {rows.length} rows. Check which columns hold what — we've guessed.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ["email", "Email (required)"], ["full", "Full name"], ["first", "First name"], ["last", "Last name"], ["company", "Company name"], ["products", "Products / offers they own"],
                ] as const).map(([k, label]) => (
                  <label key={k} className="block">
                    <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
                    <select value={col[k]} onChange={(e) => setCol({ ...col, [k]: e.target.value })} className={selectCls}>
                      <option value="">— not in this file —</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              {rows[0] && col.email && (
                <p className="rounded-xl bg-[#f7f8fc] p-3 text-[13px] text-[#69697b]">First row: <strong className="text-[#0b0b2c]">{rows[0][col.email]}</strong>{col.full && ` · ${rows[0][col.full]}`}{col.first && ` · ${rows[0][col.first]} ${col.last ? rows[0][col.last] : ""}`}{col.products && rows[0][col.products] && ` · ${rows[0][col.products]}`}</p>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => setStep("upload")} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#69697b] hover:bg-[#f5f7fa]">Back</button>
                <button onClick={goReview} disabled={!col.email} className="rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6] disabled:opacity-40">Next</button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              {exportProducts.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold">Match your Kajabi products</h3>
                  <p className="mt-0.5 text-[13px] text-[#69697b]">People get access to whatever each product is matched to. Leave “Don't grant” for things that aren't in the LMS.</p>
                  <div className="mt-3 divide-y divide-[#f1f4f8] rounded-xl border border-[#e2e8f0]">
                    {exportProducts.map((p) => (
                      <div key={p} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                        <span className="min-w-0 flex-1 text-sm font-medium">{p} <span className="text-xs text-[#94a3b8]">· {rows.filter((r) => (r[col.products] ?? "").includes(p)).length} people</span></span>
                        <select value={productMap[p] ?? ""} onChange={(e) => setProductMap({ ...productMap, [p]: e.target.value })} className="w-full rounded-lg border border-[#e2e8f0] px-2 py-1.5 text-sm sm:w-64">
                          <option value="">Don't grant anything</option>
                          {products.map((x) => <option key={x.key} value={x.key}>{x.title}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold">{exportProducts.length ? "Also give everyone in this file…" : "Give everyone in this file access to…"}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {products.map((p) => {
                    const on = grantAll.has(p.key);
                    return (
                      <button key={p.key} onClick={() => { const n = new Set(grantAll); if (on) n.delete(p.key); else n.add(p.key); setGrantAll(n); }} className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold ${on ? "border-[#3434ff] bg-[#f1f4ff] text-[#3434ff]" : "border-[#e2e8f0] text-[#69697b] hover:border-[#c7cdf9]"}`}>
                        {on ? "✓ " : ""}{p.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["People", valid.length], ["New accounts", newPeople], ["Already here", valid.length - newPeople], ["Getting access", withAccess],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-2xl bg-[#f7f8fc] p-4"><div className="text-2xl font-extrabold tabular-nums">{v}</div><div className="text-xs font-semibold text-[#69697b]">{l}</div></div>
                ))}
              </div>
              {invalid > 0 && <p className="flex items-center gap-2 text-[13px] text-amber-700"><AlertTriangle size={15} /> {invalid} row{invalid === 1 ? "" : "s"} without a valid email will be skipped.</p>}

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e2e8f0] p-4">
                <input type="checkbox" checked={welcome} onChange={(e) => setWelcome(e.target.checked)} className="mt-1 accent-[#3434ff]" />
                <span>
                  <span className="block text-sm font-semibold">Email everyone a welcome link to set their password</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-[#69697b]">
                    Leave this off to import quietly and invite people later from the People list (filter “Not invited yet”).
                    {valid.length > WELCOME_DAILY_LIMIT && <> Your email plan sends {WELCOME_DAILY_LIMIT} a day, so only the first {WELCOME_DAILY_LIMIT} are emailed now — send the rest over the next days.</>}
                  </span>
                </span>
              </label>

              <div className="flex justify-end gap-2">
                <button onClick={() => setStep("map")} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#69697b] hover:bg-[#f5f7fa]">Back</button>
                <button onClick={run} disabled={!valid.length} className="rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6] disabled:opacity-40">Import {valid.length} people</button>
              </div>
            </div>
          )}

          {(step === "running" || step === "done") && (
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-sm font-semibold"><span>{step === "running" ? "Importing…" : "Import finished"}</span><span className="tabular-nums">{progress}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[#eef1f6]"><div className="h-full rounded-full bg-[#3434ff] transition-all" style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#f4fbe4] p-4"><div className="text-2xl font-extrabold">{created}</div><div className="text-xs font-semibold text-[#4a5230]">new accounts</div></div>
                <div className="rounded-2xl bg-[#f1f4ff] p-4"><div className="text-2xl font-extrabold">{updated}</div><div className="text-xs font-semibold text-[#3434ff]">existing updated</div></div>
                <div className={`rounded-2xl p-4 ${failed.length ? "bg-[#fff1f2]" : "bg-[#f7f8fc]"}`}><div className="text-2xl font-extrabold">{failed.length}</div><div className="text-xs font-semibold text-[#69697b]">problems</div></div>
              </div>
              {step === "done" && (
                <>
                  {failed.length > 0 ? (
                    <div className="rounded-2xl border border-[#fecdd3] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">Rows that need a look</span>
                        <button onClick={() => downloadText(`import-problems-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(failed.map((f) => ({ Email: f.email, Problem: f.error ?? "" }))))} className="text-[13px] font-semibold text-[#3434ff] hover:underline">Download list</button>
                      </div>
                      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-[13px] text-[#69697b]">{failed.slice(0, 50).map((f) => <li key={f.email}><strong className="text-[#0b0b2c]">{f.email || "(blank)"}</strong> — {f.error}</li>)}</ul>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#16a34a]"><CheckCircle2 size={18} /> Everyone imported without problems.</p>
                  )}
                  <div className="flex justify-end"><button onClick={onClose} className="rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6]">Done</button></div>
                </>
              )}
              {step === "running" && <p className="flex items-center gap-2 text-[13px] text-[#69697b]"><Loader2 size={14} className="animate-spin" /> Keep this window open until it finishes.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
