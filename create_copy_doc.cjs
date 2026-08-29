const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        text: "SafetyTech Academy - B2B Homepage Copy Review",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      
      new Paragraph({
        text: "Status: READY FOR REVIEW (Not yet pushed to live site)",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      new Paragraph({
        text: "SECTION 1: PROBLEM STATS SECTION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),

      new Paragraph({
        text: "Section Label:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({
                children: [new Paragraph("CURRENT")],
                shading: { fill: "E8E8E8" },
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph("NEW (B2B)")],
                shading: { fill: "E8E8E8" },
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({
                children: [new Paragraph("THE PROBLEM")],
              }),
              new TableCell({
                children: [new Paragraph("THE CHALLENGE")],
              }),
            ],
          }),
        ],
      }),

      new Paragraph(""),

      new Paragraph({
        text: "Main Headline:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({
                children: [new Paragraph("CURRENT")],
                shading: { fill: "E8E8E8" },
              }),
              new TableCell({
                children: [new Paragraph("NEW (B2B)")],
                shading: { fill: "E8E8E8" },
              }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({
                children: [new Paragraph("Digital Skills Gap: The Exposed Risk in EHS")],
              }),
              new TableCell({
                children: [new Paragraph("AI & Digital Transformation: The EHS Function Gap")],
              }),
            ],
          }),
        ],
      }),

      new Paragraph(""),

      new Paragraph({
        text: "Subheading:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({
                children: [new Paragraph("CURRENT")],
                shading: { fill: "E8E8E8" },
              }),
              new TableCell({
                children: [new Paragraph("NEW (B2B)")],
                shading: { fill: "E8E8E8" },
              }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({
                children: [new Paragraph("Your Career is at an Unprecedented Crossroads")],
              }),
              new TableCell({
                children: [new Paragraph("Your Organization is Exploring AI, But Your EHS Team Isn't Ready")],
              }),
            ],
          }),
        ],
      }),

      new Paragraph(""),

      new Paragraph({
        text: "Stats - Card 1:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Label")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("CURRENT")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("NEW")], shading: { fill: "E8E8E8" } }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Title")] }),
              new TableCell({ children: [new Paragraph("No AI Skills")] }),
              new TableCell({ children: [new Paragraph("Zero AI Capability")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Description")] }),
              new TableCell({ children: [new Paragraph("of EHS practitioners have no AI skills")] }),
              new TableCell({ children: [new Paragraph("of EHS teams have no AI or digital readiness")] }),
            ],
          }),
        ],
      }),

      new Paragraph(""),

      new Paragraph({
        text: "Stats - Card 2:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Label")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("CURRENT")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("NEW")], shading: { fill: "E8E8E8" } }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Title")] }),
              new TableCell({ children: [new Paragraph("AI Beginners")] }),
              new TableCell({ children: [new Paragraph("Beginner Level")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Description")] }),
              new TableCell({ children: [new Paragraph("of EHS pros self-identify as beginners")] }),
              new TableCell({ children: [new Paragraph("of EHS functions rate maturity as early-stage")] }),
            ],
          }),
        ],
      }),

      new Paragraph(""),

      new Paragraph({
        text: "Stats - Card 3:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Label")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("CURRENT")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("NEW")], shading: { fill: "E8E8E8" } }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Title")] }),
              new TableCell({ children: [new Paragraph("Investing in AI")] }),
              new TableCell({ children: [new Paragraph("Active Investment")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Description")] }),
              new TableCell({ children: [new Paragraph("Companies plan to invest in AI within 12 months")] }),
              new TableCell({ children: [new Paragraph("of organizations plan SafetyTech investment in 12 months")] }),
            ],
          }),
        ],
      }),

      new Paragraph(""),

      new Paragraph({
        text: "Stats - Card 4:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Label")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("CURRENT")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("NEW")], shading: { fill: "E8E8E8" } }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Title")] }),
              new TableCell({ children: [new Paragraph("AI Priority")] }),
              new TableCell({ children: [new Paragraph("Hiring Pressure")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Description")] }),
              new TableCell({ children: [new Paragraph("of hiring managers prioritise AI skills")] }),
              new TableCell({ children: [new Paragraph("of organizations seek AI-aware EHS leadership")] }),
            ],
          }),
        ],
      }),

      new Paragraph(""),
      new Paragraph(""),

      new Paragraph({
        text: "Problem Statement Paragraph:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }),

      new Paragraph({
        text: "CURRENT:",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: 'The hard truth: traditional safety certifications won\'t protect your career anymore. Compliance-based credentials no longer signal readiness. Organisations are actively seeking safety leaders who can leverage AI and digital tools — and most professionals aren\'t there yet.',
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: "NEW:",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: "The hard truth: your EHS function can't govern or evaluate AI and SafetyTech investments without building team capability first. Traditional compliance-focused training won't prepare your team for AI governance, data ethics, or digital transformation leadership. Meanwhile, competitors are already building this capability—and your organization is falling behind.",
        spacing: { after: 300 },
      }),

      // SECTION 2
      new Paragraph({
        text: "SECTION 2: SOLUTION SECTION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),

      new Paragraph({
        text: "Headline & Subheading:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Paragraph({
        text: "CURRENT:",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: "Headline: The Solution: You need new skills",
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: "Subheading: We've created the world's first comprehensive digital safety leadership program that transforms traditional safety professionals into future-ready leaders.",
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: "NEW:",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: "Headline: Transform Your EHS Function: Build Team Capability for AI",
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: "Subheading: A structured program that takes your EHS team from reactive to AI-enabled—building organizational capability for governance, evaluation, and responsible adoption of emerging safety technologies.",
        spacing: { after: 300 },
      }),

      // SECTION 3
      new Paragraph({
        text: "SECTION 3: BLUE BAND - MISSION & CTA",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),

      new Paragraph({
        text: "Mission Statement:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Paragraph({
        text: "CURRENT:",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: "Our mission is to lead safety forward. Watch how we're equipping EHS teams with the AI literacy and digital skills to lead in the Safety 4.0 era.",
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: "NEW:",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: "Our mission is to enable organizations to govern and harness AI responsibly in their EHS functions. See how we're transforming safety teams into AI-ready, strategic partners for digital transformation.",
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: "CTA Button Text:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("CURRENT")], shading: { fill: "E8E8E8" }, width: { size: 50, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph("NEW")], shading: { fill: "E8E8E8" }, width: { size: 50, type: WidthType.PERCENTAGE } }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Our Courses")] }),
              new TableCell({ children: [new Paragraph("Training Programs")] }),
            ],
          }),
        ],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('SafetyTech_B2B_Copy_Review.docx', buffer);
  console.log('Document created successfully');
});
