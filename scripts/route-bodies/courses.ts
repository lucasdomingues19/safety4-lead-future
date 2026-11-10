import type { RouteBodyEntry as RouteBody } from "../route-bodies";
const LIVE_UNTIL = Date.parse("2026-12-09T17:00:00Z"); // the 9 Dec 2026 live session ends
const liveSessionSection = {
  heading: "Open live session: Wednesday 9 December 2026",
  paragraphs: [
    "Not booking for a team? Individual places are open for one day, live on Microsoft Teams, 9am–5pm UK time. Built for EHS professionals who have, or soon will have, Microsoft 365 Copilot. No technical background needed.",
    "You will use Microsoft 365 Copilot on real EHS tasks, build AI agents that take routine work off your plate, analyse EHS data with Copilot, and put risk and governance in place with a competent person always in charge.",
    "£997 + VAT for the first 10 places, then £1,497 + VAT. Includes 12 months in the SafetyTech Global Network community.",
  ],
};

export const bodies: RouteBody[] = [
  {
    path: "/elearning",
    h1: "Safety 4.0 — Leading Safety in the Digital Age",
    sections: [
      {
        heading: "",
        paragraphs: [
          "The world's first IOSH-approved eLearning programme for safety professionals to develop AI, IoT, and digital transformation skills — at their own pace.",
        ],
      },
      {
        heading: "Your toolkit to lead in Safety 4.0",
        bullets: [
          "60+ Video Lessons — Studio-recorded, on-demand content covering all 10 modules.",
          "Downloadable Resources — Templates, frameworks, and toolkits you can use immediately.",
          "Interactive Assessments — Test your knowledge and earn your IOSH & CPD certification.",
          "Real-World Case Studies — Learn from organisations already implementing Safety 4.0.",
          "Mobile App Access — Learn anywhere — desktop, tablet, or mobile.",
          "Email Support — Get help when you need it throughout your learning journey.",
        ],
      },
      {
        heading: "Who is it for?",
        bullets: [
          "EHS Directors & Heads of Safety — Leading strategy and integrating AI, data, and digital tools into your function.",
          "Senior Safety Managers — Managing teams, ready to champion Safety 4.0 across your organisation.",
          "Regional / Global EHS Leads — Overseeing multi-site operations, seeking scalable digital safety solutions.",
          "Safety Consultants & Advisors — Advising clients on modern safety practices, adding Safety 4.0 to your toolkit.",
          "Operational Leaders with EHS Remit — COOs, VPs of Operations, Plant Managers responsible for safety performance.",
          "EHS Professionals Seeking Certification — Practitioners wanting an IOSH & CPD-approved credential in digital safety.",
        ],
      },
      {
        heading: "A modern curriculum",
        paragraphs: [
          "Each module builds on the last — from foundational concepts to strategic leadership.",
        ],
        bullets: [
          "Introduction & Orientation — Course overview, objectives, CPD & IOSH value, learner expectations.",
          "What is Safety 4.0? — Definition of Safety 4.0, triangle (People, Processes, Tech), role of data, 4th Industrial Revolution.",
          "The Safety Status Quo is Broken — Compliance-heavy culture, lagging indicators, reactive safety trap.",
          "Skills for the Safety Leader in the Digital Age — Digital literacy, AI/data awareness, adaptive intelligence, communication skills.",
          "Safetytech Practical Applications — Wearables, IoT, drones, mobile-first systems, computer vision.",
          "Building your Digital Safety Toolkit — Practical day-to-day tools: reporting apps, AI writing, automation, QR codes.",
          "Data Strategy: From Chaos to Clarity — Data collection, centralisation, cleaning, analysis; pitfalls & benefits.",
          "AI Essentials for Safety Leaders — AI history, ML, NLP, LLMs, CV, agentic AI, real-world cases, myths & risks.",
          "Compliance, Risk & Governance Essentials — Digital compliance, regulation, governance frameworks, ethical AI.",
          "Digital Safety Transformation Framework — ROI, executive influence, linking safety to business performance.",
        ],
      },
      {
        heading: "Globally Recognised Credentials",
        paragraphs: [
          "Earn a certification that validates your Safety 4.0 expertise to employers worldwide.",
        ],
        bullets: [
          "IOSH Approved — Digital certificate issued by the Institution of Occupational Safety and Health, recognised in 130+ countries.",
          "CPD Certified — 8+ hours of certified Continuing Professional Development credits, required by many professional bodies.",
        ],
      },
    ],
  },
  {
    path: "/ai-fundamentals",
    h1: "AI Fundamentals in EHS",
    sections: [
      {
        heading: "",
        paragraphs: [
          "Build the AI literacy every modern EHS professional needs in just 90 minutes. Practical. No jargon. No buzzwords. Just actionable skills you can start using immediately.",
        ],
      },
      {
        heading: "Confidently apply AI in EHS",
        paragraphs: [
          "No previous AI knowledge required. Just bring your curiosity. By the end of this course you'll be able to:",
        ],
        bullets: [
          "Understand AI in EHS — Grasp what AI is and how it applies directly to environment, health and safety.",
          "Use AI Tools Responsibly — Apply AI in your workflows effectively, ethically and with the right guardrails.",
          "Spot Practical Use Cases — Identify opportunities that save time and improve decision-making.",
          "Recognise Risks & Limits — Understand common risks, biases and limitations of AI in a safety context.",
          "Write Better Prompts — Craft effective prompts that consistently produce better, usable results.",
          "Start Using It Immediately — Walk away with real skills you can apply from day one.",
        ],
      },
      {
        heading: "Who is it for?",
        bullets: [
          "EHS Advisors & Supervisors — Ground-level practitioners who want to bring AI into their day-to-day work.",
          "EHS Managers — Team leaders introducing AI-driven ways of working across their function.",
          "EHS Heads & Directors — Senior leaders wanting a clear, jargon-free view of AI's role in safety.",
          "EHS Consultants — Advisors who need to speak the AI language with clients and stakeholders.",
          "Career Changers into EHS — Anyone stepping into safety who wants to arrive ready for the digital age.",
          "Anyone Curious About AI — Wondering where to start with AI in safety? This is your starting line.",
        ],
      },
      {
        heading: "What's included",
        bullets: [
          "90-minute on-demand course",
          "5 practical learning modules",
          "Downloadable SafetyTech glossary",
          "Ready-to-use prompt library",
          "Certificate of Completion by SafetyTech Academy",
          "Access from desktop, tablet or mobile",
        ],
      },
      {
        heading: "Questions? Answered.",
        bullets: [
          "Do I need any AI experience to take this course? — No. The course is designed for EHS professionals with little or no AI background. We explain concepts in plain language and focus on practical application, not theory.",
          "How long do I have access to the course? — You get 365 days access to the course materials, including any future updates we make to the AI Fundamentals in EHS curriculum.",
          "Is the certificate recognised by employers? — You will receive a Certificate of Completion issued by SafetyTech Academy, an approved training provider by IOSH. It demonstrates practical AI literacy in an EHS context.",
          "Can my employer pay for this course? — Yes. At checkout you can use a company card or request an invoice. Many learners expense this as professional development.",
          "What is the time commitment? — The course is 90 minutes in total, split into 5 short modules. You can complete it in one sitting or across multiple sessions.",
          "Is there a money-back guarantee? — Yes. If you are not satisfied, contact us within 7 days of purchase for a full refund.",
          "Will this teach me to build AI systems? — No. This course focuses on using AI tools responsibly and effectively in EHS workflows — not coding or building models.",
        ],
      },
    ],
  },
  {
    path: "/copilot-for-ehs",
    h1: "Copilot for EHS Professionals",
    sections: [
      {
        heading: "",
        paragraphs: [
          "Your team already has the Copilot licence. Under the EU AI Act, organisations now have a legal duty to ensure adequate AI literacy — Article 4 has applied since February 2025, enforced from August 2026. This program builds the practical, audit-ready competence to use Copilot safely in risk assessments, incident reporting and compliance work.",
          "\"You have the tool, now make your EHS & sustainability function competent.\"",
        ],
      },
      {
        heading: "How the program teaches AI safely",
        bullets: [
          "Assurative AI — Copilot drafts and flags. A competent person reviews, corrects, and underwrites every output. This principle runs through all ten modules, so the AI makes your team faster without your people losing accountability for safety-critical work.",
          "The GRACE prompt framework — Ground, Role, Artefact, Constraints, Evidence — a simple structure so participants write reliable, source-grounded prompts for safety-critical work from day one, instead of the vague prompts that produce unsafe output.",
        ],
      },
      {
        heading: "Two ways to run the program",
        paragraphs: [
          "Pricing scales with group size, from 10 to 30+ participants. Register your interest and we'll confirm a quote for your team.",
        ],
      },
      {
        heading: "Option A — Live Cohort Program",
        paragraphs: [
          "The complete transformation program, delivered live in small cohorts of up to 10–15.",
        ],
        bullets: [
          "Ten live modules, paced for hands-on practice",
          "Fundamentals of AI in EHS eLearning as a foundation",
          "Weekly live office hours for the duration",
          "Private community space for delegates",
          "Session recordings, workbooks, 365-day access",
          "Dedicated project manager to coordinate delivery",
        ],
      },
      {
        heading: "Option B — Self-Paced Program",
        paragraphs: [
          "A lower-cost, self-directed route that scales easily across larger groups. Coming soon.",
          "Delivers the same core content without the live modules, weekly office hours, or dedicated project manager. Often used as a scalable foundation for larger populations, or alongside a live cohort for the core team.",
        ],
        bullets: [
          "Fundamentals of AI in EHS eLearning",
          "Self-paced ten-module library",
          "Workbooks and a private community space",
          "365-day access to all materials",
        ],
      },
      {
        heading: "The ten modules",
        paragraphs: [
          "The program moves from foundations to applied automation — core capability first, then Copilot across the day-to-day safety workflow, then agents and automation with the governance to use them safely.",
          "Module content is reviewed and updated on a rolling basis to keep pace with Microsoft's monthly Copilot releases.",
        ],
        bullets: [
          "1. AI Fundamentals for EHS Professionals",
          "2. Prompt Engineering for EHS",
          "3. Copilot in Apps for EHS Productivity (Part 1)",
          "4. Copilot in Apps for EHS Productivity (Part 2)",
          "5. Notebook",
          "6. Copilot Cowork",
          "7. Copilot Agents",
          "8. AI Risks, Ethics, Security and Governance",
          "9. Stay Copilot Confident",
          "10. Capstone Project: Copilot-Powered EHS Investigation & Improvement Programme",
        ],
      },
      {
        heading: "What's the return for your team?",
        paragraphs: [
          "The training pays for itself quickly — even a conservative time saving adds up fast across a team.",
        ],
      },
      ...(Date.now() < LIVE_UNTIL ? [liveSessionSection] : []),
      {
        heading: "Delivery details",
        bullets: [
          "Live cohorts capped at 10–15 participants to preserve hands-on quality",
          "365 days' access to materials, recordings and the community space",
          "Self-paced option coming soon",
          "Live cohorts are scheduled around your team",
          "Cohorts above 20 participants run as two groups",
          "Bespoke blends of live and self-paced available for larger populations",
        ],
      },
      {
        heading: "Training a team? Give them real Copilot competence.",
        paragraphs: [
          "Register your interest in group training and we'll confirm dates and a quote scaled to your team.",
        ],
      },
    ],
  },
  {
    path: "/accelerator",
    h1: "Safety 4.0 Accelerator Cohort",
    sections: [
      {
        heading: "",
        paragraphs: [
          "A senior executive leadership programme delivered LIVE. 6 weeks of live sessions and self-paced modules, with a cohort of EHS leaders navigating the AI transition together.",
        ],
      },
      {
        heading: "This isn't an online course. It's a transformation journey.",
        paragraphs: [
          "The Accelerator combines on-demand course content with live weekly sessions, a peer cohort, and direct access to Lucas. The result is accountability, community, and a credential.",
        ],
        bullets: [
          "7 Live Sessions — Weekly live group sessions — not webinars. Interactive, discussion-led, and tailored to what the cohort needs. Lucas brings 15 years of practitioner experience into every session.",
          "Cohort of 10–15 Peers max — Deliberately small. You'll learn alongside EHS professionals from construction, manufacturing, energy, and logistics. Real problems, real perspectives, lasting relationships.",
          "IOSH-Approved Certificate — The world's first IOSH-approved Safety 4.0 programme. Your certificate carries IOSH's institutional credibility — recognised by employers in the UK and internationally.",
          "60+ On-Demand Lessons — Studio-recorded lessons available anytime, alongside live sessions. 10 modules covering AI, SafetyTech, data strategy, digital culture, and leadership. 10 CPD hours.",
          "Alumni Community Access — Graduates join a growing network of Safety 4.0 leaders across 12+ countries. Lucas runs regular alumni sessions for ongoing development. A career-long network.",
          "Weekly Q&A Sessions — Live weekly Q&A sessions where you can ask questions, share progress, and get feedback on how to apply what you're learning in your specific context.",
        ],
      },
      {
        heading: "14-Day Satisfaction Guarantee",
        paragraphs: [
          "If you complete Week 1 and don't believe the Accelerator is worth your investment, we'll refund you in full — no questions asked.",
        ],
      },
      {
        heading: "Week by week.",
        bullets: [
          "Leadership — Mindset Activation — Mindset activation session to challenge leaders to rethink how they adopt and integrate AI. While many focus on algorithms and technical capability, the faculty team highlights the overlooked human dimension of transformation.",
          "Diagnose — Name Your Reactive Safety Trap — Deep dive into the evolution of workplace safety over the years and discover your reactive safety trap and why it is a problem. The illusion of safety at board level.",
          "Leadership — Skills Shift & Career Transition — Career digital shift and the skills needed to lead safety in the AI era.",
          "Leadership — AI Governance — AI governance as strategic leadership leverage. Before the adoption of AI tools, learn the importance of setting adequate controls to manage risks related to artificial intelligence.",
          "Bonus Masterclass — Optimise EHS with Microsoft Copilot — Guest AI expert session on Microsoft Copilot. A practical learning session designed to help you work with AI as a sniper, not a bazooka.",
          "Leadership — Lead Transformation — Why 70% of digital transformation projects fail — and how to be in the 30%. Capstone presentations: each participant presents their Transformation Roadmap (hypothetical or real) to the cohort for live feedback.",
        ],
      },
      {
        heading: "10 modules. 60+ lessons and masterclasses. One IOSH-certified and CPD-accredited outcome.",
        bullets: [
          "Introduction & Orientation — Course overview, objectives, CPD & IOSH value, learner expectations.",
          "What is Safety 4.0? — Definition of Safety 4.0, triangle (People, Processes, Tech), role of data, 4th Industrial Revolution.",
          "The Safety Status Quo is Broken — Compliance-heavy culture, lagging indicators, reactive safety trap.",
          "Skills for the Safety Leader in the Digital Age — Digital literacy, AI/data awareness, adaptive intelligence, communication skills.",
          "Safetytech Practical Applications — Wearables, IoT, drones, mobile-first systems, computer vision.",
          "Building your Digital Safety Toolkit — Practical day-to-day tools: reporting apps, AI writing, automation, QR codes.",
          "Data Strategy: From Chaos to Clarity — Data collection, centralisation, cleaning, analysis; pitfalls & benefits.",
          "AI Essentials for Safety Leaders — AI history, ML, NLP, LLMs, CV, agentic AI, real-world cases, myths & risks.",
          "Compliance, Risk & Governance Essentials — Digital compliance, regulation, governance frameworks, ethical AI.",
          "Digital Safety Transformation Framework — ROI, executive influence, linking safety to business performance.",
        ],
      },
      {
        heading: "Accelerator vs eLearning. Understand the difference.",
        bullets: [
          "Full 10-module course content",
          "60+ on-demand video lessons",
          "IOSH-approved certificate",
          "10 CPD hours",
          "7 live sessions with Lucas",
          "Cohort peer community (10–15 people)",
          "Direct Q&A access to Lucas",
          "Accountability & cohort structure",
          "Alumni community access",
          "Team option (2+ seats)",
        ],
      },
      {
        heading: "Ready to join the next cohort?",
        bullets: [
          "14-day money-back guarantee",
          "IOSH-approved programme",
          "Only 15 per cohort",
          "Payment plans available",
        ],
      },
    ],
  },
];
