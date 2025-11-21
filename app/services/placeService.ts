// Lightweight place suggestion service using Nominatim (OpenStreetMap)
// Note: Nominatim is free but has usage policies and rate limits. For production
// apps prefer Google Places or a paid geocoding provider.

export type PlaceSuggestion = {
  display_name: string;
  parts: string[]; // important address parts (street, district, city)
};

export async function fetchPlaceSuggestions(
  query: string
): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
      query
    )}&countrycodes=vn`;

    const res = await fetch(url, {
      headers: {
        // Provide a User-Agent per Nominatim usage policy
        "User-Agent": "BurgerApp-Student/1.0 (student@example.com)",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    // Build structured suggestions with prioritized parts
    return data.map((item: any) => {
      const addr = item.address || {};

      // Attempt to get the most relevant street/number field
      const house = addr.house_number || "";
      const road = addr.road || addr.pedestrian || addr.footway || "";
      const street = [house, road].filter(Boolean).join(" ").trim();

      // District / suburb
      const district =
        addr.suburb ||
        addr.city_district ||
        addr.county ||
        addr.neighbourhood ||
        "";

      // City / province
      const city = addr.city || addr.town || addr.village || addr.state || "";

      const parts = [street, district, city].filter((p) => p && p.length > 0);

      return {
        display_name: String(item.display_name || "").trim(),
        parts,
      } as PlaceSuggestion;
    });
  } catch (e) {
    console.warn("Place suggestions error:", e);
    return [];
  }
}
