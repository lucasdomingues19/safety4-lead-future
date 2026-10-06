// Helpers for outgoing mail. Spam filters score HTML-only email worse, so every
// message also carries a plain-text part derived from the HTML.

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Plain-text version of one of our HTML emails: links keep their URL. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, "")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, label) => {
      const text = String(label).replace(/<[^>]+>/g, "").trim();
      return text && !text.includes(href) ? `${text}: ${href}` : href;
    })
    .replace(/<\/(p|h1|h2|h3|tr|div|li)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Resend allows ~2 requests a second per team: wait and retry once on a 429. */
export async function resendSend(apiKey: string, payload: Record<string, unknown>): Promise<Response> {
  const post = () => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let res = await post();
  if (res.status === 429) {
    await sleep(1200);
    res = await post();
  }
  return res;
}
