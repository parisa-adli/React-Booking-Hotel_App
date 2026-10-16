# TASK — Implementation plan

| | |
|---|---|
| Status | MVP implemented 2026-10-16 · open items in **Implementation status** below |
| Source of truth | [docs/PRD.md](../docs/PRD.md) (FR/NFR IDs) · [docs/design.md](../docs/design.md) (§ refs) · [CONTEXT.md](../CONTEXT.md) |
| Conventions | One small commit per task, in the repo's existing style (short, lowercase, e.g. `hotel card component`). Follow CONTEXT §4.3. The repo has no GitHub Issues or labels workflow, so this file is the tracker: tick the boxes. |

## Implementation status (2026-10-16)

All tasks are done except the two marked `[ ]`. Deviations from the original plan:

- **P0-4:** used Node's built-in test runner (`npm test`, 17 tests) instead of Vitest + Testing Library, so no dependencies were added. UI behavior was checked with a scripted headless-Chrome (DevTools Protocol) run instead of component tests: combobox keyboard flow, Esc/focus return, filter sheet live count, apply/sort/pagination, favorites → Saved (including an unavailable id), 404 stay and route, protected-route redirect and return, legacy URLs, the API-down error state and Retry, and no horizontal overflow at 390 px.
- **P0-5 / P10-1:** bundle measured: JS 154.3 → 176.2 KB gzip (+21.9 KB, within the 30 KB budget); CSS 4.0 → 15.9 KB gzip, because Leaflet's CSS is now bundled instead of loaded from unpkg. The results page loads about 133 KB of images after CDN resizing. **Lighthouse was not run.**
- **P5-2:** the Instant bookable filter was dropped (no data; PRD FR-FILT-5).
- **P6-1:** details is a full-width route on every screen size.
- **P9-2:** keyboard paths were exercised by script; **an axe audit and a screen-reader pass are still to do.**

**Global rules for every task**
- `npm run lint` passes (0 warnings) and `npm run build` succeeds.
- Once P0-4 lands, `npm test` passes.
- No new runtime dependencies. Dev dependencies only in P0-4 (needs approval).
- Don't upgrade json-server (stay on 0.17), React Router, or Vite.
- The UI never claims live prices, availability or bookings (PRD §5.3).

**Phase overview**

| Phase | Theme | Tasks |
|---|---|---|
| P0 | Preparation & decisions | P0-1 … P0-5 |
| P1 | Data import & normalization | P1-1 … P1-5 |
| P2 | Design foundation | P2-1 … P2-2 |
| P3 | Search & destination | P3-1 … P3-3 |
| P4 | Listing & cards | P4-1 … P4-3 |
| P5 | Filters, sort, pagination | P5-1 … P5-4 |
| P6 | Details | P6-1 … P6-2 |
| P7 | Favorites | P7-1 … P7-2 |
| P8 | States | P8-1 … P8-2 |
| P9 | Responsive & accessibility | P9-1 … P9-3 |
| P10 | Final verification | P10-1 … P10-2 |

MVP critical path: P0-1 → P0-2 → P0-3 → P1-1 → P1-2 → P1-3 → P1-4 → P1-5 → P2-1 → P3-1 → P4-1 → P4-2 → P5-1 → P5-2 → P6-1 → P7-1 → P8-1 → P9-1 → P10-1.

---

## P0 — Preparation

### [x] P0-1 Record decisions on open questions
- **Objective:** resolve CONTEXT §9 Q1–Q5 before writing code.
- **Deps:** none.
- **Files:** `CONTEXT.md` (§9 → move answers into a "Decisions" table).
- **Requirements:** decide the data republish policy (sample vs. gitignored), deploy target, favorites storage (default localStorage), city list and currencies, and whether to add the test runner.
- **Acceptance:** every Q has a dated decision. PRD sections touched by a decision are updated (e.g., FR-FAV-2).
- **Verify:** review the docs diff.

