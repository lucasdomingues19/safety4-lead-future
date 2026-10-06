import badgeAi from "@/assets/badge-ai-fundamentals.png";
import badgeCopilot from "@/assets/badge-copilot.png";
import badgeSafety4 from "@/assets/safety-4.0-badge-cert.png";

const SITE = "https://www.safetytech.academy";

export interface CourseMeta { badge: string | null; landing: string }

/** Badge artwork and public page for a course (matched on its title/slug). */
export function courseMeta(courseTitle: string, slug = ""): CourseMeta {
  const k = `${courseTitle} ${slug}`.toLowerCase();
  if (/ai fundamentals|fundamentals of ai/.test(k)) return { badge: badgeAi, landing: `${SITE}/ai-fundamentals` };
  if (/copilot/.test(k)) return { badge: badgeCopilot, landing: `${SITE}/copilot-for-ehs` };
  if (/safety 4\.0|safety-4-0|iosh/.test(k)) return { badge: badgeSafety4, landing: `${SITE}/elearning` };
  return { badge: null, landing: `${SITE}/courses` };
}

/** The suggested LinkedIn post: the learner can edit it before posting. */
export function linkedInPostText(courseTitle: string, verifyUrl: string, landing: string): string {
  return [
    `I've just completed "${courseTitle}" with SafetyTech Academy. 🎓`,
    "",
    "Practical, hands-on learning for EHS professionals who want to lead the digital shift in safety.",
    "",
    `✅ My verified credential: ${verifyUrl}`,
    `📚 Learn more: ${landing}`,
    "",
    "#SafetyTech #EHS #Safety40 #ProfessionalDevelopment",
  ].join("\n");
}

/** Opens LinkedIn's composer with the post text filled in. */
export const linkedInPostUrl = (text: string) => `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;

/** Opens LinkedIn's "add licence or certification" form with the credential filled in. */
export function linkedInAddToProfileUrl(courseTitle: string, verifyUrl: string, certNumber?: string): string {
  const d = new Date();
  const p = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: courseTitle,
    organizationName: "SafetyTech Academy",
    issueYear: String(d.getFullYear()),
    issueMonth: String(d.getMonth() + 1),
    certUrl: verifyUrl,
  });
  if (certNumber) p.set("certId", certNumber);
  return `https://www.linkedin.com/profile/add?${p.toString()}`;
}
