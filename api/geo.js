// Returns the visitor's country code from Vercel's own edge header, so a visit can
// be attributed to a country without sending anyone's IP to a third party.
export const config = { runtime: "edge" };

export default function handler(request) {
  const country = request.headers.get("x-vercel-ip-country") || "";
  return new Response(JSON.stringify({ country }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