### [x] P0-2 Configurable API base URL
- **Objective:** remove the three hard-coded `http://localhost:5000` strings.
- **Deps:** none.
- **Files:** new `src/services/api.js` (exports `API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"` and an axios instance), `HotelsProvider.jsx`, `BookmarkListContext.jsx`, `LocationList.jsx`, new `.env.example`.
- **Requirements:** keep behavior identical. `.env.example` documents `VITE_API_URL`. `.gitignore` already ignores `*.local`.
- **Acceptance:** no remaining `localhost:5000` matches in `src/`. The app works unchanged with no `.env`.
- **Verify:** `grep -r "localhost:5000" src` returns nothing. Manual: home, results, bookmarks all load.

### [x] P0-3 Fix latent bugs that block later work
- **Objective:** fix CONTEXT §7 items 1–4, 7, 8 and 11.
- **Deps:** none.
- **Files:** `src/hooks/useFetch.js`, `context/AuthProvider.jsx`, `SingleBookmark/SingleBookmark.jsx`, `Loader.jsx`, `App.css`, `Map/Map.jsx`, `SingleHotel/SingleHotel.jsx`, `hooks/useOutsideClick.js`.
- **Requirements:**
  - `axios.isCancel(err)` (replacing the `"canceled"` message check added in `dd0fa57`)
  - initialState `user: null`
  - use the provided `isLoading`
  - define or replace the undefined CSS vars
  - `ChangeCenter` uses `useEffect`
  - complete effect deps (wrap `getHotel`/`getBookmark` in `useCallback`)
  - compare ids as strings
- **Acceptance:** no "canceled" toast when typing fast or navigating. Lint passes with react-hooks warnings at 0.
- **Verify:** manual: switch between hotels rapidly and confirm no error toast. Open a bookmark detail directly by URL.

### [x] P0-4 Add test tooling (requires approval: changes package.json)
- **Objective:** enable unit and component tests (PRD NFR-QUAL-1, CONTEXT Q5).
- **Deps:** P0-1 decision.
- **Files:** `package.json` (devDeps `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`; script `"test": "vitest run"`), `vite.config.js` (`test: { environment: "jsdom", setupFiles }`), `src/test/setup.js`, `.eslintrc.cjs` (vitest globals for `*.test.*`).
- **Acceptance:** a sample test of `useUrlLocation` passes via `npm test`.
- **Verify:** `npm test`.

### [x] P0-5 Baseline measurements
- **Objective:** capture numbers for NFR-PERF-1/2.
- **Deps:** none.
- **Files:** `CONTEXT.md` (add a "Baselines" note).
- **Requirements:** record the gzip JS size from `npm run build`, plus Lighthouse mobile (Performance and Accessibility) for `/` and `/hotels` against `npm run preview` + `npm run server`.
- **Acceptance:** numbers recorded with date and commit.

---

## P1 — Data import & normalization

### [x] P1-1 Download snapshots and verify schema assumptions
- **Objective:** confirm the CONTEXT §5.1 **[Assume]** items before building the script.
- **Deps:** P0-1 (city list).
- **Files:** none committed except notes. Raw files go to `data/raw/<city>/<date>/listings.csv.gz`, and `data/raw/` is added to `.gitignore`.
- **Requirements:** download **once, manually**, from <https://insideairbnb.com/get-the-data/>. Check the `price` format and currency, the `review_scores_rating` scale, the `amenities` encoding, `host_is_superhost` and `instant_bookable` values, and the rate of empty prices.
- **Acceptance:** the findings are written into CONTEXT §5.1 (assumptions become facts), and PRD §8.1 is adjusted if a finding differs.

### [x] P1-2 Import script
- **Objective:** produce normalized `hotels` and `cities` (PRD §8).
- **Deps:** P1-1.
- **Files:** new `scripts/import-insideairbnb.mjs`, `scripts/cities.config.json` (`id, name, country, countryCode, currency, path, snapshotDate`), `package.json` script `"data:import": "node scripts/import-insideairbnb.mjs"`.
- **Requirements:**
  - Node built-ins only (`fs`, `zlib`, `path`) with an RFC-4180 CSV parser (quoted fields, escaped quotes, embedded newlines).
  - Fails with a clear message on missing required columns.
  - Applies the PRD §8.1 rules: field mapping, HTML stripping, privacy drops (NFR-PRIV-1), amenity flags, selection (≥ 5 reviews, has price/photo/coords, top N = 25 per city).
  - Writes `server/db.json` while **preserving `bookmarks`**, and makes no network calls.
