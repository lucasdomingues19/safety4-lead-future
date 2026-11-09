/** FAQ content: rendered on /faq and baked into its FAQPage structured data. */
export interface FaqCategory { title: string; faqs: { question: string; answer: string }[] }

export const faqCategories: FaqCategory[] = [
  {
    title: "General",
    faqs: [
      { question: "What is SafetyTech Academy?", answer: "SafetyTech Academy is the world's first IOSH-approved and CPD-accredited training programme focused on digital safety leadership. It integrates technologies like AI, IoT, and data analytics into workplace safety management, using predictive analytics and smart technologies to prevent incidents before they occur." },
      { question: "Is this program IOSH and CPD certified?", answer: "Yes. We are an approved training provider by IOSH (Institution of Occupational Safety and Health) and CPD (Continuing Professional Development). Your certification is recognised globally by employers and professional bodies." },
      { question: "Who is it designed for?", answer: "Senior EHS professionals in leadership roles — Managers, Heads of Safety, Directors, VPs, Regional/Global Leads, and Consultants responsible for safety strategy." },
      { question: "Do I need technical skills?", answer: "No. We start with fundamentals and gradually build your digital safety expertise. Basic computer literacy and familiarity with safety concepts is all you need." },
      { question: "What if I'm not satisfied?", answer: "Our self-paced online courses come with a 7-day money-back guarantee. If you're not satisfied within 7 days of purchase, we'll provide a full refund — no questions asked." },
      { question: "Is there support after completion?", answer: "Yes. Graduates join the Safety 4.0 Leaders Network with lifetime access to updates, quarterly webinars, networking events, and priority access to advanced courses." },
    ],
  },
  {
    title: "eLearning",
    faqs: [
      { question: "How does the eLearning work?", answer: "It's a self-paced online programme with 60+ video lessons, interactive assessments, case studies, and downloadable resources. It typically takes 8 hours to complete, and you have 90 days to finish the course. You also get lifetime access to the platform and community." },
      { question: "How much does it cost?", answer: "£597 + VAT where applicable (reduced from £697). Includes IOSH & CPD certification, 10 core modules, 60+ video lessons, and email support." },
    ],
  },
  {
    title: "Safety 4.0 Accelerator",
    faqs: [
      { question: "What is the Accelerator and how is it different from eLearning?", answer: "The Accelerator is a 6-week live cohort programme that includes everything in the eLearning plus 7 live sessions led by Lucas Domingues, a peer cohort of 10–15 professionals, group projects, and direct access to expert guidance." },
      { question: "How much time do I need each week?", answer: "Expect 3–4 hours per week: 90 minutes for the live session, 1–2 hours of on-demand content, and some reflection time. All live sessions are recorded if you miss one." },
      { question: "How much does it cost and can my employer pay?", answer: "£1,997 +VAT per person (reduced from £2,497). We support PO/invoice billing for employer-sponsored enrolments. Mention this in your application and we'll handle the paperwork." },
      { question: "When is the next cohort?", answer: "The next cohort runs 2nd September – 14th October, 2026. Cohorts run monthly — if September fills, you'll be offered a place on the next available one." },
    ],
  },
  {
    title: "In-Company Training",
    faqs: [
      { question: "Can the content be customised for our organisation?", answer: "Yes. While the core curriculum is IOSH-approved, live sessions and case studies are tailored to your sector — construction, manufacturing, energy, logistics, and others. We also support flexible scheduling around your team." },
      { question: "How does this fit alongside existing NEBOSH/IOSH training?", answer: "Safety 4.0 complements your existing development. NEBOSH and IOSH qualifications cover safety management fundamentals; Safety 4.0 covers the digital and AI capability layer those qualifications don't yet address." },
      { question: "Can we get a proposal without committing?", answer: "Absolutely. Book a 30-minute discovery call — it's a conversation, not a sales pitch. You'll receive a tailored written proposal within 48 hours with no obligation. Group discounts are available for 5+ employees." },
    ],
  },
];

export const allFaqs = faqCategories.flatMap((c) => c.faqs);
