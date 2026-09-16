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
    // Provide deterministic high-quality fallbacks to prevent 501 errors and broken UI
    const queryLower = query.toLowerCase();

    // Curated high-quality Unsplash fallbacks for common Indian crops
    const fallbacks: Record<string, string> = {
      tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80",
      onion: "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=800&q=80",
      potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80",
      wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
      rice: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=800&q=80",
      soybean: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
      chilli: "https://images.unsplash.com/photo-1588047917849-0d196f7c8ec1?w=800&q=80",
      cotton: "https://images.unsplash.com/photo-1594142419139-4ceb15cb264b?w=800&q=80",
      sugarcane: "https://images.unsplash.com/photo-1549449856-1891b01df604?w=800&q=80",
      maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80"
    };

    let fallbackUrl = null;

    // Exact or partial match
    for (const [key, url] of Object.entries(fallbacks)) {
      if (queryLower.includes(key)) {
        fallbackUrl = url;
        break;
      }
    }

    if (fallbackUrl) {
      return Response.json({
        url: fallbackUrl,
        photographer: "Unsplash"
      });
    }

    // Still return 200 for unknowns so we don't spam 501s, just without a URL (triggering emoji fallback)
    return Response.json({
      error: "PEXELS_API_KEY is not configured and no fallback exists for this crop",
      fallback: true
    }, { status: 200 });
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