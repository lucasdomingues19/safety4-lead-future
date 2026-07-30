export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  author: string;
  authorTitle: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  featuredImage: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "6",
    slug: "more-than-award-nominations",
    title: "More Than Award Nominations: Why We Built SafetyTech Academy",
    metaDescription: "SafetyTech Academy is shortlisted for Best Learning & Training Provider at the 2026 Safety Excellence Awards and the IOSH Awards. Here is what that recognition really represents.",
    excerpt: "Shortlisted for Best Learning & Training Provider at both the 2026 Safety Excellence Awards and the IOSH Awards. A moment to pause and reflect on why we started this journey — and the community that has grown around it.",
    author: "Lucas Domingues",
    authorTitle: "Safety 4.0 Expert, MSc, CMIOSH",
    publishDate: "2026-07-30",
    readTime: "4 min read",
    category: "Company News",
    tags: ["Safety Excellence Awards", "IOSH Awards", "SafetyTech Academy", "EHS Learning", "Professional Development", "Safety 4.0", "Community", "Future of Work"],
    featuredImage: "/assets/blog/award-nominations-2026.jpg",
    content: `
# More Than Award Nominations

When I found out that SafetyTech Academy had been shortlisted for **Best Learning & Training Provider** in both the **2026 Safety Excellence Awards** and the **IOSH Awards**, my first reaction was one of gratitude.

Not because awards define success, but because they provide a moment to pause and reflect on why we started this journey in the first place.

## A Different Kind of Training Provider

From day one, SafetyTech Academy was never intended to be another health and safety training provider. There are already outstanding organisations delivering technical qualifications and compliance training, and that work remains fundamental to our profession.

Our ambition has always been different.

We believe the next generation of EHS professionals needs more than technical knowledge. They need to understand the technologies that are reshaping our workplaces, from AI and automation to digital tools and data. More importantly, they need the confidence to lead those conversations within their organisations.

That belief has shaped every course, webinar and live session we've delivered.

## Practical Knowledge Over Passing Trends

Rather than focusing on the latest AI tool or chasing technology trends, we've concentrated on helping professionals build practical knowledge they can apply immediately. Technology will continue to evolve, but curiosity, critical thinking and the ability to adapt will always be valuable.

## The Community Is the Real Achievement

Perhaps the thing I'm most proud of isn't the content we've created, but the community that has grown around it.

Our learners come from different countries, industries and career stages, yet they all share something in common. They are committed to learning, challenging themselves and helping move the profession forward. Watching those conversations continue long after a course has finished has been one of the most rewarding parts of building the Academy.

## What the Recognition Signals

Being shortlisted by both the Safety Excellence Awards and the IOSH Awards feels like recognition of that approach. It suggests that professional learning is evolving and that preparing people for the future is becoming just as important as teaching the fundamentals.

Whether we bring home an award or not won't change what we do next.

We'll continue building practical learning experiences, growing a community that shares knowledge openly and helping EHS professionals develop the skills they'll need for the future of work.

## Thank You

To everyone who has joined a course, attended a webinar or become part of our community, thank you. This recognition belongs to all of you as much as it does to us. Your curiosity and willingness to embrace new ideas are what make SafetyTech Academy what it is, and I'm excited about what we'll build together next.
`,
  },

    id: "5",
    slug: "sanders-claude-interview",
    title: "Sanders–Claude Interview: AI Governance Lessons for EHS Leaders",
    metaDescription: "What the Bernie Sanders interview with Claude AI means for EHS leaders. A 4-test governance filter for using AI safely in risk, compliance and safety decisions.",
    excerpt: "When Senator Bernie Sanders interviewed Claude, the clip went viral for what AI revealed about data harvesting. The sharper lesson for EHS leaders is how AI mirrors the questioner — and what that means for governance in risk and compliance.",
    author: "Lucas Domingues",
    authorTitle: "Safety 4.0 Expert, MSc, CMIOSH",
    publishDate: "2026-05-25",
    readTime: "5 min read",
    category: "AI Governance",
    tags: ["AI Governance", "EHS Leadership", "Data Governance", "Bias in AI", "Compliance", "Risk Assessment", "Safety 4.0", "IOSH", "Sanders Claude Interview", "AI in Workplace Safety"],
    featuredImage: "/assets/blog/sanders-claude-interview.jpg",
    content: `
# Sanders–Claude Interview: AI Governance Lessons for EHS Leaders

**TL;DR** — Senator Bernie Sanders' viral interview with Anthropic's Claude exposed two issues that matter for Environment, Health and Safety (EHS) leaders: large-scale data harvesting and the way AI mirrors the questioner. The fix is not to avoid AI; it is to govern how it is used in risk, compliance and incident decisions. This article gives EHS professionals a practical four-test filter to apply before any AI output informs a safety-critical decision.

## What Happened in the Sanders–Claude Interview

In March 2026, US Senator Bernie Sanders did something no congressional hearing had managed: he questioned a witness that couldn't dodge. He sat down with Claude, Anthropic's AI assistant, and asked what companies know about us. The clip passed four million views in days.

Claude's answers were striking. It described data harvested from nearly everywhere: searches, location, purchases, even how long you linger on a page. All of it used to build detailed behavioural profiles, often without meaningful consent. Asked why, it reportedly replied: **"Money, Senator."** It went further, calling large-scale profiling a genuine threat to democracy.

## Why This Matters for EHS Leaders

For EHS professionals, the obvious takeaway is **data governance**. As we deploy wearables, fatigue monitors, proximity sensors and AI-assisted reporting, we have quietly become data controllers. Lawful basis, consent and retention are no longer IT's problem. They are live compliance risks sitting inside our safety systems.

But the sharper lesson is one the interview revealed by accident. Commentators quickly pointed out that Sanders was, in effect, **leading the witness**. Analysts found the same questions produced a different emphasis depending on who the model believed it was speaking to: alarmist for one persona, reassuring for another. AI doesn't necessarily hand you the truth. It hands you a confident, fluent version of what you appear to want to hear.

That is a governance problem, not a technical curiosity. Bring AI into a risk assessment, an incident investigation or a compliance review, ask leading questions, and it may confirm your assumptions, dressed up as analysis and carrying the authority of apparent objectivity. **The tool may become an amplifier for bias.**

So how do you use AI in safety-critical decisions without surrendering your judgement to an algorithm?

## The Four-Test Filter for AI in EHS Decisions

Run any AI output through these four tests before it informs a risk, compliance or governance decision.

### 1. Provenance (Governance)

Can you name where the underlying data came from and its lawful basis? If the model is summarising your monitoring data, consent and retention must be settled before the analysis is trusted.

### 2. Neutrality (Bias)

Re-ask from the opposite stance. If the answer flips, the AI is mirroring you, not informing you. Never ask *"is this control adequate?"*. Ask *"how could this control fail?"*

### 3. Verification (Compliance)

Trace every figure, claim and legal reference to a primary source before it enters a report. **No source, no statement.**

### 4. Accountability (Ownership)

AI advises; a named, competent person decides and signs. **A duty holder cannot be an algorithm.**

---

## The Opportunity Sits With Us

AI is one of the most significant opportunities EHS leaders have ever had. It can compress investigation cycles, surface weak signals in incident data, draft competent first-pass risk assessments and make compliance review faster and more consistent. Used well, it raises the floor of safety performance across an organisation.

The Sanders–Claude interview is not an argument against AI. It is an argument for governance keeping pace with adoption. The technology is ready. The question is whether our frameworks, competence and judgement are ready to deploy it responsibly. That part is on us, and it is exactly where Safety 4.0 leadership earns its place.

---

## References

- Sanders, B. *Bernie vs. Claude*. YouTube, 19 March 2026. [https://www.youtube.com/watch?v=h3AtWdeu_G0](https://www.youtube.com/watch?v=h3AtWdeu_G0)
- Techdirt. *Bernie Sanders "Interviewed" A Chatbot To Expose AI's Secrets. It Just Agrees With You.* 23 March 2026.
- Schneier, B. *Sen. Sanders Talks to Claude About AI and Privacy* (citing Gizmodo's persona-dependent findings). Schneier on Security, April 2026.

---

*AI (Claude Opus 4.7) was used whilst curating parts of this article. All opinions are my own.*
`,
  },
  {
    id: "4",
    slug: "safety-4-academy-soter-ai-partnership",
    title: "SafetyTech Academy × Soter AI: Building AI-Ready Safety Leaders to Leverage AI and SafetyTech",
    metaDescription: "SafetyTech Academy partners with Soter AI, the leading SafetyTech provider, to build AI-ready safety leaders. Discover how this collaboration bridges the gap between AI technology adoption and EHS digital competence for workplace injury prevention.",
    excerpt: "AI is already reshaping workplace safety — from computer vision to predictive risk insights. But one challenge keeps surfacing: safety leaders are expected to use AI without being trained to understand it. That's why SafetyTech Academy has partnered with Soter AI, the leading SafetyTech solution provider.",
    author: "Lucas Domingues",
    authorTitle: "Safety 4.0 Expert, MSc, CMIOSH",
    publishDate: "2026-02-02",
    readTime: "4 min read",
    category: "Partnership",
    tags: ["Soter AI", "SafetyTech Partnership", "AI in Workplace Safety", "EHS Digital Transformation", "Safety Technology", "Injury Prevention", "Predictive Safety", "IOSH Training"],
    featuredImage: "/assets/blog/soter-ai-partnership.png",
    content: `
# SafetyTech Academy × Soter AI

## Building AI-Ready Safety Leaders to Leverage the Power of AI and Tech

AI is already reshaping workplace safety — from computer vision to predictive risk insights. But one challenge keeps surfacing across organisations:

**Safety leaders are expected to use AI without being trained to understand it.** The risks and opportunities often become an afterthought.

That's why the **SafetyTech Academy** has partnered with **Soter AI** — the leading SafetyTech solution provider addressing specific workplace safety challenges, helping organisations prevent injuries, reduce costs, and create safer work environments.

---

## Why This Partnership Matters

**Soter AI** delivers powerful, AI-driven safety technology.

**The SafetyTech Academy** focuses on the missing piece: skills, confidence, and digital fluency for EHS leaders.

Together, we help organisations move from:

- **AI adoption → AI competence**
- **Blind trust → Informed decision-making**
- **Reactive safety → Digitally enabled proactive and predictive insights**

This partnership ensures AI supports safety decisions — **without replacing human judgement**.

---

## From "AI-Powered" to "AI-Ready"

Too often, the technology is ready, but people aren't.

By combining best-in-class AI safety solutions with **IOSH-approved and CPD-certified training**, organisations can:

- ✅ Build confidence in using AI responsibly
- ✅ Reduce resistance and mistrust
- ✅ Strengthen governance and oversight
- ✅ Prepare safety leaders for the realities of modern, tech-enabled workplaces

---

## A Shared Vision

The future of safety isn't just digital.

It's **human-led, digitally fluent, and responsibly enabled by AI**.

This partnership is a clear signal to the market:

**Skills walk hand in hand with software.**

---

## What This Means for You

Whether you're an organisation implementing Soter AI's technology or a safety professional looking to upskill, this partnership ensures you have access to both:

1. **World-class AI safety technology** from Soter AI
2. **Industry-recognised training** from the SafetyTech Academy

Together, we're building a future where technology amplifies human expertise — not replaces it.

[Learn More About Our Partnership →](https://www.linkedin.com/posts/lucas-domingues-msc-cmiosh-49b2b820_today-we-are-announcing-a-partnership-that-activity-7421544969263292418-rANt?utm_source=share&utm_medium=member_desktop&rcm=ACoAAARQy7cBwfgy1YadZSUB14BwnI2VBzl0sQI)
`
  },
  {
    id: "3",
    slug: "ehs-skills-for-2026",
    title: "EHS Skills for 2026: The Upgrade Safety Leaders Need",
    metaDescription: "Discover the essential EHS skills for 2026. Learn how AI literacy, practical prompting, and data confidence are reshaping safety leadership in the digital age.",
    excerpt: "The World Economic Forum expects 39% of key skills to change by 2030. For EHS leaders, this means upgrading core competencies—AI literacy, practical prompting, and data confidence—while keeping safety fundamentals strong.",
    author: "Lucas Domingues",
    authorTitle: "Safety 4.0 Expert, MSc, CMIOSH",
    publishDate: "2026-01-05",
    readTime: "4 min read",
    category: "Safety Leadership",
    tags: ["EHS Skills", "AI Literacy", "Digital Transformation", "Safety Leadership", "Future of Work"],
    featuredImage: "/assets/blog/ehs-skills-2026.jpg",
    content: `
# EHS Skills for 2026: The Upgrade Safety Leaders Need

A new year just got started: new goals and expectations, as usual.

But in EHS, one thing has changed permanently: **the pace of work**. New technologies, new risks, faster decisions, more data, and higher expectations from leadership.

The World Economic Forum's [Future of Jobs Report 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/) is blunt about what's coming: employers expect **39% of key skills to change by 2030**, and AI and big data are among the fastest-growing skills.

For EHS leaders, this doesn't mean abandoning the fundamentals. It means **upgrading them** on top of strong safety foundations.

---

## Why This Matters for Safety

Safety has always been about managing risk in dynamic environments. When technology, processes, and workforce expectations shift, risk shifts too.

EHS leaders who thrive in 2026 will be able to:

- Make faster, better decisions with clearer information
- Use AI responsibly (without blindly trusting outputs)
- Connect safety strategy to business outcomes
- Lead adoption so "digital transformation" actually sticks

---

## The EHS Skill Upgrade Stack for 2026

### 1) AI Literacy (Without the Hype)

You don't need to code. You need to understand:

- **What AI is good for** — drafting, summarising, structuring, pattern spotting
- **Where it fails** — hallucinations, missing context, overconfidence
- **How to verify outputs** — evidence, sources, review steps

This is now a core workplace skill—especially as AI becomes embedded into everyday tools.

---

### 2) Practical Prompting for Real EHS Work

Prompting isn't a party trick. Done properly, it saves time and improves consistency.

**High-value examples:**

- Toolbox talks based on a near miss (draft → reviewed)
- Inspection notes turned into structured reports
- Investigation questions aligned to your process
- First-draft communications for leadership updates

**The rule:** AI drafts, humans decide.

---

### 3) Data Confidence (Leading + Lagging, with Insight)

EHS teams have more data than ever. The gap is converting it into action.

Data confidence means being able to:

- Interpret trends (not just report numbers)
- Strengthen leading indicators (not only lagging outcomes)
- Ask better questions: *What changed? Where? Why now?*

---

## The Point

This isn't about replacing hard-earned skills or your experience. It's about ensuring your expertise **stays effective** in an environment that is transforming rapidly.

The professionals who invest in these capabilities now will be the ones shaping how safety evolves—not reacting to it.

**Your fundamentals are your foundation. These upgrades are your edge.**

[Upgrade Your Skills with Safety 4.0 →](/)
`
  },
  {
    id: "2",
    slug: "3-scholarships-safety-4-academy",
    title: "3 Scholarships to Join the SafetyTech Academy",
    metaDescription: "Apply for one of three scholarships to join the SafetyTech Academy. We're offering 25%, 50%, and 100% funded opportunities for EHS professionals ready to lead in the digital age.",
    excerpt: "At the SafetyTech Academy, we believe the future of safety should be accessible, inclusive, and impact-driven. That's why we're offering three scholarships to support EHS professionals ready to lead in the digital age.",
    author: "Lucas Domingues",
    authorTitle: "Safety 4.0 Expert, MSc, CMIOSH",
    publishDate: "2025-12-15",
    readTime: "3 min read",
    category: "Announcement",
    tags: ["Scholarship", "Safety 4.0", "EHS Training", "Career Development", "Accessibility"],
    featuredImage: "/assets/blog/scholarships-announcement.png",
    content: `
# 3 Scholarships to Join the SafetyTech Academy

At the SafetyTech Academy, we believe the future of safety should be **accessible, inclusive, and impact-driven**. Talent and potential should not be blocked by financial barriers — especially at a time when safety leaders must rapidly upskill in digital, AI, and SafetyTech capabilities.

That is why we are offering **three scholarships** to support EHS professionals ready to lead in the digital age.

---

## The Catalyst Scholarship – 25% Funded

For someone already active in EHS who needs a small push to advance their career and embrace Safety 4.0 principles.

**Perfect for:** Working EHS professionals looking to upskill without the full financial commitment.

---

## The Accelerator Scholarship – 50% Funded

For someone in career transition or facing financial challenges who still wants to invest in their professional development.

**Perfect for:** Career changers, those between roles, or professionals in regions with currency disadvantages.

---

## The Transformation Scholarship – 100% Fully Funded

For someone who dreams of becoming a Safety 4.0 Leader but simply cannot afford the course today.

**Perfect for:** Passionate individuals with genuine financial hardship who demonstrate commitment to safety leadership.

---

## How to Apply

Applying is simple. We ask you to fill out a short application form sharing:

- Your current situation
- Why you want to join the SafetyTech Academy
- How this scholarship would impact your career

**Applications close:** 23rd December 2024

**Award announcement:** 24th December 2024

**[Apply Here](https://tally.so/r/2EX7Bj)**

---

## Why This Matters

Safety is evolving — and so must safety leaders.

These scholarships are about **investing in people**, not just courses, and building a global community of future-ready Safety 4.0 leaders.

We believe that:

- **Talent exists everywhere** — opportunity does not always follow
- **Financial barriers should not block potential**
- **The safety profession needs diverse voices** leading digital transformation
- **Investing in one leader** creates ripple effects across entire organisations

---

## Who Should Apply?

If you:

- Are passionate about safety and protecting people
- Want to understand AI, SafetyTech, and digital transformation
- Are committed to your professional development
- Face genuine financial barriers to enrollment

Then we encourage you to apply.

---

## Spread the Word

If this sounds like you — or someone you know — **apply or share**.

Help us find the next generation of Safety 4.0 leaders who deserve this opportunity.

[Apply for a Scholarship](https://tally.so/r/2EX7Bj)
`
  },
  {
    id: "1",
    slug: "what-is-safety-4-0",
    title: "What Is Safety 4.0? A Practical Guide to the Future of Safety Leadership",
    metaDescription: "Discover what Safety 4.0 means for modern EHS leaders. Learn how digital transformation, AI, and human-centred safety management are reshaping workplace safety.",
    excerpt: "Safety 4.0 is a strategic evolution in how organisations protect people and manage risk. It blends people, process, technology, and data to enable proactive, predictive safety leadership.",
    author: "Lucas Domingues",
    authorTitle: "Safety 4.0 Expert, MSc, CMIOSH",
    publishDate: "2025-12-08",
    readTime: "5 min read",
    category: "Safety Leadership",
    tags: ["Safety 4.0", "Digital Transformation", "EHS Leadership", "Industry 4.0", "SafetyTech"],
    featuredImage: "/assets/blog/safety-4-guide-v2.jpg",
    content: `
# What Is Safety 4.0?

## A Practical Guide to the Future of Safety Leadership in the Digital Age

Over the past decade, organisations around the world have accelerated their digital transformation efforts. Automation, cloud platforms, IoT sensors, wearables, drones, artificial intelligence, and mobile-first workflows have reshaped how companies operate.

Yet in many organisations, safety has not kept pace.

Many EHS teams still rely on manual processes, fragmented data, and reactive decision-making. The result? More admin, less time on the frontline, and a widening digital skills gap.

**Safety 4.0 is the response to this shift** — a modern, human-centred framework that brings the principles of Industry 4.0 into the world of safety, health, and risk management.

In this article, we'll explore what Safety 4.0 really means, why it matters, and how it transforms the role of today's safety leaders.

## Safety 4.0: 90% About People, 10% Tech

Safety 4.0 is not a software tool. It is not an app. And it is not a new set of buzzwords or a manifesto for AI.

**Safety 4.0 is a strategic evolution in how organisations protect people and manage risk.**

It blends four essential pillars:

- **People** – skills, capabilities, digital literacy, and leadership
- **Process** – streamlined workflows, automation, and clarity
- **Technology** – smart tools that enhance (not replace) human expertise
- **Data** – insights that enable proactive and predictive decision-making

Rather than treating safety as an administrative function, Safety 4.0 positions it as a core enabler of performance, resilience, and innovation.

## The Link Between Industry 4.0 and Safety 4.0

Industry 4.0 introduced cyber-physical systems, data connectivity, automation, and intelligent machines. Workplaces are now more complex, more connected, and more dynamic.

But complexity brings new risk.

Safety 4.0 adapts safety practices to this new reality, focusing on:

- Digital workflows instead of paper
- Real-time data instead of lagging indicators
- Predictive analytics instead of firefighting
- Upskilled safety professionals instead of overwhelmed ones

In essence, **if work changes, safety must change with it.**

## Digital Literacy for Safety Leaders

Digital literacy has become a core competency for modern safety leaders, not a technical bonus. As organisations adopt cloud platforms, mobile tools, automation, AI systems, and connected devices, EHS professionals must understand how these technologies work, where they add value, and how to use them responsibly.

This doesn't mean becoming data scientists or software engineers — it means developing confidence in:

- Reading digital information
- Interpreting dashboards
- Using AI tools for documentation and analysis
- Understanding data flows
- Recognising the risks and opportunities of emerging technologies

A digitally literate safety leader can make faster, evidence-based decisions, streamline workflows, reduce administrative burden, and communicate more effectively with technical teams.

Ultimately, **digital literacy empowers safety leaders to stay relevant, lead transformation, and elevate safety from a reactive function to a strategic, data-driven pillar of the organisation.**

## Final Thoughts: Safety 4.0 Is the New Standard

Safety 4.0 represents a shift toward smarter, more connected, and more human-centred safety management.

It empowers organisations to prevent harm more effectively while enabling safety professionals to lead with greater clarity, influence, and impact.

**As workplaces continue to evolve, Safety 4.0 is no longer optional — it is essential.**

[Start Your Safety 4.0 Journey Today →](/)
`
  },
  {
    id: "0",
    slug: "introducing-worlds-first-safety-4-academy",
    title: "Introducing the World's First SafetyTech Academy",
    metaDescription: "Announcing the launch of the SafetyTech Academy and the world's first IOSH-approved SafetyTech and digital transformation course for EHS leaders.",
    excerpt: "Today, I'm proud to officially announce the launch of the SafetyTech Academy and our flagship programme: IOSH-approved Safety 4.0 - Leading Safety in the Digital Age. The world's first dedicated SafetyTech and digital transformation course for EHS leaders.",
    author: "Lucas Domingues",
    authorTitle: "Safety 4.0 Expert, MSc, CMIOSH",
    publishDate: "2025-12-01",
    readTime: "6 min read",
    category: "Announcement",
    tags: ["Safety 4.0", "Academy Launch", "IOSH Approved", "SafetyTech", "Digital Transformation"],
    featuredImage: "/assets/blog/safety-academy-launch.jpg",
    content: `
# Introducing the World's First SafetyTech Academy

## Shaping the Future of EHS, One Leader at a Time

For the past year, I've worked quietly on something I truly believe will redefine how the global EHS community learns, leads, and adapts to a rapidly changing world.

Today, I'm proud to officially announce the launch of the **SafetyTech Academy** and our flagship programme:

**IOSH-approved Safety 4.0 - Leading Safety in the Digital Age**

The world's first dedicated SafetyTech and digital transformation course for EHS leaders, now officially IOSH-approved and CPD-certified.

This isn't another tick-the-box safety course.

It's a practical, modern, accessible roadmap for EHS professionals who want to stay relevant, future-proof their careers, and lead safety with confidence in a digital era.

## Why This Matters Now

Safety is changing faster than most organisations can keep up.

AI, automation, data, cloud, wearables, drones, mobile workflows — these are no longer "future tools." They are being deployed today, reshaping how we prevent incidents, manage risks, and elevate safety performance.

Yet most EHS professionals were never trained for this shift.

This course was built to close that gap. To help safety leaders escape the reactive trap, cut admin overwhelm, and step confidently into a new era of smart, proactive, tech-enabled safety leadership.

## Built with Excellence — Recognised by World EHS Leaders

Getting the course approved by IOSH and accredited for CPD hours means one thing:

✔ **Quality**  
✔ **Professional credibility**  
✔ **A clear stamp of trust**

IOSH approval is not easy to earn — and that's exactly why it matters. It signals that Safety 4.0 is aligned with the highest standards of professional development in our industry.

## What You'll Learn

Inside the programme, learners will gain:

- **A foundational understanding** of AI, SafetyTech, and digital transformation
- **How to use modern tools** (AI, cloud, mobile, drones, wearables, RAG, LLMs, etc.)
- **How to build smarter safety workflows**
- **How to break free from reactive firefighting**
- **How to lead with data, technology, and adaptive intelligence**
- **Real-world case studies** and practical examples
- **Immediate, career-boosting skills** — no technical background required

All in an **8-hour self-paced format** designed for busy EHS professionals.

## Who This Is For

This course is perfect for:

- EHS Managers
- EHS Leads, Directors and VPs
- Safety consultants
- Anyone wanting to upgrade their skills and stay ahead in a digital-first safety world

If you've ever said:

- *"I don't know where to start with AI in safety."*
- *"I feel overwhelmed by new technologies."*
- *"I want to take my career to the next level."*
- *"Our organisation needs to modernise safety."*

Then this course is exactly what you need.

## A New Era of Safety Leadership Starts Today

Safety 4.0 isn't about replacing people with technology.

It's about empowering EHS professionals with the tools, mindset, and confidence to deliver smarter, faster, safer work.

And this course is your starting point.

[Start Your Transformation Today →](/)
`
  }
];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getRecentPosts = (limit: number = 3): BlogPost[] => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit);
};

export const getPostsByCategory = (category: string): BlogPost[] => {
  return blogPosts.filter(post => post.category === category);
};