- **Acceptance:** running the script twice produces identical output. The output is ≤ 1.5 MB (NFR-PERF-3). Every hotel passes the schema check.
- **Verify:** unit-test the CSV parser and the row normalizer (`scripts/*.test.mjs` once P0-4 lands), e.g. a fixture row with a multiline description, a `"$1,200.00"` price and an empty rating.

### [x] P1-3 Regenerate data and add attribution
- **Objective:** replace the 10 legacy hotels.
- **Deps:** P1-2, P0-1 (Q1 decision).
- **Files:** `server/db.json`, new `server/ATTRIBUTION.md` (source, license CC BY 4.0, snapshot dates, transformations made), and `.gitignore` if the decision is "don't commit data".
- **Acceptance:** `npm run server` → `GET /hotels?_limit=1` returns the normalized shape. `GET /cities` lists the configured cities. `/bookmarks` is unchanged.
- **Verify:** `curl -i "http://localhost:5000/hotels?_page=1&_limit=12"` shows `X-Total-Count`.

### [x] P1-4 Hotel service: query builder and formatters
- **Objective:** centralize the URL → json-server query mapping and display formatting (PRD §10).
- **Deps:** P0-2, P1-3. Tests need P0-4.
- **Files:** new `src/services/hotels.js` (`buildHotelQuery(searchParams)`, `parseSearchParams`, `formatPrice(price, currency)`, `ratingLabel(rating)`, `nightsBetween(checkIn, checkOut)`), `src/services/hotels.test.js`.
- **Requirements:** pure functions. Support the legacy `destination/date/options` params once (FR-SRCH-4). Guests = adults + children → `accommodates_gte` (fixes CONTEXT §7.9).
- **Acceptance:** the tests cover every FR-FILT, FR-SORT and FR-PAGE param, the legacy params, and invalid values (ignored).

### [x] P1-5 Migrate existing components to the normalized fields
- **Objective:** keep the current UI working on the new data before the redesign.
- **Deps:** P1-3, P1-4.
- **Files:** `Hotels.jsx`, `LocationList.jsx`, `SingleHotel.jsx`, `AppLayout.jsx`, `Map.jsx` (popup label), `HotelsProvider.jsx` (use `buildHotelQuery`; read `X-Total-Count`, which requires `useFetch` to return headers or the provider to call axios directly).
- **Acceptance:** Home, Results and Details render with the new data. Prices use `formatPrice` (no hard-coded €). Map markers render.
- **Verify:** manual pass across all routes. Lint passes.

---

## P2 — Design foundation

### [x] P2-1 Tokens, reset and focus ring
- **Objective:** implement design.md §2.
- **Deps:** none (can run in parallel with P1).
- **Files:** `src/index.css`, `src/App.css` (replace raw colors and radii with tokens where touched).
- **Requirements:** keep the existing token names. Add the new tokens. Replace the global `outline: none` with a `:focus-visible` ring. Add the reduced-motion block.
- **Acceptance:** Tab through Home and see a visible ring on every control. No visual regressions beyond the intended color changes (secondary text moves to `--text-600`).
- **Verify:** manual keyboard pass. DevTools contrast check on card text.

### [x] P2-2 Buttons, inputs, app shell
- **Objective:** design.md §5.8 and §3 landmarks.
- **Deps:** P2-1.
- **Files:** `App.css` (`.btn*`, `.formControl`), `App.jsx` (`<main id="main">`, skip link, footer with attribution per FR-ATTR-1), `Header.jsx` (`<header>`, `<nav>`).
- **Acceptance:** one `<main>` per page, the skip link works, and the footer attribution shows the snapshot date (from `/cities`).

---

## P3 — Search & destination

### [x] P3-1 Destination combobox from `cities`
- **Objective:** FR-SRCH-1, FR-SRCH-5.
- **Deps:** P1-3, P2-1.
- **Files:** `Header.jsx` (or extracted `SearchBar/SearchBar.jsx`), `App.css`. Optionally a small `useCities` hook or `CitiesProvider` following the context convention.
- **Requirements:** ARIA combobox pattern (design.md §5.2). Submitting is blocked unless a city is chosen.
- **Acceptance:** keyboard-only selection works. A screen reader announces the option count. Unknown text can't be submitted.
- **Verify:** component test with user-event (↓, Enter, Esc).

