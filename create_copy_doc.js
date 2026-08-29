const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    children: [
      // Title
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
        style: "Normal",
      }),

      // SECTION 1
      new Paragraph({
        text: "SECTION 1: PROBLEM STATS - HEADLINE & SUBHEADING",
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
                children: [new Paragraph("CURRENT (B2C)")],
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
                children: [new Paragraph("CURRENT (B2C)")],
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
                children: [new Paragraph("CURRENT (B2C)")],
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

      // Stats
      new Paragraph({
        text: "Four Stat Cards - Labels & Descriptions:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("Card")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("CURRENT (B2C)")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("NEW (B2B)")], shading: { fill: "E8E8E8" } }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("1")] }),
              new TableCell({ children: [new Paragraph("No AI Skills\n\nof EHS practitioners have no AI skills")] }),
              new TableCell({ children: [new Paragraph("Zero AI Capability\n\nof EHS teams have no AI or digital readiness")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("2")] }),
              new TableCell({ children: [new Paragraph("AI Beginners\n\nof EHS pros self-identify as beginners")] }),
              new TableCell({ children: [new Paragraph("Beginner Level\n\nof EHS functions rate maturity as early-stage")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("3")] }),
              new TableCell({ children: [new Paragraph("Investing in AI\n\nCompanies plan to invest in AI within 12 months")] }),
              new TableCell({ children: [new Paragraph("Active Investment\n\nof organizations plan SafetyTech investment in 12 months")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("4")] }),
              new TableCell({ children: [new Paragraph("AI Priority\n\nof hiring managers prioritise AI skills")] }),
              new TableCell({ children: [new Paragraph("Hiring Pressure\n\nof organizations seek AI-aware EHS leadership")] }),
            ],
          }),
        ],
      }),

      new Paragraph(""),

      // Problem Statement
      new Paragraph({
        text: "Problem Statement Paragraph:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Paragraph({
        text: "CURRENT (B2C):",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: 'The hard truth: traditional safety certifications won\'t protect your career anymore. Compliance-based credentials no longer signal readiness. Organisations are actively seeking safety leaders who can leverage AI and digital tools — and most professionals aren\'t there yet.',
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: "NEW (B2B):",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: "The hard truth: your EHS function can't govern or evaluate AI and SafetyTech investments without building team capability first. Traditional compliance-focused training won't prepare your team for AI governance, data ethics, or digital transformation leadership. Meanwhile, competitors are already building this capability—and your organization is falling behind.",
        spacing: { after: 200 },
      }),

      // SECTION 2
      new Paragraph({
        text: "SECTION 2: SOLUTION - HEADLINE & SUBHEADING",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),

      new Paragraph({
        text: "CURRENT (B2C):",
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
        text: "NEW (B2B):",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: "Headline: Transform Your EHS Function: Build Team Capability for AI",
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: "Subheading: A structured program that takes your EHS team from reactive to AI-enabled—building organizational capability for governance, evaluation, and responsible adoption of emerging safety technologies.",
        spacing: { after: 200 },
      }),

      // Benefits
      new Paragraph({
        text: "Six Benefits Cards:",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 50 },
      }),

      new Table({
        rows: [
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("#")], shading: { fill: "E8E8E8" }, width: { size: 5, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph("CURRENT TITLE")], shading: { fill: "E8E8E8" }, width: { size: 30, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph("NEW TITLE")], shading: { fill: "E8E8E8" }, width: { size: 30, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph("NEW DESCRIPTION")], shading: { fill: "E8E8E8" }, width: { size: 35, type: WidthType.PERCENTAGE } }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("1")] }),
              new TableCell({ children: [new Paragraph("Learn AI, IoT, & SafetyTech")] }),
              new TableCell({ children: [new Paragraph("Build AI Literacy Across Your Team")] }),
              new TableCell({ children: [new Paragraph("Equip your EHS function with practical AI and SafetyTech knowledge tailored to your industry and workflow.")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("2")] }),
              new TableCell({ children: [new Paragraph("Global safety leader community")] }),
              new TableCell({ children: [new Paragraph("Enable Cross-Functional Collaboration")] }),
              new TableCell({ children: [new Paragraph("Give your EHS leaders the language and confidence to partner with IT, Operations, and executive teams on digital initiatives.")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("3")] }),
              new TableCell({ children: [new Paragraph("IOSH & CPD recognized certification")] }),
              new TableCell({ children: [new Paragraph("IOSH-Approved, Recognized Capability")] }),
              new TableCell({ children: [new Paragraph("Build verifiable organizational capability through IOSH-approved, CPD-recognized training your teams can reference.")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("4")] }),
              new TableCell({ children: [new Paragraph("Masterclass sessions with experts")] }),
              new TableCell({ children: [new Paragraph("Learn from SafetyTech Leaders")] }),
              new TableCell({ children: [new Paragraph("Access expert-led sessions and case studies showing how other organizations have successfully transformed their EHS functions.")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("5")] }),
              new TableCell({ children: [new Paragraph("Future-proof your career in hours")] }),
              new TableCell({ children: [new Paragraph("Accelerate Digital Transformation")] }),
              new TableCell({ children: [new Paragraph("Move from defensive compliance to strategic AI governance—measurable progress in weeks, not years.")] }),
            ],
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph("6")] }),
              new TableCell({ children: [new Paragraph("1:1 personalized mentoring")] }),
              new TableCell({ children: [new Paragraph("Flexible Delivery for Your Organization")] }),
              new TableCell({ children: [new Paragraph("Executive briefings, team workshops, or in-depth programs—tailored to your timeline and organizational structure.")] }),
            ],
          }),
        ],
      }),

      new Paragraph(""),

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
        text: "CURRENT (B2C):",
        bold: true,
        spacing: { before: 50, after: 50 },
      }),

      new Paragraph({
        text: "Our mission is to lead safety forward. Watch how we're equipping EHS teams with the AI literacy and digital skills to lead in the Safety 4.0 era.",
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: "NEW (B2B):",
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
              new TableCell({ children: [new Paragraph("CURRENT")], shading: { fill: "E8E8E8" } }),
              new TableCell({ children: [new Paragraph("NEW")], shading: { fill: "E8E8E8" } }),
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

      new Paragraph(""),
      new Paragraph(""),

      new Paragraph({
        text: "INSTRUCTIONS FOR EDITING:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),

      new Paragraph({
        text: "1. Review all copy changes in this document",
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: "2. Edit any text you'd like to change directly in the NEW column/field",
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: "3. Send back with your changes and approval",
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: "4. Once approved, I'll update the code and push to production",
        spacing: { after: 200 },
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('SafetyTech_B2B_Copy_Review.docx', buffer);
  console.log('Document created: SafetyTech_B2B_Copy_Review.docx');
});
