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
  if (a >= 1000) return s + "$" + (a / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return s + "$" + Math.round(a).toLocaleString();
}

function moneyExact(n: number): string {
  return (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString();
}

// Brand colours
const NAVY = [17, 17, 58] as const;
const LIME = [193, 255, 114] as const;
const PINK = [255, 102, 196] as const;
const WHITE = [255, 255, 255] as const;
const GREY = [140, 140, 180] as const;

const PAGE_H = 297;
const FOOTER_H = 20;
const MARGIN = 18;
const W = 210;
const CONTENT_W = W - MARGIN * 2;

function needsNewPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - FOOTER_H - 8) {
    drawFooter(doc);
    doc.addPage();
    drawPageBg(doc);
    return 20;
  }
  return y;
}

function drawPageBg(doc: jsPDF) {
  doc.setFillColor(245, 245, 250);
  doc.rect(0, 0, W, PAGE_H, "F");
}

function drawFooter(doc: jsPDF) {
  const fy = PAGE_H - FOOTER_H;
  doc.setFillColor(...LIME);
  doc.rect(0, fy, W, 2, "F");

  doc.setFontSize(8);
  doc.setTextColor(...LIME);
  doc.text("Safety 4.0 Academy", MARGIN, fy + 10);

  doc.setTextColor(...GREY);
  doc.setFontSize(7);
  doc.text("safetytech.academy  ·  hello@safetyacademy.tech", MARGIN, fy + 15);

  doc.setTextColor(...PINK);
  doc.setFontSize(7);
  doc.text("Book a call \u2192 safetytech.academy/contact", W - MARGIN, fy + 10, { align: "right" });
}

