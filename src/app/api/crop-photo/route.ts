import { NextRequest } from "next/server";

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

/**
 * Serves a single produce photo URL for a given crop, proxied from the Pexels
 * API. The API key lives only on the server via `PEXELS_API_KEY` and is never
 * shipped to the client — the browser talks to this endpoint instead.
 *
 * Non-2xx / missing-key responses deliberately still return a JSON body so the
 * client can fall back to an emoji instead of rendering a broken image.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query) {
    return Response.json({ error: "Missing 'query' parameter" }, { status: 400 });
  }

  if (!process.env.PEXELS_API_KEY) {
    return Response.json(
      { error: "PEXELS_API_KEY is not configured" },
      { status: 501 }
    );
  }

  try {
    const res = await fetch(
      `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: { Authorization: process.env.PEXELS_API_KEY },
        next: { revalidate: 3600 }, // 1h upstream cache in dev/server memory
      }
    );

    if (!res.ok) {
      return Response.json(
        { error: `Pexels API responded with ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const photo = data.photos?.[0];

    if (!photo) {
      return Response.json({ error: "No photo found for this crop" }, { status: 404 });
    }

    return Response.json({
      url: photo.src?.medium ?? photo.src?.original,
      photographer: photo.photographer ?? null,
    });
  } catch {
    return Response.json(
      { error: "Upstream Pexels request failed" },
      { status: 503 }
    );
  }
}