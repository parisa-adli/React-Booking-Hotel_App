# CONTEXT — Booking Hotel App

> Working context for people and coding agents. Last reviewed **2026-10-16** against commit `8967690`.
>
> Related documents: [docs/PRD.md](docs/PRD.md) · [docs/design.md](docs/design.md) · [tasks/TASK.md](tasks/TASK.md)
>
> Labels used below: **[Fact]** verified in the repo or in a primary source · **[Rec]** recommendation · **[Assume]** assumption to verify · **[Open]** unresolved decision.

---

## 1. Purpose and scope

A React single-page app for **discovering short-stay accommodation** (Airbnb-style listings). Users can search by destination, dates and guests, browse results on a list and a map, open listing details, and save map locations as bookmarks (behind a demo login).

It started as a learning project (the commit history walks through routing, context, reducers, maps and fake auth one step at a time). The next goal is a **portfolio-quality hotel discovery experience**, specified in [docs/PRD.md](docs/PRD.md) and [docs/design.md](docs/design.md).

**Not in scope:** real reservations, payments, live availability, live pricing, or real authentication. The data is a **static snapshot** (see §5).

---

## 2. Technology stack [Fact]

| Area | Choice | Version (package.json) | Notes |
|---|---|---|---|
| Build / dev server | Vite + `@vitejs/plugin-react` | `^4.4.5` / `^4.0.3` | `vite.config.js` is default |
| UI | React, React DOM | `^18.2.0` | JSX, **no TypeScript** |
| Routing | react-router-dom | `^6.28.0` (installed 6.28.0) | `BrowserRouter` with `future.v7_startTransition` |
| HTTP | axios | `^1.5.0` | |
| Dates | date-fns, react-date-range | `^2.30.0`, `^1.4.0` | Range picker in `Header` |
| Map | react-leaflet (Leaflet) | `^4.2.1` | OSM "HOT" tiles; Leaflet CSS is `@import`ed from unpkg in `src/App.css` |
| Toasts / spinner | react-hot-toast | `^2.4.1` | `<Toaster />` in `App.jsx`; `LoaderIcon` reused in `Loader.jsx` |
| Icons | react-icons | `^4.10.1` | `hi` and `md` sets in use |
| Flags | react-country-flag | `^3.1.0` | Bookmarks |
| Mock API | json-server | `^0.17.3` (installed 0.17.3) | Listed under `dependencies` |
| Lint | ESLint 8 + react, react-hooks, react-refresh | | `react/prop-types` is off |
| Tests | **none** | | No test runner, no CI |
| Styling | Global CSS | | `src/index.css` (tokens, reset) + `src/App.css` (all components) |

The local toolchain at review time was Node 24.21 and npm 11.19. No `engines` field is declared.

---

## 3. Commands and environment

```bash
npm install          # install deps
npm run server       # json-server --watch server/db.json --port 5000 --delay 500
npm run dev          # Vite dev server (default http://localhost:5173)
npm run lint         # eslint, --max-warnings 0
npm run build        # production build to dist/
npm run preview      # serve dist/
```

- **Both `server` and `dev` must run** for the app to work.
- **[Fact]** There are no `.env` files and no `import.meta.env` usage. The API base URL `http://localhost:5000` is hard-coded in three places: `src/components/context/HotelsProvider.jsx`, `src/components/context/BookmarkListContext.jsx`, and `src/components/LocationList/LocationList.jsx`.
- **[Fact]** External network calls at runtime:
  - BigDataCloud reverse geocoding (`api.bigdatacloud.net/data/reverse-geocode-client`, keyless client endpoint) in `AddNewBookmark`
  - OSM tiles (`tile.openstreetmap.fr/hot`)
  - Leaflet CSS from unpkg
  - Listing images hot-linked from Airbnb's CDN (`a0.muscache.com`)
- **[Rec]** Introduce `VITE_API_URL` (see TASK P0-2) rather than more hard-coded URLs.

---

## 4. Architecture [Fact]

### 4.1 Directory map

