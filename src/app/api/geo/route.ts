// Returns the visitor's country as Vercel sees it, so the page can pick Danish or English.
export function GET(request: Request) {
  const country = request.headers.get('x-vercel-ip-country');
  return Response.json({ country }, { headers: { 'Cache-Control': 'private, no-store' } });
}
