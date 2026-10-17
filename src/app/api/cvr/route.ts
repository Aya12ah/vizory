// Looks up a Danish company by its CVR number in CVR API (cvrapi.dk), for the get-started form: it
// fills in the company name and shows the registered address, so the visitor can see it is the
// right company. Called from the server, as CVR API asks every caller to name itself in the
// User-Agent, which a browser cannot set. The free service allows few lookups a day, so an answer
// is kept in Vercel's cache for a day: the same number is looked up only once.
export async function GET(request: Request) {
  const cvr = (new URL(request.url).searchParams.get('q') ?? '').replace(/\s/g, '');
  if (!/^\d{8}$/.test(cvr)) return Response.json({ error: 'cvr' }, { status: 400 });
  try {
    const r = await fetch(`https://cvrapi.dk/api?search=${cvr}&country=dk`, {
      headers: { 'User-Agent': 'vizory.dk - get-started form' },
      signal: AbortSignal.timeout(5000),
    });
    const d = r.ok ? await r.json() : null;
    if (!d || d.error || !d.name) {
      // NOT_FOUND is an answer worth keeping; anything else (the quota, a fault) is not.
      const notFound = d?.error === 'NOT_FOUND' || r.status === 404;
      return Response.json({ error: notFound ? 'not-found' : 'unavailable' }, { status: notFound ? 404 : 503, headers: { 'Cache-Control': notFound ? 'public, s-maxage=86400' : 'no-store' } });
    }
    const place = [d.address, [d.zipcode, d.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    return Response.json({ name: String(d.name), place, ended: !!d.enddate }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } });
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