```
index.html                 # Vite entry, <html lang="en">, title "Booking Hotel App"
server/db.json             # json-server data: hotels[10], bookmarks[8]
src/
  main.jsx                 # BrowserRouter + StrictMode + <App/>
  App.jsx                  # Providers + <Header/> + <Routes>
  index.css                # :root tokens, reset (also removes all outlines)
  App.css                  # all component styles, camelCase class names
  components/
    <Name>/<Name>.jsx      # one folder per component (PascalCase)
    Loader.jsx             # exception: lives at components root
    context/               # AuthProvider, BookmarkListContext, HotelsProvider
  hooks/                   # useFetch, useGeoLocation, useOutsideClick, useUrlLocation
```

### 4.2 Provider tree and routes (`src/App.jsx`)

```
AuthContextProvider > BookmarkListProvider > HotelsProvider > (Toaster, Header, Routes)

/                 LocationList        all hotels as a grid ("NearBy Location")
/hotels           AppLayout           sidebar <Outlet/> + <Map markerLocations={hotels}/>
  index             Hotels            search results list
  :id               SingleHotel       name, review count, large image
/bookmark         ProtectedRoute > BookmarkLayout   sidebar + <Map markerLocations={bookmarks}/>
  index             Bookmark          list + delete
  :id               SingleBookmark
  add               AddNewBookmark    form prefilled by reverse geocoding ?lat&lng
/login            Login               fake login (user@test.com / 1234 prefilled)
```

Clicking anywhere on **any** map navigates to `/bookmark/add?lat=&lng=` (`DetectClick` in `Map.jsx`), including the hotels map.

### 4.3 Conventions to follow

- **One context per domain**, exported as `default <Name>Provider` plus a named `use<Name>()` hook (`useHotels`, `useBookmark`, `useAuth`).
- **Async state via `useReducer` + async action functions** inside the provider (`BookmarkListContext.jsx`). Action types use `"loading"`, `"<entity>s/loaded"`, `"<entity>/created"`, `"<entity>/deleted"`, `"rejected"`. The comments at the bottom of that file describe this pattern as the intended one.
- **URL is the source of truth for search** (`useSearchParams`, `createSearchParams`). Map focus uses `?lat=&lng=` (`useUrlLocation`).
- **Errors** surface as `toast.error(message)`. Loading uses `<Loader />`.
- **Styling:** global classes in `App.css` (`.searchItem`, `.headerSearch`, `.btn.btn--primary`, `.appLayout`, …) and tokens in `index.css` (`--text-*`, `--primary-*`, `--rose-500`, `--bg-color`). No CSS modules or UI library.
- **Commits** are short, lowercase, feature-sized ("delete bookmark", "protected route").

### 4.4 Data model today

`server/db.json` → `hotels` (10 records) use the **legacy 2017 Inside Airbnb schema** as once exposed by Opendatasoft's `airbnb-listings` dataset (about 90 snake_case fields). The fields the UI reads:

| Field | Used in | Notes |
|---|---|---|
| `id` (string) | links, map keys | |
| `name`, `smart_location` | cards | `smart_location` is "City, Country" (some are reversed, e.g. "Espania, Madrid") |
| `thumbnail_url`, `xl_picture_url` | cards, detail | Airbnb CDN URLs |
| `price` (number) | cards | Rendered with a hard-coded "€" |
| `number_of_reviews` | detail | |
| `latitude`, `longitude`, `host_location` | map markers / popup | |
| `accommodates` | search filter | `accommodates_gte=<room count>` |

Data quality: **[Fact]** every record has `country_code: "NL"`, including Madrid, London and Berlin. `review_scores_rating` is on a 0–100 scale and is sometimes `null`.

`bookmarks` (8 records): `{ id:number, cityName, country, countryCode, latitude:string, longitude:string, host_location }`. These are **saved map locations, not saved hotels**.

### 4.5 Search behaviour today

`Header.jsx` writes `?destination=<text>&date=<JSON array>&options=<JSON {Adult, children, room}>` (it calls `setSearchParams` on the current URL first) and navigates to `/hotels`. `HotelsProvider` turns this into `GET /hotels?q=<destination>&accommodates_gte=<room>`. **Dates and adult/children counts are ignored.** The number of *rooms* is compared with *accommodates* (people), which is a semantic bug.

