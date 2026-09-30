// Points, levels, streaks and badges. All numbers come from the database
// (get_my_gamification / get_leaderboard / get_member_badges), which derives
// them from real activity; this file only holds display metadata.
import { supabase } from "@/integrations/supabase/client";

export const LEVELS: Record<number, { name: string; emoji: string; bg: string; fg: string }> = {
  1: { name: "Observer", emoji: "👀", bg: "#f1f5f9", fg: "#475569" },
  2: { name: "Practitioner", emoji: "🦺", bg: "#e8e8ff", fg: "#3434ff" },
  3: { name: "Specialist", emoji: "🧠", bg: "#ece9ff", fg: "#2c23d2" },
  4: { name: "Champion", emoji: "🏆", bg: "#f2fcd9", fg: "#3f6212" },
  5: { name: "Leader", emoji: "🌟", bg: "#202058", fg: "#9eff1f" },
};
export const levelByName = (name?: string | null) =>
  Object.entries(LEVELS).find(([, l]) => l.name === name)?.[1] ?? LEVELS[1];

export const BADGES = [
  { id: "first-steps", name: "First Steps", emoji: "👣", hint: "Complete your first lesson" },
  { id: "on-a-roll", name: "On a Roll", emoji: "🔥", hint: "Learn 3 days in a row" },
  { id: "unstoppable", name: "Unstoppable", emoji: "⚡", hint: "Learn 7 days in a row" },
  { id: "quiz-ace", name: "Quiz Ace", emoji: "🎯", hint: "Score 100% on a module quiz" },
  { id: "course-complete", name: "Course Complete", emoji: "🎓", hint: "Finish a course" },
  { id: "certified", name: "Certified", emoji: "📜", hint: "Earn a certificate" },
  { id: "community-voice", name: "Community Voice", emoji: "💬", hint: "Post in the community" },
  { id: "helpful", name: "Helpful", emoji: "🙌", hint: "Get 10 reactions on your posts" },
  { id: "network-member", name: "Network Member", emoji: "🌐", hint: "Join the SafetyTech Global Network" },
] as const;
export type BadgeId = (typeof BADGES)[number]["id"];

export const POINT_RULES = [
  { label: "Lesson completed", points: 10 },
  { label: "Module quiz passed", points: 50 },
  { label: "Perfect quiz score", points: 25 },
  { label: "Course completed", points: 100 },
  { label: "Final assessment passed", points: 200 },
  { label: "Community post (up to 3 a day)", points: 5 },
  { label: "Reply (up to 10 a day)", points: 2 },
  { label: "Each person who reacts to your post", points: 1 },
];

export interface MyGamification {
  points: number;
  level: number;
  level_name: string;
  level_floor: number;
  next_level_points: number | null;
  streak: number;
  longest_streak: number;
  breakdown: Record<string, number>;
  badges: Record<BadgeId, boolean>;
}

export const getMyGamification = async (): Promise<MyGamification | null> => {
  const { data, error } = await supabase.rpc("get_my_gamification");
  if (error) { console.warn("gamification", error.message); return null; }
  return data as unknown as MyGamification;
};

export interface MemberBadge { user_id: string; level: number; level_name: string; network_member: boolean }
export const getMemberBadges = async (ids: string[]): Promise<Record<string, MemberBadge>> => {
  const unique = [...new Set(ids)].slice(0, 200);
  if (!unique.length) return {};
  const { data } = await supabase.rpc("get_member_badges", { _ids: unique });
  return Object.fromEntries(((data ?? []) as unknown as MemberBadge[]).map((b) => [b.user_id, b]));
};

/** Compare with what this browser last showed, to celebrate new levels and badges once. */
const SEEN_KEY = "lms-gamification-seen";
export const diffSinceLastSeen = (g: MyGamification) => {
  let seen: { level: number; badges: string[] } | null = null;
  try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "null"); } catch { /* ignore */ }
  const earned = BADGES.filter((b) => g.badges[b.id]).map((b) => b.id as string);
  try { localStorage.setItem(SEEN_KEY, JSON.stringify({ level: g.level, badges: earned })); } catch { /* ignore */ }
  if (!seen) return { levelUp: false, newBadges: [] as string[] }; // first visit: nothing to celebrate retroactively
  return { levelUp: g.level > seen.level, newBadges: earned.filter((b) => !seen!.badges.includes(b)) };
};
