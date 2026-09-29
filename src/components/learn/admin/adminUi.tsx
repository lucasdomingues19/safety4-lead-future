import type { CSSProperties, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export const adminFont = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const panel: CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" };
export const primaryBtn: CSSProperties = { border: 0, borderRadius: "8px", background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, padding: "11px 20px", cursor: "pointer" };
export const ghostBtn: CSSProperties = { border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#0b0b2c", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, padding: "10px 18px", cursor: "pointer" };
export const input: CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "11px 13px", fontFamily: "inherit", fontSize: "14px", color: "#0b0b2c", background: "#fff" };

export const Spinner = () => (
  <div style={{ marginTop: 60, display: "flex", justifyContent: "center" }}><Loader2 size={28} className="animate-spin" color="#3434ff" /></div>
);

export const PanelHeader = ({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) => (
  <div style={{ padding: "22px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#0b0b2c" }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "#69697b", marginTop: 4 }}>{sub}</div>}
    </div>
    {right}
  </div>
);

export const Kpi = ({ label, value, sub, tone = "default" }: { label: string; value: ReactNode; sub?: string; tone?: "default" | "good" | "bad" }) => {
  const t = { default: ["#fff", "#e2e8f0", "#94a3b8"], good: ["#f4fbe4", "#d9f09a", "#8ab815"], bad: ["#fff5f5", "#ffd6d6", "#c93636"] }[tone];
  return (
    <div style={{ background: t[0], border: `1px solid ${t[1]}`, borderRadius: 20, padding: 26 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: t[2], textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800, color: "#0b0b2c" }}>{value}</div>
      {sub && <div style={{ marginTop: 8, fontSize: 12, color: t[2] }}>{sub}</div>}
    </div>
  );
};

/** RFC-4180 CSV with spreadsheet-formula neutralisation. */
export function downloadCsv(filename: string, rows: Record<string, string | number | null | undefined>[]) {
  if (rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const cell = (v: string | number | null | undefined) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [cols.map(cell).join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
