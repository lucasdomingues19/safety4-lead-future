// Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF, BOM) and
// writer — enough for Kajabi/Excel exports without a dependency.

export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const src = text.replace(/^\uFEFF/, "");
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { record.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      record.push(field); field = "";
      if (record.some((f) => f.trim() !== "")) records.push(record);
      record = [];
    } else field += c;
  }
  record.push(field);
  if (record.some((f) => f.trim() !== "")) records.push(record);

  const [head = [], ...body] = records;
  const headers = head.map((h, i) => h.trim() || `Column ${i + 1}`);
  const rows = body.map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
  return { headers, rows };
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))].join("\n");
}

export function downloadText(filename: string, text: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