export function generateROIReport(d: ROIData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // --- PAGE 1 BACKGROUND ---
  drawPageBg(doc);

  // --- HEADER BAR ---
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 40, "F");
  doc.setFillColor(...LIME);
  doc.rect(0, 0, W, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...LIME);
  doc.text("SAFETY 4.0 ACADEMY", MARGIN, 14);

  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.text("ROI Report", MARGIN, 27);

  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text(
    `Prepared for ${d.name} — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
    MARGIN, 35
  );

  let y = 48;

  // --- EXECUTIVE SUMMARY ---
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, CONTENT_W, 38, 3, 3, "F");

  doc.setFontSize(7);
  doc.setTextColor(...LIME);
  doc.text("EXECUTIVE SUMMARY", MARGIN + 6, y + 9);

  const summaryItems = [
    { label: "Annual value", value: money(d.annualSav), color: LIME },
    { label: "Year 1 ROI", value: d.roi1 + "%", color: d.roi1 >= 0 ? LIME : [255, 80, 80] as const },
    { label: "3-year return", value: money(d.cum), color: PINK },
    { label: "Payback", value: d.payback + " weeks", color: WHITE },
  ];

  const colW = CONTENT_W / 4;
  summaryItems.forEach((item, i) => {
    const cx = MARGIN + colW * i + colW / 2;
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(item.label, cx, y + 19, { align: "center" });
    doc.setFontSize(15);
    doc.setTextColor(...(item.color as [number, number, number]));
    doc.text(item.value, cx, y + 30, { align: "center" });
  });

  y += 44;

  // --- INPUT ASSUMPTIONS ---
  doc.setFontSize(7);
  doc.setTextColor(...LIME);
  doc.text("YOUR INPUTS", MARGIN, y);
  y += 5;

  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, CONTENT_W, 26, 3, 3, "F");

  const inputs = [
    { label: "EHS team size", value: d.team + " people" },
    { label: "Avg. salary", value: moneyExact(d.sal) },
    { label: "Manual hrs/wk", value: d.manHrs + " hrs" },
    { label: "Recordable injuries/yr", value: String(d.tri) },
    { label: "Fatalities/yr", value: String(d.fatal) },
  ];

  const inputColW = CONTENT_W / inputs.length;
  inputs.forEach((item, i) => {
    const cx = MARGIN + inputColW * i + inputColW / 2;
    doc.setFontSize(6);
    doc.setTextColor(...GREY);
    doc.text(item.label, cx, y + 9, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(item.value, cx, y + 18, { align: "center" });
  });

  y += 32;

  // --- 3-YEAR ROI BREAKDOWN ---
  doc.setFontSize(7);
  doc.setTextColor(...LIME);
  doc.text("3-YEAR ROI — ONE-OFF INVESTMENT", MARGIN, y);
  y += 5;

  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, CONTENT_W, 32, 3, 3, "F");

  const years = [
    { label: "Year 1", value: d.y1, note: "after investment" },
    { label: "Year 2", value: d.y2, note: "pure savings" },
    { label: "Year 3", value: d.y3, note: "pure savings" },
  ];

  const yearColW = CONTENT_W / 3;
  years.forEach((yr, i) => {
    const cx = MARGIN + yearColW * i + yearColW / 2;
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text(yr.label, cx, y + 10, { align: "center" });
    doc.setFontSize(14);
    doc.setTextColor(...PINK);
    doc.text(money(yr.value), cx, y + 20, { align: "center" });
    doc.setFontSize(6);
    doc.setTextColor(...GREY);
    doc.text(yr.note, cx, y + 26, { align: "center" });
  });

  y += 38;

  // --- DETAILED BREAKDOWN TABLE ---
  doc.setFontSize(7);
  doc.setTextColor(...LIME);
  doc.text("DETAILED BREAKDOWN", MARGIN, y);
  y += 5;

  const rows: { label: string; value: string; highlight: boolean }[] = [
    { label: "Time savings (Harvard/BCG 25%)", value: money(d.timeSav), highlight: false },
    { label: "Hours freed from admin/year", value: d.annHrs.toLocaleString() + " hrs", highlight: false },
  ];

  if (d.safetyToggle) {
    if (d.triAv > 0) {
      rows.push({ label: `Recordable injuries prevented (${d.triAv})`, value: money(d.injSav), highlight: false });
    }
    if (d.fatAv > 0) {
      rows.push({ label: `Fatality cost prevented (${d.fatAv})`, value: money(d.fatSav), highlight: false });
    }
    rows.push({ label: "Total safety outcome value", value: money(d.safetySav), highlight: false });
  }

  rows.push(
    { label: `Programme investment (${d.team} people)`, value: moneyExact(d.cost), highlight: false },
    { label: `Year 1 (after ${moneyExact(d.cost)} investment)`, value: money(d.y1), highlight: false },
    { label: "Year 2 (zero additional cost)", value: money(d.y2), highlight: false },
    { label: "Year 3 (zero additional cost)", value: money(d.y3), highlight: false },
    { label: "3-year cumulative return", value: money(d.cum), highlight: true },
    { label: "3-year ROI on investment", value: d.roi3 + "%", highlight: false },
    { label: "Year 1 ROI", value: d.roi1 + "%", highlight: false },
    { label: "Payback period", value: d.payback + " weeks", highlight: false },
  );

  const ROW_H = 8;
  rows.forEach((row) => {
    y = needsNewPage(doc, y, ROW_H + 2);
    const isHL = row.highlight;
    if (isHL) {
      doc.setFillColor(...LIME);
      doc.roundedRect(MARGIN, y - 1, CONTENT_W, ROW_H, 1.5, 1.5, "F");
    } else {
      doc.setDrawColor(200, 200, 220);
      doc.line(MARGIN, y + ROW_H - 1, MARGIN + CONTENT_W, y + ROW_H - 1);
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", isHL ? "bold" : "normal");
    const labelC = isHL ? NAVY : GREY;
    doc.setTextColor(labelC[0], labelC[1], labelC[2]);
    doc.text(row.label, MARGIN + 3, y + 4.5);
    const valC: readonly number[] = isHL ? NAVY : [50, 50, 80];
    doc.setTextColor(valC[0], valC[1], valC[2]);
    doc.text(row.value, MARGIN + CONTENT_W - 3, y + 4.5, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += ROW_H;
  });

  y += 8;

  // --- SOURCES ---
  y = needsNewPage(doc, y, 50);
  doc.setFontSize(7);
  doc.setTextColor(...LIME);
  doc.text("SOURCES & METHODOLOGY", MARGIN, y);
  y += 5;

  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 140);

  const sources = [
    "AI Time Savings (25%): Dell'Acqua et al. (2023). \"Navigating the Jagged Technological Frontier.\" Harvard Business School / BCG. Working Paper No. 24-013. RCT, 758 consultants.",
    "Corroborated by: Noy & Zhang (2023). Experimental evidence on the productivity effects of generative AI. Science, 381, 187-192. MIT RCT, 453 professionals.",
    "Recordable Injury Cost ($43,000): National Safety Council. Injury Facts 2023. injuryfacts.nsc.org",
    "Fatality Cost ($1,460,000): National Safety Council. Injury Facts 2023.",
    "Incident Reduction (25%): Deloitte EHS predictive analytics research via United Safety (2025). Modelled as outcome of reinvesting recovered hours.",
  ];

  sources.forEach((src) => {
    y = needsNewPage(doc, y, 10);
    const lines = doc.splitTextToSize("\u2022 " + src, CONTENT_W - 4);
    doc.text(lines, MARGIN + 2, y);
    y += lines.length * 3.2 + 1;
  });

  y += 4;

  // --- DISCLAIMER ---
  y = needsNewPage(doc, y, 12);
  doc.setFontSize(6);
  doc.setTextColor(130, 130, 160);
  const disclaimer = "Direct savings modelled only. Unmodelled value: staff retention, regulatory fine avoidance, reputational protection, insurance impact, compliance risk reduction. All figures are estimates — not guarantees of outcome.";
  const discLines = doc.splitTextToSize(disclaimer, CONTENT_W);
  doc.text(discLines, MARGIN, y);

  // --- FOOTER on all pages ---
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    drawFooter(doc);
  }

  // Save
  doc.save(`Safety-4.0-ROI-Report-${d.name.replace(/\s+/g, "-")}.pdf`);
}