### [x] P3-2 Dates and guests
- **Objective:** FR-SRCH-2, FR-SRCH-3.
- **Deps:** P3-1.
- **Files:** `Header.jsx` (`GuestOptionList`, `OptionItem`), `App.css` (date-range theme overrides).
- **Requirements:** triggers become `<button>`s and popovers become dialogs (Esc, focus return). Remove the rooms stepper. Validate check-out > check-in. Max 16 guests. Write ISO dates to the URL.
- **Acceptance:** the URL matches FR-SRCH-4. A reload restores the form state. Legacy URLs still work.

### [x] P3-3 Mobile search sheet
- **Objective:** design.md §5.2 mobile variant.
- **Deps:** P3-2, P2-2.
- **Files:** new `SearchSheet/SearchSheet.jsx`, `Header.jsx`, `App.css`.
- **Acceptance:** at 375 px the pill opens a full-screen dialog with focus trapped. Search closes it and navigates.

---

## P4 — Listing & cards

### [x] P4-1 HotelCard component
- **Objective:** design.md §5.1, FR-LIST-1.
- **Deps:** P1-4, P2-1.
- **Files:** new `HotelCard/HotelCard.jsx`, `App.css`.
- **Requirements:** grid and compact variants. Stretched link with a separate heart slot (the heart is wired in P7). Image `onError` fallback (FR-STATE-4). Lazy loading.
- **Acceptance:** renders correctly with null price, null rating and a broken image URL.
- **Verify:** component tests for the 3 fallbacks.

### [x] P4-2 Results list page
- **Objective:** FR-LIST-2, -3, -4 and the design.md §4.2 header.
- **Deps:** P4-1, P1-5.
- **Files:** `Hotels.jsx`, `HotelsProvider.jsx` (total count, query string preserved on links), `App.css`.
- **Acceptance:** the count shows "N stays in City" (`aria-live`). Card links keep the query string. Back restores the list.

### [x] P4-3 Home / Explore page
- **Objective:** FR-LIST-5 and design.md §4.1.
- **Deps:** P4-1, P3-1.
- **Files:** `LocationList.jsx` (rework or rename to an `Explore` component; keep the route `/`), `App.css`.
- **Acceptance:** the hero, a city row linking to `/hotels?city=…`, and a Top rated row all render. Layout works at 360, 768 and 1280 px.

---

## P5 — Filters, sorting, pagination

### [x] P5-1 Verify json-server 0.17 query behaviors
- **Objective:** close the PRD §10 **[Assume]** items.
- **Deps:** P1-3.
- **Files:** `docs/PRD.md` §10 (record results). Adjust `buildHotelQuery` if needed.
- **Requirements:** with curl and in the browser, check that `X-Total-Count` is readable from axios (CORS expose header), that repeated `roomType=` behaves as OR, how null `price`/`rating` sort, and that `rating_gte` excludes nulls.
- **Acceptance:** each behavior is documented. Any workaround is chosen (e.g., client-side null ordering within the page, or data rule changes in P1-2).

### [x] P5-2 FilterBar, chips and FilterSheet
- **Objective:** FR-FILT-1…6 and design.md §5.3.
- **Deps:** P5-1, P4-2, P2-2.
- **Files:** new `FilterBar/FilterBar.jsx`, `FilterSheet/FilterSheet.jsx`, `App.css`, `services/hotels.js`.
- **Acceptance:** each filter updates the URL and the results. The active count badge is correct. "Clear all" resets the filters. Any change resets `page`. "Show N stays" shows the live count.
- **Verify:** unit tests for query mapping (P1-4). A component test for the sheet: apply, clear, Esc.

### [x] P5-3 Sorting
- **Objective:** FR-SORT-1, -2.
- **Deps:** P5-1.
- **Files:** new `SortSelect/SortSelect.jsx` (or inline in FilterBar), `services/hotels.js`.
- **Acceptance:** each option orders results as specified, and listings with null values come last per the P5-1 outcome.

