import jsPDF from "jspdf";

interface ROIData {
  name: string;
  team: number;
  sal: number;
  manHrs: number;
  tri: number;
  fatal: number;
  timeSav: number;
  annHrs: number;
  injSav: number;
  fatSav: number;
  safetySav: number;
  annualSav: number;
  cost: number;
  y1: number;
  y2: number;
  y3: number;
  cum: number;
  roi1: number;
  roi3: number;
  payback: number;
  safetyToggle: boolean;
  triAv: number;
  fatAv: number;
  hourly: number;
}

function money(n: number): string {
  const a = Math.abs(n), s = n < 0 ? "-" : "";
  if (a >= 1000000) return s + "$" + (a / 1000000).toFixed(2) + "M";
  if (a >= 1000) return s + "$" + Math.round(a / 1000).toLocaleString() + "k";
  return s + "$" + Math.round(a).toLocaleString();
}

// Brand colours
const NAVY = [17, 17, 58] as const;       // #11113a
const LIME = [193, 255, 114] as const;     // #c1ff72
const PINK = [255, 102, 196] as const;     // #ff66c4
const WHITE = [255, 255, 255] as const;
const GREY = [140, 140, 180] as const;
const DARK = [8, 8, 30] as const;

export function generateROIReport(d: ROIData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 0;

  // --- HEADER BAR ---
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 44, "F");

  // Lime accent line at top
  doc.setFillColor(...LIME);
  doc.rect(0, 0, W, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...LIME);
  doc.text("SAFETY 4.0 ACADEMY", margin, 18);

  doc.setFontSize(20);
  doc.setTextColor(...WHITE);
  doc.text("ROI Report", margin, 32);

  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(`Prepared for ${d.name} — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, margin, 40);

  y = 54;

  // --- EXECUTIVE SUMMARY ---
  doc.setFillColor(25, 25, 65);
  doc.roundedRect(margin, y, contentW, 44, 3, 3, "F");

  doc.setFontSize(8);
  doc.setTextColor(...LIME);
  doc.text("EXECUTIVE SUMMARY", margin + 8, y + 10);

  const summaryItems = [
    { label: "Annual value", value: money(d.annualSav), color: LIME },
    { label: "Year 1 ROI", value: d.roi1 + "%", color: d.roi1 >= 0 ? LIME : [255, 80, 80] as const },
    { label: "3-year return", value: money(d.cum), color: PINK },
    { label: "Payback", value: d.payback + " weeks", color: WHITE },
  ];

  const colW = contentW / 4;
  summaryItems.forEach((item, i) => {
    const cx = margin + colW * i + colW / 2;
    doc.setFontSize(8);
    doc.setTextColor(...GREY);
    doc.text(item.label, cx, y + 22, { align: "center" });
    doc.setFontSize(18);
    doc.setTextColor(...(item.color as [number, number, number]));
    doc.text(item.value, cx, y + 34, { align: "center" });
  });

  y += 54;

  // --- INPUT ASSUMPTIONS ---
  doc.setFontSize(8);
  doc.setTextColor(...LIME);
  doc.text("YOUR INPUTS", margin, y);
  y += 6;

  doc.setFillColor(25, 25, 65);
  doc.roundedRect(margin, y, contentW, 32, 3, 3, "F");

  const inputs = [
    { label: "EHS team size", value: d.team + " people" },
    { label: "Avg. salary", value: "$" + d.sal.toLocaleString() },
    { label: "Manual hrs/wk", value: d.manHrs + " hrs" },
    { label: "Recordable injuries/yr", value: String(d.tri) },
    { label: "Fatalities/yr", value: String(d.fatal) },
  ];

  const inputColW = contentW / inputs.length;
  inputs.forEach((item, i) => {
    const cx = margin + inputColW * i + inputColW / 2;
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(item.label, cx, y + 10, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(...WHITE);
    doc.text(item.value, cx, y + 20, { align: "center" });
  });

  y += 42;

  // --- 3-YEAR ROI BREAKDOWN ---
  doc.setFontSize(8);
  doc.setTextColor(...LIME);
  doc.text("3-YEAR ROI — ONE-OFF INVESTMENT", margin, y);
  y += 6;

  doc.setFillColor(25, 25, 65);
  doc.roundedRect(margin, y, contentW, 40, 3, 3, "F");

  const years = [
    { label: "Year 1", value: d.y1, note: "after investment" },
    { label: "Year 2", value: d.y2, note: "pure savings" },
    { label: "Year 3", value: d.y3, note: "pure savings" },
  ];

  const yearColW = contentW / 3;
  years.forEach((yr, i) => {
    const cx = margin + yearColW * i + yearColW / 2;
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(yr.label, cx, y + 12, { align: "center" });
    doc.setFontSize(16);
    doc.setTextColor(...PINK);
    doc.text(money(yr.value), cx, y + 24, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(yr.note, cx, y + 31, { align: "center" });
  });

  y += 50;

  // --- DETAILED BREAKDOWN TABLE ---
  doc.setFontSize(8);
  doc.setTextColor(...LIME);
  doc.text("DETAILED BREAKDOWN", margin, y);
  y += 6;

  const rows = [
    { label: "Time savings (Harvard/BCG 25%)", value: money(d.timeSav), highlight: false },
    { label: "Hours freed from admin/year", value: d.annHrs.toLocaleString() + " hrs", highlight: false },
    { label: `Programme investment (${d.team} people)`, value: money(d.cost), highlight: false },
    { label: `Year 1 (after $${d.cost.toLocaleString()} investment)`, value: money(d.y1), highlight: false },
    { label: "Year 2 (zero additional cost)", value: money(d.y2), highlight: false },
    { label: "Year 3 (zero additional cost)", value: money(d.y3), highlight: false },
    { label: "3-year cumulative return", value: money(d.cum), highlight: true },
    { label: "3-year ROI on investment", value: d.roi3 + "%", highlight: false },
    { label: "Year 1 ROI", value: d.roi1 + "%", highlight: false },
    { label: "Payback period", value: d.payback + " weeks", highlight: false },
  ];

  if (d.safetyToggle) {
    rows.splice(2, 0,
      { label: `Recordable injuries prevented (${d.triAv})`, value: money(d.injSav), highlight: false },
      { label: `Fatality cost prevented (${d.fatAv})`, value: money(d.fatSav), highlight: false },
      { label: "Total safety outcome value", value: money(d.safetySav), highlight: false },
    );
  }

  rows.forEach((row) => {
    const isHighlight = row.highlight;
    if (isHighlight) {
      doc.setFillColor(...LIME);
      doc.roundedRect(margin, y - 1, contentW, 9, 1.5, 1.5, "F");
    } else {
      doc.setDrawColor(40, 40, 80);
      doc.line(margin, y + 7, margin + contentW, y + 7);
    }

    doc.setFontSize(9);
    const labelColor = isHighlight ? NAVY : GREY;
    doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    doc.text(row.label, margin + 4, y + 5);
    const valColor = isHighlight ? NAVY : WHITE;
    doc.setTextColor(valColor[0], valColor[1], valColor[2]);
    doc.setFont("helvetica", isHighlight ? "bold" : "normal");
    doc.text(row.value, margin + contentW - 4, y + 5, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += 9;
  });

  y += 10;

  // --- SOURCES ---
  doc.setFontSize(8);
  doc.setTextColor(...LIME);
  doc.text("SOURCES & METHODOLOGY", margin, y);
  y += 6;

  doc.setFontSize(7);
  doc.setTextColor(...GREY);

  const sources = [
    "AI Time Savings (25%): Dell'Acqua et al. (2023). \"Navigating the Jagged Technological Frontier.\" Harvard Business School / BCG. Working Paper No. 24-013. RCT, 758 consultants.",
    "Corroborated by: Noy & Zhang (2023). Experimental evidence on the productivity effects of generative AI. Science, 381, 187-192. MIT RCT, 453 professionals.",
    "Recordable Injury Cost ($43,000): National Safety Council. Injury Facts 2023. injuryfacts.nsc.org",
    "Fatality Cost ($1,460,000): National Safety Council. Injury Facts 2023.",
    "Incident Reduction (25%): Deloitte EHS predictive analytics research via United Safety (2025). Modelled as outcome of reinvesting recovered hours.",
  ];

  sources.forEach((src) => {
    const lines = doc.splitTextToSize("• " + src, contentW - 4);
    doc.text(lines, margin + 2, y);
    y += lines.length * 3.5 + 1;
  });

  y += 6;

  // --- DISCLAIMER ---
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 140);
  const disclaimer = "Direct savings modelled only. Unmodelled value: staff retention, regulatory fine avoidance, reputational protection, insurance impact, compliance risk reduction. All figures are estimates — not guarantees of outcome.";
  const discLines = doc.splitTextToSize(disclaimer, contentW);
  doc.text(discLines, margin, y);

  // --- FOOTER ---
  const footerY = 282;
  doc.setFillColor(...LIME);
  doc.rect(0, footerY, W, 2, "F");

  doc.setFontSize(8);
  doc.setTextColor(...LIME);
  doc.text("Safety 4.0 Academy", margin, footerY + 9);

  doc.setTextColor(...GREY);
  doc.setFontSize(7);
  doc.text("safetyacademy.tech  ·  hello@safetyacademy.tech", margin, footerY + 14);

  doc.setTextColor(...PINK);
  doc.text("Book a call → safetyacademy.tech/in-company", W - margin, footerY + 9, { align: "right" });

  // Save
  doc.save(`Safety-4.0-ROI-Report-${d.name.replace(/\s+/g, "-")}.pdf`);
}
