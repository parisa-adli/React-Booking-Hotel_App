// Turns one Inside Airbnb listings.csv row into the app's Hotel shape
// (see docs/PRD.md §8.1). Pure functions only, so they are easy to test.

export const REQUIRED_COLUMNS = [
  "id",
  "name",
  "picture_url",
  "latitude",
  "longitude",
  "price",
  "room_type",
  "accommodates",
  "amenities",
  "number_of_reviews",
  "review_scores_rating",
  "availability_365",
];

// Amenity flags used by the filters. Matched case-insensitively against
// the start of each amenity label ("Wifi – 300 Mbps" counts as Wifi).
export const AMENITY_FLAGS = {
  hasWifi: ["wifi"],
  hasKitchen: ["kitchen"],
  hasAirConditioning: ["air conditioning", "central air conditioning", "portable air conditioning"],
  hasWasher: ["washer"],
  hasFreeParking: ["free parking", "free street parking", "free driveway parking"],
  hasWorkspace: ["dedicated workspace"],
};

export function parsePrice(value) {
  if (!value) return null;
  const amount = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null;
}

export function parseNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// Current files use 0–5; the legacy 2017 schema used 0–100.
export function parseRating(value) {
  const rating = parseNumber(value);
  if (rating === null) return null;
  const fiveScale = rating > 5 ? rating / 20 : rating;
  return Math.round(fiveScale * 100) / 100;
}

export function parseAmenities(value) {
  if (!value) return [];
  try {
    const list = JSON.parse(value);
    if (!Array.isArray(list)) return [];
    return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))];
  } catch {
    return [];
  }
}

export function amenityFlags(amenities) {
  const lower = amenities.map((item) => item.toLowerCase());
  const flags = {};
  for (const [flag, keywords] of Object.entries(AMENITY_FLAGS)) {
    flags[flag] = lower.some((item) =>
      keywords.some((keyword) => item.startsWith(keyword))
    );
  }
  return flags;
}

export function stripHtml(value, maxLength = 1200) {
  if (!value) return "";
  const text = String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export function firstName(value) {
  if (!value) return "";
  return String(value).split(/\s+|&|,/)[0].trim();
}

export function normalizeListing(row, city) {
  const amenities = parseAmenities(row.amenities);
  return {
    id: String(row.id),
    name: String(row.name || "").trim(),
    cityId: city.id,
    city: city.name,
    country: city.country,
    countryCode: city.countryCode,
    neighbourhood: row.neighbourhood_cleansed || "",
    latitude: parseNumber(row.latitude),
    longitude: parseNumber(row.longitude),
    imageUrl: row.picture_url || "",
    listingUrl: row.listing_url || "",
    description: stripHtml(row.description),
    propertyType: row.property_type || "",
    roomType: row.room_type || "",
    accommodates: parseNumber(row.accommodates),
    bedrooms: parseNumber(row.bedrooms),
    beds: parseNumber(row.beds),
    bathroomsText: row.bathrooms_text || null,
    amenities,
    ...amenityFlags(amenities),
    price: parsePrice(row.price),
    currency: city.currency,
    rating: parseRating(row.review_scores_rating),
    reviewCount: parseNumber(row.number_of_reviews) ?? 0,
    minimumNights: parseNumber(row.minimum_nights),
    hostName: firstName(row.host_name),
    isSuperhost: row.host_is_superhost === "t",
    snapshotDate: city.snapshotDate,
  };
}

// Selection rules from docs/PRD.md §8.1.
export function isEligible(row) {
  return (
    Boolean(row.picture_url) &&
    parseNumber(row.latitude) !== null &&
    parseNumber(row.longitude) !== null &&
    parsePrice(row.price) !== null &&
    parsePrice(row.price) <= 2000 &&
    (parseNumber(row.number_of_reviews) ?? 0) >= 5 &&
    (parseNumber(row.availability_365) ?? 0) > 0 &&
    parseRating(row.review_scores_rating) !== null
  );
}

// Rating weighted by review volume, so a 5.0 with 6 reviews does not
// outrank a 4.9 with 600.
export function listingScore(row) {
  const rating = parseRating(row.review_scores_rating) ?? 0;
  const reviews = parseNumber(row.number_of_reviews) ?? 0;
  return rating * Math.log10(reviews + 1);
}

export function buildCity(city, hotels) {
  const count = hotels.length;
  const latitude = hotels.reduce((sum, h) => sum + h.latitude, 0) / count;
  const longitude = hotels.reduce((sum, h) => sum + h.longitude, 0) / count;
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    countryCode: city.countryCode,
    currency: city.currency,
    latitude: Math.round(latitude * 1e5) / 1e5,
    longitude: Math.round(longitude * 1e5) / 1e5,
    // An entire home photographs better than a hostel pod or a single room.
    imageUrl:
      (hotels.find((h) => h.roomType === "Entire home/apt") ?? hotels[0])?.imageUrl ?? "",
    listingCount: count,
    snapshotDate: city.snapshotDate,
    sourceUrl: city.sourceUrl,
  };
}
