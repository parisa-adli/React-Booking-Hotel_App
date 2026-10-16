// Search state <-> URL <-> json-server 0.17 query mapping, plus display
// formatters. Pure functions: covered by src/services/hotels.test.js.

import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export const PAGE_SIZE = 12;
export const MAX_GUESTS = 16;

export const ROOM_TYPES = [
  "Entire home/apt",
  "Private room",
  "Hotel room",
  "Shared room",
];

export const RATING_OPTIONS = [
  { value: null, label: "Any" },
  { value: 4, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
  { value: 4.8, label: "4.8+" },
];

export const AMENITIES = [
  { id: "wifi", field: "hasWifi", label: "Wi-Fi" },
  { id: "kitchen", field: "hasKitchen", label: "Kitchen" },
  { id: "ac", field: "hasAirConditioning", label: "Air conditioning" },
  { id: "washer", field: "hasWasher", label: "Washer" },
  { id: "parking", field: "hasFreeParking", label: "Free parking" },
  { id: "workspace", field: "hasWorkspace", label: "Dedicated workspace" },
];

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended", sort: "reviewCount", order: "desc" },
  { value: "price_asc", label: "Price: low to high", sort: "price", order: "asc" },
  { value: "price_desc", label: "Price: high to low", sort: "price", order: "desc" },
  { value: "rating", label: "Top rated", sort: "rating,reviewCount", order: "desc,desc" },
];

const DATE_FORMAT = "yyyy-MM-dd";

function toInt(value, fallback, min, max) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

function toPositiveNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function toIsoDate(value) {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : new Date(value);
  return isValid(date) ? format(date, DATE_FORMAT) : null;
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const DEFAULT_SEARCH = {
  city: null,
  checkIn: null,
  checkOut: null,
  adults: 1,
  children: 0,
  minPrice: null,
  maxPrice: null,
  types: [],
  rating: null,
  amenities: [],
  sort: "recommended",
  page: 1,
};

// Reads the app URL. Also accepts the legacy `destination`, `date` and
// `options` params written by earlier versions of the header.
export function parseSearchParams(searchParams) {
  const params = new URLSearchParams(searchParams);
  const search = { ...DEFAULT_SEARCH };

  search.city = params.get("city") || (params.get("destination") ? slugify(params.get("destination")) : null) || null;

  const legacyDate = safeJson(params.get("date"));
  search.checkIn = toIsoDate(params.get("checkIn") ?? legacyDate?.[0]?.startDate);
  search.checkOut = toIsoDate(params.get("checkOut") ?? legacyDate?.[0]?.endDate);
  if (search.checkIn && search.checkOut && search.checkOut <= search.checkIn) {
    search.checkOut = null;
  }

  const legacyOptions = safeJson(params.get("options"));
  search.adults = toInt(params.get("adults") ?? legacyOptions?.Adult, 1, 1, MAX_GUESTS);
  search.children = toInt(params.get("children") ?? legacyOptions?.children, 0, 0, MAX_GUESTS - search.adults);

  search.minPrice = toPositiveNumber(params.get("minPrice"));
  search.maxPrice = toPositiveNumber(params.get("maxPrice"));
  if (search.minPrice !== null && search.maxPrice !== null && search.minPrice > search.maxPrice) {
    [search.minPrice, search.maxPrice] = [search.maxPrice, search.minPrice];
  }

  search.types = params.getAll("type").filter((type) => ROOM_TYPES.includes(type));
  const rating = Number(params.get("rating"));
  search.rating = RATING_OPTIONS.some((option) => option.value === rating) ? rating : null;
  const amenityIds = AMENITIES.map((amenity) => amenity.id);
  search.amenities = [...new Set(params.getAll("amenity"))].filter((id) => amenityIds.includes(id));

  const sort = params.get("sort");
  search.sort = SORT_OPTIONS.some((option) => option.value === sort) ? sort : "recommended";
  search.page = toInt(params.get("page"), 1, 1, 10000);

  return search;
}

// Writes search state back to the app URL, leaving out defaults.
export function toSearchParams(search) {
  const params = new URLSearchParams();
  const s = { ...DEFAULT_SEARCH, ...search };
  if (s.city) params.set("city", s.city);
  if (s.checkIn) params.set("checkIn", s.checkIn);
  if (s.checkOut) params.set("checkOut", s.checkOut);
  if (s.adults !== 1) params.set("adults", String(s.adults));
  if (s.children) params.set("children", String(s.children));
  if (s.minPrice !== null) params.set("minPrice", String(s.minPrice));
  if (s.maxPrice !== null) params.set("maxPrice", String(s.maxPrice));
  s.types.forEach((type) => params.append("type", type));
  if (s.rating !== null) params.set("rating", String(s.rating));
  s.amenities.forEach((id) => params.append("amenity", id));
  if (s.sort !== "recommended") params.set("sort", s.sort);
  if (s.page > 1) params.set("page", String(s.page));
  return params;
}

// Builds the json-server 0.17 query string for GET /hotels.
export function buildHotelQuery(search, { pageSize = PAGE_SIZE } = {}) {
  const s = { ...DEFAULT_SEARCH, ...search };
  const query = new URLSearchParams();
  if (s.city) query.set("cityId", s.city);
  const guests = s.adults + s.children;
  if (guests > 1) query.set("accommodates_gte", String(guests));
  if (s.minPrice !== null) query.set("price_gte", String(s.minPrice));
  if (s.maxPrice !== null) query.set("price_lte", String(s.maxPrice));
  s.types.forEach((type) => query.append("roomType", type));
  if (s.rating !== null) query.set("rating_gte", String(s.rating));
  s.amenities.forEach((id) => {
    const amenity = AMENITIES.find((item) => item.id === id);
    if (amenity) query.set(amenity.field, "true");
  });
  const sort = SORT_OPTIONS.find((option) => option.value === s.sort) ?? SORT_OPTIONS[0];
  query.set("_sort", sort.sort);
  query.set("_order", sort.order);
  query.set("_page", String(s.page));
  query.set("_limit", String(pageSize));
  return query.toString();
}

export function countActiveFilters(search) {
  const s = { ...DEFAULT_SEARCH, ...search };
  return (
    (s.minPrice !== null || s.maxPrice !== null ? 1 : 0) +
    s.types.length +
    (s.rating !== null ? 1 : 0) +
    s.amenities.length
  );
}

export function clearFilters(search) {
  return {
    ...search,
    minPrice: null,
    maxPrice: null,
    types: [],
    rating: null,
    amenities: [],
    page: 1,
  };
}

export function formatPrice(price, currency = "EUR", locale) {
  if (price === null || price === undefined) return null;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function ratingLabel(rating) {
  if (rating === null || rating === undefined) return "New";
  return rating.toFixed(2).replace(/0$/, "");
}

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const nights = differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
  return nights > 0 ? nights : 0;
}

export function formatDateRange(checkIn, checkOut) {
  if (!checkIn) return null;
  const start = parseISO(checkIn);
  if (!checkOut) return format(start, "d MMM");
  const end = parseISO(checkOut);
  const sameMonth = format(start, "MMM yyyy") === format(end, "MMM yyyy");
  return sameMonth
    ? `${format(start, "d")}–${format(end, "d MMM")}`
    : `${format(start, "d MMM")} – ${format(end, "d MMM")}`;
}

export function guestsLabel(adults = 1, children = 0) {
  const total = adults + children;
  return `${total} ${total === 1 ? "guest" : "guests"}`;
}

// Airbnb's CDN serves originals (often 1–3 MB) under /pictures/; the same
// path under /im/ is resized on request with ?im_w=<width>.
const MUSCACHE_ORIGINAL = /^https:\/\/a0\.muscache\.com\/pictures\//;
export const IMAGE_WIDTHS = [480, 720, 1200];

export function imageSrc(url, width = 720) {
  if (!url || !MUSCACHE_ORIGINAL.test(url)) return url;
  return `${url.replace("/pictures/", "/im/pictures/").split("?")[0]}?im_w=${width}`;
}

export function imageSrcSet(url) {
  if (!url || !MUSCACHE_ORIGINAL.test(url)) return undefined;
  return IMAGE_WIDTHS.map((width) => `${imageSrc(url, width)} ${width}w`).join(", ");
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