---

## 5. Data source decision

### 5.1 Selected: Inside Airbnb (static, CC BY 4.0) [Fact, unless labeled otherwise]

- Free per-city snapshots at <https://insideairbnb.com/get-the-data/>. **No account, no key, no API.** The download is files only.
- **License:** "Creative Commons Attribution 4.0 International License" (stated on the get-the-data page).
- **Community guidelines** (<https://insideairbnb.com/data-policies/>): take only the data you need, do not scrape the site, **download once**, attribute and cite, and **"Do not republish the data."** → see **[Open] Q1**.
- **Freshness:** quarterly snapshots for roughly the last 12 months. Amsterdam's latest at review time was `2026-09-16`.
- **Files per city:** `data/listings.csv.gz` (detailed, 79 columns), `data/calendar.csv.gz`, `data/reviews.csv.gz`, plus `visualisations/listings.csv` (18 summary columns), `neighbourhoods.csv/.geojson`.
- **Verified `listings.csv.gz` header (Amsterdam 2026-09-16)** includes `id, listing_url, name, description, neighborhood_overview, picture_url, host_name, host_is_superhost, neighbourhood_cleansed, latitude, longitude, property_type, room_type, accommodates, bathrooms_text, bedrooms, beds, amenities, price, minimum_nights, availability_365, number_of_reviews, review_scores_rating, review_scores_cleanliness, review_scores_location, review_scores_value, instant_bookable, license`.
- **Schema drift vs. the current `db.json`:** the 2026 files have **no** `thumbnail_url`, `xl_picture_url`, `smart_location`, `city` or `country_code`. City and country come from the file's path. `price` is often empty in the summary file (sample rows show blanks).
- **[Assume]** `review_scores_rating` uses a 0–5 scale in current files (vs. 0–100 legacy), `price` in the detailed file is a formatted string (for example `"$97.00"`) in the city's **local** currency, and `amenities` is a JSON-encoded string array. Verify all three in TASK P1-1.

### 5.2 Why not a live API

Airbnb has **no public API**. Access is partner-only, and its terms prohibit scraping (based on secondary sources; see the PRD). The free live hotel APIs available on 2026-10-16 all require an account and a server-side secret, and are limited or being retired. Amadeus Self-Service shut down on 2026-07-17. The full comparison with sources is in [docs/PRD.md §9](docs/PRD.md#9-data-source-research). **[Rec]** If live rates are wanted later, LiteAPI's free sandbox behind a small proxy is the most practical path. That is out of MVP scope.

### 5.3 Proposed integration (see TASK P1) [Rec]

1. Download chosen city files **manually, once** into a gitignored folder (for example `data/raw/`).
2. Run a Node script (`scripts/import-insideairbnb.mjs`, built-ins only: `fs`, `zlib`, a small RFC-4180 CSV parser) that filters, normalizes and writes `server/db.json` → `hotels` (normalized) + `cities`, preserving `bookmarks`.
3. The UI reads normalized fields only (schema in [docs/PRD.md §8](docs/PRD.md#8-data-requirements)). A mapper in `src/services/hotels.js` isolates the field names.
4. Keep **json-server 0.17**. v1 changed the query API: `_per_page` instead of `_limit`, `field:op=` filters, no `q`, no `--delay`. 0.17 provides `_page`/`_limit` with `X-Total-Count`, `_sort`/`_order`, `_gte`/`_lte`, `_like`, `q` and nested-field filters (checked in `node_modules/json-server/README.md`).

---

## 6. Reusable pieces

| Piece | File | Reuse for |
|---|---|---|
| URL-driven search state | `Header.jsx`, `HotelsProvider.jsx` | Filters, sort, page |
| `useFetch(url, query)` with AbortController | `src/hooks/useFetch.js` | Listing queries (needs the fix in §7 and header access for totals) |
| Reducer + async actions | `context/BookmarkListContext.jsx` | Favorites provider, hotels refactor |
| `Map` + `useGeoLocation` + `useUrlLocation` | `components/Map/Map.jsx`, hooks | Results map, detail mini-map |
| `useOutsideClick` | `src/hooks/useOutsideClick.js` | Date, guest and filter popovers |
| Guest stepper | `GuestOptionList` / `OptionItem` in `Header.jsx` | Search sheet |
| `ProtectedRoute` | `components/ProtectedRoute` | Any auth-gated page |
| `Loader`, toasts | `components/Loader.jsx`, react-hot-toast | Loading and error states |

---

## 7. Known issues [Fact] (recorded, not fixed)

1. `useFetch.js` calls `axios.isCancel()` with no argument, so the guard never fires. An aborted request still runs `setData([])`. The "canceled" toast is now hidden by a string check on `err.message` (commit `dd0fa57`), which `axios.isCancel(err)` should replace.
2. `AuthProvider.jsx` initial state has `name: null`, while the reducer sets `user`.
3. `SingleBookmark.jsx` reads `isLoadingCurrBookmark`, which the context doesn't provide.
4. CSS variables `--slate-300` (in `Loader.jsx`) and `--text-600` (in `App.css`) are undefined.
5. `Login.jsx` imports an unused `replace`. The password field is `type="text"`. Credentials are hard-coded and prefilled.
6. `index.css` sets `outline: none` globally, which removes all keyboard focus indicators. Interactive `<div>`s (date and guest dropdowns) aren't keyboard-operable.
7. `Map.jsx` → `ChangeCenter` calls `map.setView` during render. The hotels map also turns clicks into "add bookmark" navigation.
8. Effects in `SingleHotel` and `SingleBookmark` omit dependencies. `useOutsideClick` omits `exceptionId`.
9. The room count is used as the minimum `accommodates`. Prices always show "€".
10. **Contrast:** `--text-400` `#94a3b8` on white is 2.56:1 and is used for listing names (fails WCAG AA). `--text-500` `#64748b` on `--bg-color` `#f3f4f6` is 4.32:1 (fails for small text).
11. Inconsistent `id` types: hotel ids are strings and bookmark ids are numbers (`+id === currentBookmark?.id`).

---

## 8. Constraints and assumptions

- **[Fact]** Planning-only change set. Feature work follows [tasks/TASK.md](tasks/TASK.md).
- **[Rec]** Don't add a UI or component library. Keep global CSS and extend the tokens in `index.css`.
- **[Rec]** Don't upgrade json-server to v1 or React Router to v7 as part of this work.
- **[Assume]** The app is a portfolio project, so non-commercial use with attribution is acceptable.
- **[Assume]** Hot-linked Airbnb CDN images keep working. A fallback image state is required regardless.

## 9. Open questions

| ID | Question | Recommendation |
|---|---|---|
| Q1 | Inside Airbnb asks "Do not republish the data". May we commit an imported subset to a (public) repo? | Commit a **small curated sample** (≤ 100 listings, essential fields only, no host bios) with `server/ATTRIBUTION.md`, or gitignore generated data and commit only the script. Decide in TASK P0-1. |
| Q2 | Deployment target? json-server is dev-only. | For a static host, add a read-only "static JSON" data path later. Out of MVP scope unless chosen in P0-1. |
| Q3 | Favorites persistence: localStorage or a json-server `favorites` collection? | localStorage (works without login or a backend). See PRD FR-FAV. |
| Q4 | Which cities to import? | 3–5 cities with differing currencies is optional. Default: Amsterdam, Barcelona, Lisbon, London. |
| Q5 | Add a test runner (Vitest + Testing Library)? | Yes, as TASK P0-4. It requires approval because it changes `package.json`. |
| Q6 | Visual reference: the Dribbble shot could not be loaded for inspection. | Treat design.md's reference-derived items as unverified until someone compares them with the shot. |
| Q7 | README.md (commit `8967690`) lists `src/context/` and `src/pages/` folders that don't exist (contexts live in `src/components/context/`), uses a placeholder clone URL, and states an MIT license with no LICENSE file. | Correct the README in TASK P10-2; add a LICENSE file if MIT is intended. |