### [x] P5-4 Pagination
- **Objective:** FR-PAGE-1, -2 and design.md §5.5.
- **Deps:** P5-1, P4-2.
- **Files:** new `Pagination/Pagination.jsx`, `Hotels.jsx`.
- **Acceptance:** 12 per page; numbers derive from `X-Total-Count`; the page is held in the URL; the view scrolls to the top on change. An out-of-range page clamps to the last page.

---

## P6 — Details

### [x] P6-1 Details page
- **Objective:** FR-DET-1, -3, -4 and design.md §4.3, §5.7.
- **Deps:** P4-1, P1-5.
- **Files:** `SingleHotel/SingleHotel.jsx`, new `AmenityList/AmenityList.jsx`, `App.css`. Results-map routing in `AppLayout.jsx`: on mobile, details render full-width without the map.
- **Acceptance:** all fields from FR-DET-1 render, with fallbacks. "Show all amenities" opens an accessible dialog. An unknown id shows not-found. The description renders as text only (NFR-SEC-2).

### [x] P6-2 Price card and demo CTA
- **Objective:** FR-DET-2.
- **Deps:** P6-1, P1-4 (`nightsBetween`, `formatPrice`).
- **Files:** new `PriceCard/PriceCard.jsx`, `App.css`.
- **Acceptance:** the "Reserve — demo only" button is disabled and described. The estimated total is labeled "estimate". The snapshot date is visible. Sticky behavior works on desktop and as a bottom bar on mobile.

---

## P7 — Favorites

### [x] P7-1 FavoritesProvider
- **Objective:** FR-FAV-2.
- **Deps:** P0-1 (Q3).
- **Files:** new `src/components/context/FavoritesProvider.jsx` (`useReducer`, actions `favorites/loaded`, `favorite/added`, `favorite/removed`; `useFavorites()` hook), `App.jsx` (provider), tests.
- **Requirements:** localStorage key `stays.favorites.v1`, wrapped in try/catch with an in-memory fallback and a one-time info toast.
- **Acceptance:** favorites persist across reloads, and the provider keeps working when localStorage throws.
- **Verify:** unit test the reducer and the storage failure path.

### [x] P7-2 Heart toggle and Saved page
- **Objective:** FR-FAV-1, -3, -4.
- **Deps:** P7-1, P4-1.
- **Files:** `HotelCard.jsx`, `SingleHotel.jsx`, new `Saved/Saved.jsx`, `App.jsx` (route `/saved`), `Header.jsx` (nav link).
- **Acceptance:** the heart uses `aria-pressed`. `/saved` lists favorites via `GET /hotels?id=…`, shows unavailable ids as "No longer available", and has an empty state.

---

## P8 — Loading, error, empty and fallback states

### [x] P8-1 Skeleton, EmptyState, ErrorState components
- **Objective:** FR-STATE-1…3 and design.md §6.
- **Deps:** P4-2, P6-1.
- **Files:** new `Skeleton/`, `EmptyState/`, `ErrorState/`. Wire into `Hotels.jsx`, `SingleHotel.jsx`, `Saved.jsx`, Explore. Expose `error` and `refetch` from `useFetch`/providers.
- **Acceptance:** with json-server stopped, Results shows ErrorState and Retry recovers once the server is restarted. With no matches, EmptyState shows "Clear filters". Skeletons have `role="status"`.

### [x] P8-2 Map behaviour fixes
- **Objective:** FR-MAP-1…3 and design.md §5.6.
- **Deps:** P4-2.
- **Files:** `Map/Map.jsx`, `AppLayout.jsx`, `BookmarkLayout.jsx`, `App.css`.
- **Requirements:** a prop such as `enableAddBookmark` (true only in BookmarkLayout). Price `divIcon` markers for hotels. Card ↔ marker highlight via the existing `currentHotel`/`?lat&lng` pattern. Mobile map toggle.
- **Acceptance:** clicking the hotels map no longer navigates. Bookmark adding still works. On mobile the map opens from the toggle.

---

## P9 — Responsive design & accessibility

### [x] P9-1 Mobile-first layout and bottom navigation
- **Objective:** design.md §2.4 and §3.
- **Deps:** P2-2, P4-2, P8-2.
- **Files:** `App.css` (invert `.sidebar` and `.appLayout` to `min-width` queries), new `BottomNav/BottomNav.jsx`, `App.jsx`.
- **Acceptance:** no horizontal scroll at 320, 360, 768, 1024 or 1440 px. The bottom nav shows below 640 px with `aria-current`. The desktop split view is preserved.

