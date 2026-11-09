import type { RouteBodyEntry as RouteBody } from "../route-bodies";
export const bodies: RouteBody[] = [
  {
    path: "/privacy-policy",
    h1: "Privacy Policy",
    sections: [
      { heading: "", paragraphs: ["Last updated: 4 October 2026"] },
      {
        heading: "Who we are",
        paragraphs: [
          "SafetyTech Academy is a trading name of Shield360 Ltd, a company registered in England and Wales (company number 16266290), registered office 20 Wenlock Road, London, N1 7GU. We are the data controller for the personal data described in this policy and are registered with the UK Information Commissioner's Office (registration ZC036763).",
          "This policy covers our website (safetytech.academy), our learning platform, our live events and our emails. Final assessments and digital credentials are delivered through Syngraph (syngraph.ai), which is also operated by Shield360 Ltd.",
          "Questions or requests about your data: hello@safetytech.academy. We don't have a formal Data Protection Officer; our founder is responsible for data protection.",
        ],
      },
      {
        heading: "What we collect, why, and our lawful basis",
        bullets: [
          "Account: name, email, password (stored only as a secure hash), profile photo, job title and company if you add them",
          "Learning records: enrolments, lesson progress and watch time, quiz and assessment results, certificates",
          "Payments: course, amount, date, Stripe receipt link (we never see or store your card details)",
          "Certificates: your name, course, completion date and certificate number, shown on a public verification page",
          "Community and events: posts, comments, reactions, event registrations",
          "What you type to our AI tutor or website assistant",
          "Enquiries and free assessments: name, email, phone, company, role and your answers",
          "Marketing emails: name and email",
          "Analytics and advertising cookies",
          "Security and error logs: IP address, browser and device details, error reports",
        ],
        paragraphs: [
          "We don't sell your personal data, and we don't use it for decisions that have legal or similarly significant effects on you.",
        ],
      },
      {
        heading: "Who we share it with",
        paragraphs: [
          "We use trusted providers (\"processors\") who handle data for us under contract and only on our instructions:",
          "If you choose to add a certificate to LinkedIn, we send LinkedIn the certificate details you approve. We may also share data where the law requires it, or with professional advisers under confidentiality.",
        ],
        bullets: [
          "Supabase: Database, sign-in and file storage",
          "Vercel: Website and app hosting",
          "Amazon Web Services: Lesson video storage",
          "Stripe: Payments",
          "Resend: Account and course emails (sign-in links, receipts, certificates)",
          "Microsoft 365: Our email inbox",
          "Anthropic: AI tutor and website assistant (your messages are not used to train its models)",
          "Syngraph (Shield360 Ltd): Final assessments and digital credentials",
          "Kajabi, moving to Kit: Newsletter and marketing emails",
          "Zoom: Live webinars and roundtables, if you join one",
          "Google, LinkedIn, Meta, OpenAI: Analytics and ad measurement, only if you accept these cookies",
          "Trustpilot, YouTube, Vimeo: Review widget and embedded videos",
        ],
      },
      {
        heading: "International transfers",
        paragraphs: [
          "Some providers are based in, or access data from, the United States. Where that happens we rely on the UK–US Data Bridge (for certified companies) or on the UK International Data Transfer Addendum to the EU Standard Contractual Clauses, which require the provider to protect your data to UK standards.",
        ],
      },
      {
        heading: "How long we keep your data",
        bullets: [
          "Your account, learning records and community content: While your account is open. Deleted when you delete your account",
          "Certificates: Kept so they stay verifiable, even after you delete your account, unless you ask us to remove them",
          "Payment records: 6 years, as required by UK tax law",
          "Enquiries and free-assessment results: 3 years after our last contact",
          "Website assistant conversations: 24 months after the last message",
          "Website analytics: 26 months",
          "Error reports: 90 days",
          "Encrypted backups: Up to 14 days, then overwritten",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Under UK and EU GDPR you can:",
          "Learners can do the most common requests themselves: in the learning platform, go to Settings, then Your data, to download everything we hold about you or to delete your account. For anything else, email hello@safetytech.academy. We'll reply within one month.",
          "If you're unhappy with how we've handled your data, please tell us first. You also have the right to complain to the Information Commissioner's Office: ico.org.uk/make-a-complaint or 0303 123 1113.",
        ],
        bullets: [
          "get a copy of your data, and receive it in a portable format",
          "correct anything that's wrong",
          "have your data deleted",
          "restrict or object to how we use it, including for marketing",
          "withdraw consent at any time (for example, via Cookie settings or the unsubscribe link in any email)",
          "ask for a person to review an assessment result that was scored automatically",
        ],
      },
      {
        heading: "How we protect it",
        paragraphs: [
          "Data is encrypted in transit, access to the database is restricted row by row so learners can only reach their own records, administrative access is limited to the academy's administrators, payments are handled entirely by Stripe, and backups are encrypted. No system is perfectly secure, but if a breach ever affected your data, we would tell you and the ICO where the law requires.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We only use analytics and advertising cookies if you agree. See our Cookies Policy for the full list, and change your choice at any time with Cookie settings.",
        ],
      },
      {
        heading: "Children",
        paragraphs: ["Our courses are for working professionals. We don't knowingly collect data from anyone under 18."],
      },
      {
        heading: "Changes to this policy",
        paragraphs: [
          "We'll update this page when our practices change and change the date at the top. If a change is significant, we'll let account holders know by email.",
        ],
      },
    ],
  },
  {
    path: "/terms-conditions",
    h1: "Terms & Conditions",
    sections: [
      { heading: "", paragraphs: ["Last updated: April 2026"] },
      {
        heading: "1. Introduction and Acceptance",
        paragraphs: [
          "SafetyTech Academy is a product owned and operated by Shield360 Ltd, company number 16266290, registered in England.",
          "These Terms and Conditions (\"Terms\") govern your use of SafetyTech Academy's website, courses, and services. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access our services.",
        ],
      },
      {
        heading: "2. Definitions",
        bullets: [
          "\"Platform\" refers to SafetyTech Academy's website and learning management system",
          "\"Services\" include all courses, materials, certifications, and related offerings",
          "\"User\" or \"You\" refers to the individual or entity accessing our services",
          "\"Content\" means all materials, videos, documents, and resources provided through the Platform",
        ],
      },
      { heading: "3. Account Registration and Eligibility" },
      {
        heading: "3.1 Eligibility",
        paragraphs: ["You must be at least 18 years old to use our services. By registering, you represent that you meet this age requirement."],
      },
      {
        heading: "3.2 Account Creation",
        paragraphs: ["You agree to:"],
        bullets: [
          "Provide accurate, current, and complete information",
          "Maintain the security of your password and account",
        ],
      },
      {
        heading: "3.3 Account Restrictions",
        paragraphs: ["You may not:"],
        bullets: ["Share your account credentials with others", "Create multiple accounts for fraudulent purposes"],
      },
      { heading: "4. Course Enrollment and Access" },
      {
        heading: "4.1 Course Purchase",
        paragraphs: [
          "When you enroll in a course, you are purchasing a personal, non-transferable license to access the course materials for the duration specified at the time of purchase.",
        ],
      },
      {
        heading: "4.2 Access Duration",
        paragraphs: [
          "Upon enrolment, you are granted lifetime access to the platform and community, however you have 90 days to complete the eLearning. This means you must access and complete the course within the 90-day period, subject to the Platform remaining operational.",
        ],
      },
      {
        heading: "4.3 Platform Availability",
        paragraphs: ["While we strive for 99.9% uptime, we do not guarantee uninterrupted access."],
      },
      { heading: "5. Payment and Pricing" },
      {
        heading: "5.1 Pricing",
        paragraphs: [
          "All prices are displayed in the currency indicated at the time of purchase. Prices are subject to change without notice, but changes will not affect existing enrollments.",
        ],
      },
      {
        heading: "5.2 Payment Processing",
        paragraphs: ["Payments are processed securely through third-party payment processors."],
      },
      {
        heading: "5.3 Taxes",
        paragraphs: ["You are responsible for any applicable taxes, duties, or other governmental charges."],
      },
      { heading: "6. Refund and Cancellation Policy" },
      {
        heading: "6.1 Refund Eligibility",
        paragraphs: [
          "Self-paced online courses come with a 7-day money-back guarantee from the date of purchase, provided you have not completed more than 20% of the course content or obtained certification. Guarantee terms for live cohort programmes are stated on each programme page.",
        ],
      },
      {
        heading: "6.2 Refund Process",
        paragraphs: [
          "To request a refund, contact us at hello@safetytech.academy with your order details. Refunds are processed within 10-14 business days.",
        ],
      },
      {
        heading: "6.3 Non-Refundable Items",
        bullets: [
          "Completed courses with issued certificates",
          "Promotional or discounted courses (unless required by law)",
          "Corporate or bulk licenses",
          "Live and in-person training, including bespoke in-company sessions. Refund and cancellation terms for these are agreed in writing before the session is confirmed",
        ],
      },
      { heading: "7. Intellectual Property Rights" },
      {
        heading: "7.1 Ownership",
        paragraphs: [
          "All Content, trademarks, logos, and intellectual property on the Platform are owned by or licensed to SafetyTech Academy. This includes course materials, videos, assessments, and documentation.",
        ],
      },
      {
        heading: "7.2 Limited License",
        paragraphs: ["We grant you a limited, non-exclusive, non-transferable license to:"],
        bullets: [
          "Access and view course materials for personal educational purposes",
          "Download materials explicitly marked as downloadable",
        ],
      },
      {
        heading: "7.3 Restrictions",
        paragraphs: ["You may not:"],
        bullets: ["Copy, reproduce, or distribute course materials", "Modify, adapt, or create derivative works"],
      },
      { heading: "8. Certification and Accreditation" },
      {
        heading: "8.1 Certification Requirements",
        paragraphs: [
          "To receive certification, you must complete all required course modules, pass assessments with the minimum required scores, and comply with all academic integrity policies.",
        ],
      },
      {
        heading: "8.2 Certificate Validity",
        paragraphs: [
          "Certificates are issued by IOSH and CPD. Certificate validity and renewal requirements are specified in the course materials.",
        ],
      },
      {
        heading: "8.3 Certificate Revocation",
        paragraphs: [
          "We reserve the right to revoke certificates if we discover academic misconduct, violation of Terms, or misrepresentation of credentials.",
        ],
      },
      {
        heading: "9. User Conduct and Prohibited Activities",
        paragraphs: ["You agree not to:"],
        bullets: ["Violate any applicable laws or regulations", "Infringe on intellectual property rights"],
      },
      { heading: "10. Disclaimers and Limitations of Liability" },
      {
        heading: "10.1 Educational Purpose",
        paragraphs: [
          "Our courses are for educational purposes only. While we strive for accuracy, we do not guarantee that course content is error-free, current, or complete.",
        ],
      },
      {
        heading: "10.2 Career Outcomes",
        paragraphs: [
          "We do not guarantee specific career outcomes, job placement, salary increases, or promotions as a result of completing our courses.",
        ],
      },
      {
        heading: "10.3 Limitation of Liability",
        paragraphs: [
          "Our total liability shall not exceed the amount you paid for the specific course or service.",
        ],
      },
      {
        heading: "11. Indemnification",
        paragraphs: [
          "You agree to indemnify, defend, and hold harmless SafetyTech Academy, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your violation of these Terms or misuse of the Platform.",
        ],
      },
      { heading: "12. Termination" },
      {
        heading: "12.1 Termination by You",
        paragraphs: [
          "You may terminate your account at any time by contacting us. Termination does not entitle you to a refund unless within the refund period specified in Section 6.",
        ],
      },
      {
        heading: "12.2 Termination by Us",
        paragraphs: ["We may suspend or terminate your access immediately if you:"],
        bullets: ["Violate these Terms or our policies", "Engage in fraudulent or illegal activities"],
      },
      {
        heading: "12.3 Effect of Termination",
        paragraphs: ["Upon termination, your right to access the Platform and Content immediately ceases."],
      },
      {
        heading: "13. Privacy and Data Protection",
        paragraphs: [
          "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal data in compliance with GDPR and other applicable laws.",
        ],
      },
      {
        heading: "14. Changes to Terms",
        paragraphs: [
          "We reserve the right to modify these Terms at any time. We will notify you of material changes via email or Platform notification.",
        ],
      },
      { heading: "15. Governing Law and Dispute Resolution" },
      {
        heading: "15.1 Governing Law",
        paragraphs: [
          "These Terms are governed by and construed in accordance with the laws of England and Wales, without regard to conflict of law principles.",
        ],
      },
      {
        heading: "15.2 Dispute Resolution",
        paragraphs: [
          "Any disputes arising from these Terms shall first be attempted to be resolved through good-faith negotiation.",
        ],
      },
      { heading: "16. Miscellaneous Provisions" },
      {
        heading: "16.1 Entire Agreement",
        paragraphs: [
          "These Terms, together with our Privacy Policy and other referenced policies, constitute the entire agreement between you and SafetyTech Academy.",
        ],
      },
      {
        heading: "16.2 Severability",
        paragraphs: [
          "If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.",
        ],
      },
      {
        heading: "16.3 Waiver",
        paragraphs: [
          "Our failure to enforce any right or provision shall not constitute a waiver of future enforcement of that right or provision.",
        ],
      },
      {
        heading: "16.4 Assignment",
        paragraphs: ["You may not assign or transfer these Terms without our written consent."],
      },
      {
        heading: "17. Contact Information",
        paragraphs: ["For questions about these Terms, please contact us:", "Email: hello@safetytech.academy"],
      },
    ],
  },
  {
    path: "/cookies-policy",
    h1: "Cookies Policy",
    sections: [
      { heading: "", paragraphs: ["Last updated: 4 October 2026"] },
      {
        heading: "The short version",
        paragraphs: [
          "Cookies are small files a website stores in your browser; \"local storage\" works in a similar way. We use the ones needed to run the site, and we only use analytics and advertising cookies if you say yes in our cookie banner. Inside the learning platform we use no analytics or advertising trackers at all.",
          "This policy is part of our Privacy Policy. SafetyTech Academy is a trading name of Shield360 Ltd.",
        ],
      },
      {
        heading: "Essential (always on)",
        paragraphs: [
          "Needed for sign-in, security and remembering your cookie choice. These can't be switched off. Payments happen on Stripe's own secure page, which has its own cookie policy.",
        ],
        bullets: [
          "sb-…-auth-token — SafetyTech Academy (Supabase) — Keeps you signed in to the learning platform (local storage) — Until you sign out",
          "stc-consent-v1 — SafetyTech Academy — Remembers your cookie choice (local storage) — Until you change it",
          "_vcrcs — Vercel — Security check that protects the site from automated attacks — Up to 1 hour",
        ],
      },
      {
        heading: "Analytics (only with your consent)",
        paragraphs: [
          "Help us understand which pages are useful. Turned on only if you choose Accept all, or Analytics in Customise.",
          "If you don't accept, we still count the visit itself, without any cookie or other storage on your device: the page, your device type and browser, and a one-way scrambled daily code that can't be traced back to you. We don't store your IP address.",
        ],
        bullets: [
          "_ga, _ga_* — Google Analytics (via Google Tag Manager) — Counts visits and how the site is used — 2 years",
          "analytics_session_id — SafetyTech Academy — Groups page views in one visit for our own statistics (session storage) — Until you close the tab",
        ],
      },
      {
        heading: "Marketing (only with your consent)",
        paragraphs: [
          "Measure whether our adverts work and show relevant ads on other sites. Turned on only if you choose Accept all, or Marketing in Customise.",
        ],
        bullets: [
          "li_sugr, bcookie, lidc, UserMatchHistory, AnalyticsSyncHistory — LinkedIn Insight Tag — Ad measurement and retargeting on LinkedIn — Up to 1 year",
          "_fbp — Meta Pixel — Ad measurement and retargeting on Facebook and Instagram — 3 months",
          "_gcl_* — Google Ads (via Google Tag Manager) — Ad conversion measurement, when a Google Ads campaign is running — 3 months",
          "oaiq identifiers — OpenAI conversion pixel — Measures sign-ups and purchases from our ads — Up to 1 year",
        ],
      },
      {
        heading: "Embedded content",
        bullets: [
          "YouTube videos use YouTube's privacy-enhanced mode: nothing is stored until you press play, after which YouTube may set its own cookies.",
          "Vimeo lesson videos may set a cookie needed for playback.",
          "Trustpilot loads our reviews widget from Trustpilot's servers.",
        ],
      },
      {
        heading: "Changing your mind",
        paragraphs: [
          "Use Cookie settings (also in the footer of every page) to change your choice at any time. If you switch something off, we reload the page so it stops straight away. You can also delete cookies in your browser settings.",
          "Questions: hello@safetytech.academy.",
        ],
      },
    ],
  },
  {
    path: "/anti-piracy-policy",
    h1: "Anti-Piracy Policy",
    sections: [
      { heading: "", paragraphs: ["Last updated: October 2025"] },
      {
        heading: "Protection of Intellectual Property",
        paragraphs: [
          "SafetyTech Academy is committed to protecting its intellectual property rights. All course materials, videos, documents, assessments, and content are protected by copyright and other intellectual property laws.",
        ],
      },
      {
        heading: "Prohibited Activities",
        paragraphs: ["The following activities are strictly prohibited:"],
        bullets: [
          "Unauthorized copying, distribution, or sharing of course materials",
          "Recording, downloading, or screen capturing course videos without permission",
          "Sharing login credentials with unauthorized users",
          "Reselling, redistributing, or commercially exploiting course content",
          "Creating derivative works based on our proprietary content",
          "Using our content for competitive purposes",
        ],
      },
      {
        heading: "Detection and Enforcement",
        paragraphs: ["We employ advanced technologies to detect and prevent unauthorized use of our content, including:"],
        bullets: [
          "Digital watermarking and tracking systems",
          "Account activity monitoring",
          "Automated piracy detection tools",
          "Regular audits of content distribution",
        ],
      },
      {
        heading: "Consequences of Violation",
        paragraphs: ["Violations of this policy will result in:"],
        bullets: [
          "Immediate termination of account access",
          "Forfeiture of all paid fees without refund",
          "Legal action seeking damages and injunctive relief",
          "Reporting to relevant authorities and platforms",
          "Potential criminal prosecution under applicable laws",
        ],
      },
      {
        heading: "Reporting Piracy",
        paragraphs: [
          "If you become aware of any unauthorized use or distribution of SafetyTech Academy content, please report it immediately to hello@safetytech.academy.",
        ],
      },
      {
        heading: "Legal Rights",
        paragraphs: [
          "SafetyTech Academy reserves all rights under copyright law and will pursue all available legal remedies against individuals or organizations that violate this policy. This includes but is not limited to statutory damages, actual damages, legal fees, and injunctive relief.",
        ],
      },
    ],
  },
];
