# PRD — Stays: hotel & short-stay discovery

| | |
|---|---|
| Status | Draft v1 (planning) |
| Date | 2026-10-16 |
| Repo state | `main` @ `8967690` |
| Related | [CONTEXT.md](../CONTEXT.md) · [design.md](design.md) · [TASK.md](../tasks/TASK.md) |

> **Honesty note.** This product uses a **static listings snapshot** (Inside Airbnb). It **does not** make reservations, take payments, show live availability, or show live prices. Any "Reserve" affordance is a clearly labeled **demo**. Nightly prices are **snapshot prices** from the dataset date.

---

## 1. Vision

A fast, image-led web app to **discover and shortlist places to stay** in a handful of cities. It should feel like a premium booking app (the Dribbble reference and Airbnb's UX patterns), be honest about its data, and work well on a phone.

## 2. Target users

| Persona | Need |
|---|---|
| **Browsing traveler** | Compare stays in a city by photo, price, rating and amenities, and save favorites. |
| **Portfolio reviewer / recruiter** | See solid React architecture, responsive UI, accessibility and clean data handling within a few minutes. |
| **Developer (repo owner)** | Learn and demonstrate routing, context + reducer, URL state, maps and data normalization. |

## 3. Problems

1. The current search ignores dates and adults/children, and compares rooms with people.
2. The data is 10 legacy records with wrong country codes, and its upstream source (Opendatasoft `airbnb-listings`) no longer exists.
3. There are no filters, sorting, pagination, favorites, or real detail page.
4. The UI has accessibility gaps (no focus rings, low-contrast text, mouse-only dropdowns) and no designed loading, empty or error states.

## 4. Primary journeys

- **J1 Search:** Home → choose destination (from the available cities) → dates → guests → *Search* → Results.
- **J2 Refine:** Results → filter (price, type, rating, amenities) → sort → page through. The URL updates and can be shared or reloaded.
- **J3 Evaluate:** Results card → Details (photo, highlights, amenities, location map, snapshot price) → back to the same results position.
- **J4 Save:** Heart on a card or on Details → Saved page lists favorites → remove.
- **J5 Map:** Results ↔ map. Markers match the current page of results. Selecting a marker highlights its card.

## 5. Scope

### 5.1 MVP (in scope)

- Destination selection from **cities present in the dataset**
- Dates and guests captured in the URL (guests filter capacity; dates are informational)
- Results list and grid, map, filters, sorting, pagination
- Listing details page
- Favorites (client-side persistence)
- Designed loading, empty, error and fallback states
- Responsive, mobile-first layout and WCAG 2.2 AA targets
- Data import script and normalized schema
- Attribution

### 5.2 Explicitly out of scope

- Real reservations, checkout, payments, cancellations
- **Live availability and live/real-time pricing**, and date-dependent prices
- Real authentication or user accounts (the existing fake login stays as a demo for Bookmarks)
- Reviews text, host messaging, multi-image galleries (the dataset provides one `picture_url`)
- Server-side rendering, i18n, currency conversion
- Any paid or keyed third-party API

### 5.3 Mock or derived functionality (must be labeled in the UI)

| Feature | Reality |
|---|---|
| Nightly price | Snapshot from the dataset date, in the city's local currency |
| "Total for N nights" | `price × nights`, labeled *estimate* (P2 optional) |
| Reserve button | Disabled or demo. It opens nothing transactional. |
| Dates | Stored in the URL and shown, but they **don't filter** availability |

---

## 6. Functional requirements

Priority: **M** = must (MVP), **S** = should, **C** = could.

### 6.1 Search & destination — FR-SRCH

| ID | Pri | Requirement |
|---|---|---|
| FR-SRCH-1 | M | The destination is chosen from a `cities` list (`GET /cities`). Free-text typing filters suggestions; a value not in the list can't be submitted. |
| FR-SRCH-2 | M | Check-in and check-out are selected with the existing `react-date-range` picker; check-out must be after check-in; dates before today are disabled. |
| FR-SRCH-3 | M | Guests are entered with the existing steppers. Adults ≥ 1, children ≥ 0, total ≤ 16. Rooms are **removed** (the data has no room inventory) **[Rec]**. |
| FR-SRCH-4 | M | *Search* navigates to `/hotels?city=<id>&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&adults=n&children=n`. The legacy `destination/date/options` params are read once for backward compatibility. |
| FR-SRCH-5 | M | The search form is keyboard- and screen-reader-operable (combobox, dialog popovers, Esc to close). |

**Acceptance**
- Given "Ams" typed, then "Amsterdam" appears in suggestions and can be chosen with ↓ and Enter.
- Given check-out ≤ check-in, then *Search* is disabled with an inline message.
- Reloading `/hotels?...` restores every form value.

### 6.2 Results listing — FR-LIST

| ID | Pri | Requirement |
|---|---|---|
| FR-LIST-1 | M | Results show HotelCards (image, name, neighbourhood · city, room type, rating, snapshot price per night, favorite toggle). |
| FR-LIST-2 | M | A results header shows the total count (`X-Total-Count`), city, and dates/guests summary. |
| FR-LIST-3 | M | Capacity filter: `accommodates_gte = adults + children`. |
| FR-LIST-4 | M | Selecting a card opens `/hotels/:id`, preserving the query string so that Back restores the list. |
| FR-LIST-5 | S | The Home page shows "Explore cities" (from `cities`) and a "Top rated" row. |

**Acceptance:** Amsterdam with 3 guests shows only listings where `accommodates ≥ 3`, and the count matches the header.

### 6.3 Filters — FR-FILT

| ID | Pri | Requirement |
|---|---|---|
| FR-FILT-1 | M | Price range (min/max per night) → `price_gte` / `price_lte`. |
| FR-FILT-2 | M | Room type (Entire home/apt, Private room, Hotel room, Shared room) → `roomType=`; multiple values allowed. |
| FR-FILT-3 | M | Minimum rating (Any, 4.0+, 4.5+, 4.8+) → `rating_gte`. |
| FR-FILT-4 | S | Amenities: Wi-Fi, Kitchen, Air conditioning, Washer, Free parking, Dedicated workspace → boolean flags precomputed at import (`hasWifi=true`, …). |
| FR-FILT-5 | S | Instant bookable toggle → `instantBookable=true` (labeled as dataset attribute, not a booking feature). |
| FR-FILT-6 | M | Filters live in the URL, show an active count, and can be cleared with one action; changing a filter resets to page 1. |

**Acceptance:** applying 4.5+ and Kitchen leaves only listings with `rating ≥ 4.5 && hasKitchen`, and the URL contains `rating_gte=4.5&hasKitchen=true`.

### 6.4 Sorting — FR-SORT

| ID | Pri | Requirement |
|---|---|---|
| FR-SORT-1 | M | Options: Recommended (default: `reviewCount desc`), Price low→high, Price high→low, Top rated (`rating desc, reviewCount desc`). |
| FR-SORT-2 | M | Sort is held in the URL (`sort=price_asc`), mapped to `_sort`/`_order`. Listings with null price or rating are sorted last **[Assume: json-server 0.17 null ordering must be verified in P4-1; fallback: import sets `null` → excluded from sortable subset or uses sentinel]**. |

### 6.5 Pagination — FR-PAGE

| ID | Pri | Requirement |
|---|---|---|
| FR-PAGE-1 | M | Shows 12 results per page via `_page` & `_limit`; the total is read from the `X-Total-Count` response header. |
| FR-PAGE-2 | M | Shows numbered pagination (desktop) or Prev/Next (mobile). The page is held in the URL (`page=`) and scrolls to the list top on change. |

### 6.6 Details — FR-DET

| ID | Pri | Requirement |
|---|---|---|
| FR-DET-1 | M | `/hotels/:id` shows the hero image, name, rating + review count, neighbourhood · city, property and room type, guests/bedrooms/beds/bathrooms, description (sanitized: strip HTML, see §11), amenities (top 10 + "Show all"), host first name + Superhost badge, minimum nights, location map. |
| FR-DET-2 | M | A sticky price card shows the snapshot price per night, the dates and guests from the URL, an *estimated* total, and a **disabled "Reserve — demo only"** button with an explanation. |
| FR-DET-3 | S | "View on Airbnb" external link (`listingUrl`, `rel="noopener noreferrer"`), clearly external. |
| FR-DET-4 | M | An unknown id shows a not-found state with a link back to results. |

### 6.7 Favorites — FR-FAV

| ID | Pri | Requirement |
|---|---|---|
| FR-FAV-1 | M | A heart toggle on cards and Details adds or removes a listing from favorites. It is a `<button aria-pressed>`. |
| FR-FAV-2 | M | Persisted in `localStorage` (`stays.favorites.v1` = array of hotel ids) through a `FavoritesProvider` using the repo's reducer pattern. Unavailable storage degrades to in-memory with no crash. **[Open Q3 alternative: json-server `favorites` collection.]** |
| FR-FAV-3 | M | The `/saved` route lists favorites (fetched by `id=` repeated params) with an empty state. It is **not** login-protected. |
| FR-FAV-4 | S | A favorite whose id no longer exists in the data is shown as "No longer available" with a remove action. |

### 6.8 Map — FR-MAP

| ID | Pri | Requirement |
|---|---|---|
| FR-MAP-1 | M | Results map markers show the **current page** of results. A price label marker is optional. Clicking a marker highlights the card and offers "Open". |
| FR-MAP-2 | M | Clicks on the **hotels** map no longer navigate to "add bookmark"; that behaviour stays on the Bookmarks map only. |
| FR-MAP-3 | M | On mobile the map is behind a "Map" toggle button. On desktop it is a split view (as today). |

### 6.9 States — FR-STATE

| ID | Pri | Requirement |
|---|---|---|
| FR-STATE-1 | M | Skeleton placeholders while loading lists and details. |
| FR-STATE-2 | M | Empty results show a message plus "Clear filters" / "Change destination". |
| FR-STATE-3 | M | API unreachable shows an inline error with "Retry". Also a toast, per existing convention. |
| FR-STATE-4 | M | Fallbacks: image error → neutral placeholder; `price == null` → "Price unavailable" (excluded from price filters); `rating == null` → "New". |
| FR-STATE-5 | M | Aborted requests (fast filter changes) never show an error (fixes CONTEXT §7.1). |

### 6.10 Accessibility — FR-A11Y

| ID | Pri | Requirement |
|---|---|---|
| FR-A11Y-1 | M | Visible focus indicator on all interactive elements (remove the global `outline: none`). |
| FR-A11Y-2 | M | Text contrast ≥ 4.5:1 and UI component contrast ≥ 3:1 (design tokens in design.md). |
| FR-A11Y-3 | M | All controls are reachable and operable by keyboard. Dialogs and sheets trap focus and return it on close. |
| FR-A11Y-4 | M | Meaningful `alt` text, landmarks (`header`, `nav`, `main`), one `h1` per page, and `aria-live` result count updates. |
| FR-A11Y-5 | M | Touch targets ≥ 44×44 px. `prefers-reduced-motion` is respected. |

### 6.11 Attribution — FR-ATTR

| ID | Pri | Requirement |
|---|---|---|
| FR-ATTR-1 | M | Footer: "Listing data © Inside Airbnb, CC BY 4.0, snapshot <date>" with a link. The map keeps the OSM attribution. |

---

## 7. Non-functional requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-PERF-1 | Performance | Results page LCP < 2.5 s on Lighthouse "Mobile" against local preview. Images use `loading="lazy"` (except the first row), with explicit `width`/`height` or `aspect-ratio` (CLS < 0.1). |
| NFR-PERF-2 | Performance | No new runtime dependencies for the MVP. `npm run build` JS bundle grows by no more than 30 KB gzip over the baseline measured in P0. |
| NFR-PERF-3 | Data | `server/db.json` ≤ 1.5 MB. Only the fields in §8 are imported. |
| NFR-SEC-1 | Security | No secrets in the client or repo; none are needed. |
| NFR-SEC-2 | Security | Description text is rendered as **plain text** (HTML tags stripped at import). No `dangerouslySetInnerHTML`. |
| NFR-SEC-3 | Security | External links use `rel="noopener noreferrer"`. |
| NFR-PRIV-1 | Privacy | Import **drops** host about text, host URLs and pictures, and the license number. Only host first name + Superhost flag are kept. |
| NFR-PRIV-2 | Privacy | Favorites stay on the device (localStorage). No analytics. |
| NFR-QUAL-1 | Quality | `npm run lint` passes with 0 warnings; the mapper and query builder have unit tests (after P0-4). |
| NFR-COMPAT-1 | Compat | Latest 2 versions of Chrome, Firefox, Safari, Edge; 360 px minimum width. |

---

## 8. Data requirements

### 8.1 Normalized `Hotel` (served at `GET /hotels`)

| Field | Type | Source column (Inside Airbnb 2026) | Rule |
|---|---|---|---|
| `id` | string | `id` | String always (json-server URLs) |
| `name` | string | `name` | Trim |
| `cityId` | string | import config | e.g. `amsterdam` |
| `city` / `country` / `countryCode` | string | import config | Not in CSV; from the file path/config |
| `neighbourhood` | string | `neighbourhood_cleansed` | |
| `latitude` / `longitude` | number | same | Required; drop the row if missing |
| `imageUrl` | string | `picture_url` | Required; drop the row if missing |
| `listingUrl` | string | `listing_url` | |
| `description` | string | `description` | Strip HTML (`<br />` → newline), max 1,200 chars |
| `propertyType` / `roomType` | string | same | |
| `accommodates` / `bedrooms` / `beds` | number\|null | same | |
| `bathroomsText` | string\|null | `bathrooms_text` | |
| `amenities` | string[] | `amenities` | JSON-parse; dedupe |
| `hasWifi`, `hasKitchen`, `hasAirConditioning`, `hasWasher`, `hasFreeParking`, `hasWorkspace` | boolean | derived from `amenities` | Case-insensitive keyword match (list fixed in script) |
| `price` | number\|null | `price` | Strip currency symbols and commas → number |
| `currency` | string | import config | ISO 4217 per city (EUR, GBP, …). **[Assume]** CSV symbol is not reliable |
| `rating` | number\|null | `review_scores_rating` | 0–5, one decimal. Legacy 0–100 → /20 |
| `reviewCount` | number | `number_of_reviews` | |
| `instantBookable` | boolean | `instant_bookable` | `"t"` → true |
| `minimumNights` | number | `minimum_nights` | |
| `hostName` | string | `host_name` | First name only |
| `isSuperhost` | boolean | `host_is_superhost` | |
| `snapshotDate` | string | file path | `YYYY-MM-DD` |

Selection rules per city: keep rows with photo, coordinates, price, `number_of_reviews ≥ 5` and `availability_365 > 0`; sort by `number_of_reviews` desc; take the top **N = 25** (configurable). This keeps the dataset small (Q1, NFR-PERF-3).

### 8.2 `City` (served at `GET /cities`)

`{ id, name, country, countryCode, currency, latitude, longitude, imageUrl, listingCount, snapshotDate }`. The centroid is the mean of the imported listings; `imageUrl` is the top listing's photo.

### 8.3 Existing collections

`bookmarks` are preserved unchanged by the import script.

---

## 9. Data source research

Researched 2026-10-16. Nothing was registered, no accounts were created.

| Candidate | Free? (verified) | Auth | Data | Fit | Verdict |
|---|---|---|---|---|---|
| **Inside Airbnb** | Yes, CC BY 4.0 files | None | Listings (photo, price snapshot, ratings, amenities, coords), calendar snapshot, reviews | Static only; "don't republish" guideline | ✅ **Primary** |
| Airbnb official API | No public access (partner-only) | Partner contract | — | Not available; scraping prohibited | ❌ |
| Opendatasoft `airbnb-listings` (origin of current data) | — | — | — | v2.1 records endpoint returns **404** (dataset removed) | ❌ |
| LiteAPI (Nuitée) | Free sandbox key at signup, no card; content and booking endpoints free under look-to-book policy; places $0.01/req, price index $0.05/req | API key (server-side) | Hotel content, rates, booking (sandbox) | Needs account plus proxy | ⏭ Future option |
| Amadeus Self-Service | Portal **decommissioned 2026-07-17**; keys disabled | — | — | Gone | ❌ |
| Hotelbeds APItude | Evaluation key, **50 req/day** | Key + SHA256 signature | Content, availability, booking test | Needs backend; tiny quota | ❌ |
| SerpApi (Google Hotels) | 250 searches/month free | Key (server-side) | Scraped Google Hotels results | Key exposure; quota | ❌ |
| Geoapify Places | 3,000 credits/day free, attribution | Key | POIs (`accommodation.*`), no prices or photos | Enrichment only | ⏭ Optional geocoding |
| TripAdvisor | Pricing API by approval | Key | — | Approval needed | ❌ |

**Recommendation:** Inside Airbnb, because it needs no key, account, quota or backend, matches the repo's existing (Airbnb-shaped) data and json-server architecture, and provides images, ratings, amenities and coordinates. Its limits are no live price or availability, quarterly freshness, one photo per listing, hot-linked images, and the republish guideline.

**Regional and network notes:** Inside Airbnb and the Airbnb image CDN were reachable from the dev machine (HTTP 200). Corporate networks may block `muscache.com`. The fallback image state (FR-STATE-4) covers this.

**Sources**
- Inside Airbnb — data and license: <https://insideairbnb.com/get-the-data/>
- Inside Airbnb — community guidelines: <https://insideairbnb.com/data-policies/>
- LiteAPI pricing: <https://docs.liteapi.travel/reference/api-pricing-usage-costs> · sandbox: <https://nuitee.com/blog/effortlessly-test-travel-api-integrations-with-liteapis-sandbox-key>
- Amadeus Self-Service shutdown: <https://www.phocuswire.com/amadeus-shut-down-self-service-apis-portal-developers>
- Hotelbeds evaluation quota: <https://developer.hotelbeds.com/documentation/>
- SerpApi pricing: <https://serpapi.com/pricing> · free plan increase: <https://serpapi.com/blog/whats-new-at-serpapi-july-2025-changelog/>
- Geoapify: <https://apidocs.geoapify.com/docs/places/> · <https://geoapify.com/pricing>
- TripAdvisor content API FAQ: <https://tripadvisor-content-api.readme.io/reference/faq>
- Airbnb API access (secondary, not primary): <https://blog.apify.com/what-you-should-know-about-the-airbnb-api-and-free-alternatives/>
- json-server 0.17 query syntax: `node_modules/json-server/README.md` (installed 0.17.3); v1 differences: <https://github.com/typicode/json-server>

Confidence: Inside Airbnb, LiteAPI pricing and the Hotelbeds quota come from the providers' own pages. The Amadeus shutdown is from trade press quoting Amadeus's letter. Airbnb's partner-only status comes from secondary sources.

---

## 10. API contract (json-server 0.17, `VITE_API_URL`, default `http://localhost:5000`)

| Purpose | Request | Notes |
|---|---|---|
| Cities | `GET /cities?_sort=name` | |
| Search | `GET /hotels?cityId=amsterdam&accommodates_gte=3&price_gte=50&price_lte=300&roomType=Entire%20home%2Fapt&rating_gte=4.5&hasKitchen=true&_sort=price&_order=asc&_page=1&_limit=12` | Repeat `roomType=` for multi-select (OR). Read `X-Total-Count`. |
| Details | `GET /hotels/:id` | 404 → not-found state |
| Favorites batch | `GET /hotels?id=1&id=2&…` | |
| Bookmarks | unchanged (`/bookmarks`) | |

The UI→query mapping lives in a pure function `buildHotelQuery(searchParams)` in `src/services/hotels.js` (unit-tested).

**[Assume] Verify in P4-1:** `X-Total-Count` is exposed to the browser via CORS by json-server 0.17; repeated keys behave as OR; null values in `_sort`.

### Error handling

| Case | Behaviour |
|---|---|
| Network or server down | ErrorState + Retry + toast |
| 404 detail | NotFound state |
| Abort (param change) | Ignored silently |
| Malformed record (missing image or price) | Rendered with fallbacks; never crashes |

### Caching

None beyond the browser HTTP cache for the MVP. **[Rec, C-priority]** A per-session in-memory cache keyed by query string inside `HotelsProvider`.

---

## 11. Dependencies

- Inside Airbnb snapshot files, downloaded manually once
- json-server 0.17 (existing), react-leaflet (existing), react-date-range (existing)
- **Proposed dev dependency** (P0-4, needs approval): `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`

## 12. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| "Do not republish" guideline | Repo can't contain data | Q1: small sample + attribution, or gitignore + script |
| Airbnb CDN images break or are blocked | Image-led design degrades | Placeholder fallback; aspect-ratio boxes |
| Schema changes in future snapshots | Import breaks | Script validates required columns and fails loudly |
| json-server is dev-only | No hosted demo | Q2: static data path later |
| Users read snapshot prices as real offers | Trust | Labels: "snapshot price", "demo only" |
| Dribbble reference unverifiable | Design mismatch | design.md marks inferred items |

## 13. Assumptions

- Single-user demo; no multi-device sync.
- 3–5 cities × 25 listings is enough for the experience.
- Local currencies are shown without conversion.

## 14. Unresolved decisions

See [CONTEXT.md §9](../CONTEXT.md#9-open-questions): Q1 republishing, Q2 deploy target, Q3 favorites storage, Q4 cities, Q5 test runner, Q6 design reference verification, Q7 README accuracy and license.