### [ ] P9-2 Keyboard and screen-reader pass
- **Objective:** FR-A11Y-1…5.
- **Deps:** all UI tasks.
- **Files:** as found. Includes `Login.jsx` (`type="password"`, `autocomplete`).
- **Acceptance:** the full J1–J4 journeys can be completed with keyboard only. Dialogs trap focus and restore it. axe DevTools reports 0 serious or critical issues on `/`, `/hotels`, `/hotels/:id` and `/saved`.
- **Verify:** manual keyboard pass, axe browser extension, and a screen reader (NVDA or VoiceOver) spot check.

### [x] P9-3 Contrast and motion audit
- **Objective:** FR-A11Y-2, -5.
- **Deps:** P9-1.
- **Acceptance:** no text uses `--text-400`. All text pairs come from design.md §2.1 and pass. Reduced motion disables the shimmer and zoom effects.

---

## P10 — Testing, performance & final verification

### [ ] P10-1 Performance pass
- **Objective:** NFR-PERF-1…3.
- **Deps:** P9-1.
- **Requirements:** check image `loading`, `decoding`, `aspect-ratio` and eager loading for the first row. Confirm no layout shift from the map.
- **Acceptance:** Lighthouse mobile LCP < 2.5 s and CLS < 0.1 on `/hotels` (preview build). The bundle delta vs. the P0-5 baseline is ≤ 30 KB gzip.

### [x] P10-2 Final verification and docs sync
- **Objective:** release-ready MVP.
- **Deps:** all.
- **Files:** `CONTEXT.md`, `docs/PRD.md`, `README.md` (fix the project structure section, clone URL and license statement per CONTEXT Q7; add data import steps and attribution).
- **Acceptance:** `npm run lint`, `npm test` and `npm run build` are clean. The manual journey script below passes. The docs reflect the final state, with open questions closed or carried forward.
- **Manual journey script:**
  1. `npm run server`, `npm run dev`.
  2. Home → pick "Amsterdam" by keyboard → dates → 3 guests → Search.
  3. Apply "Entire home/apt", 4.5+ and Kitchen → sort by price ascending → go to page 2 → reload; the state persists.
  4. Open a stay; check the price card's demo label and estimated total; save it; press Back; the list position and filters are kept.
  5. Open `/saved`; the stay is listed; remove it; the empty state shows.
  6. Stop json-server → Results shows the error state; restart → Retry works.
  7. Repeat steps 2–5 at 375 px width, including the map toggle.
  8. Log in (demo) → Places → click the map → add a bookmark (regression).

---

## Traceability

| Requirement | Design § | Tasks |
|---|---|---|
| FR-SRCH-1…5 | 5.2 | P3-1, P3-2, P3-3, P1-4 |
| FR-LIST-1…5 | 4.1, 4.2, 5.1 | P4-1, P4-2, P4-3, P1-5 |
| FR-FILT-1…6 | 5.3 | P1-2 (flags), P1-4, P5-1, P5-2 |
| FR-SORT-1…2 | 5.4 | P1-4, P5-1, P5-3 |
| FR-PAGE-1…2 | 5.5 | P1-4, P5-1, P5-4 |
| FR-DET-1…4 | 4.3, 5.7 | P6-1, P6-2 |
| FR-FAV-1…4 | 4.4, 5.1 | P7-1, P7-2 |
| FR-MAP-1…3 | 4.2, 5.6 | P8-2, P9-1 |
| FR-STATE-1…5 | 6 | P0-3, P4-1, P8-1 |
| FR-A11Y-1…5 | 2.3, 7 | P2-1, P2-2, P3-*, P9-2, P9-3 |
| FR-ATTR-1 | 4.1 | P1-3, P2-2 |
| NFR-PERF-* | 2.4 | P0-5, P1-2, P10-1 |
| NFR-SEC-*, NFR-PRIV-* | — | P1-2, P6-1 |
| NFR-QUAL-1 | — | P0-4, P1-4, P10-2 |
