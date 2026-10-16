# Design specification — Stays

| | |
|---|---|
| Status | v1 · implemented 2026-10-16 (deviations noted inline as **Built:**) |
| Related | [PRD.md](PRD.md) (FR IDs referenced below) · [CONTEXT.md](../CONTEXT.md) · [TASK.md](../tasks/TASK.md) |
| Stack constraint | React 18 + global CSS (`src/index.css` tokens, `src/App.css` components), react-icons, react-date-range, react-leaflet. **No new UI or CSS libraries; no web fonts.** |

## 0. Reference status (read first)

| Reference | Status | How it is used |
|---|---|---|
| Dribbble — [Modern Hotel Booking Mobile App](https://dribbble.com/shots/27240483-Modern-Hotel-Booking-Mobile-App) | **Could not be inspected.** Dribbble served a bot challenge (HTTP 202, empty page) to automated fetches on 2026-10-16. Its exact palette, typography and screens are **unverified**. | Only the brief's described direction is used: premium, mobile-first, image-led cards, large photography, clear hierarchy, consistent radii. Items marked **(ref-inferred)** must be compared with the shot by a human (CONTEXT Q6). |
| [airbnb.com](https://www.airbnb.com/) | Interaction-pattern reference, chosen by the repo owner. | Patterns only, not branding: pill search bar, image-first grid, list + map split, filter chips + filter sheet, heart on card photo, sticky price card on details, bottom tab bar on mobile. **Don't copy** Airbnb's logo, wordmark, the "Rausch" brand color or its proprietary font. |
| Existing app | [Fact] | Keeps the indigo primary (`--primary-600`), rose accent (`--rose-500`), slate neutrals and camelCase global classes. |

Tags used below: **(ref-inferred)** from the brief or the Dribbble description, unverified · **(airbnb-pattern)** · **(repo)** keeps existing behavior · **(new)** a decision made here.

---

## 1. Design principles

1. **Photo first.** Imagery carries the card; text is secondary and short. (ref-inferred)
2. **Calm surfaces, one accent.** Neutral backgrounds, indigo for actions, rose only for favorites. (new)
3. **Honest data.** Snapshot prices and demo-only booking are always labeled (PRD §5.3).
4. **Mobile first.** Design at 360–430 px, then enhance for tablet and desktop. (ref-inferred)
5. **Keyboard and screen-reader parity.** Every pointer interaction has a keyboard path (FR-A11Y).

---

## 2. Design tokens

Define these on `:root` in `src/index.css`. **Existing names are kept** (marked ✓) so current CSS keeps working. New names are added. Contrast is measured on `--surface` (#fff) unless noted.

### 2.1 Color

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--bg-color` ✓ | `#f3f4f6` | App background (desktop) | — |
| `--surface` | `#ffffff` | Cards, sheets, header | — |
| `--surface-muted` | `#f8fafc` | Input fills, skeleton base | — |
| `--text-900` | `#111827` | Headings, prices | 17.7:1 |
| `--text-700` ✓ | `#374151` | Body text | 10.3:1 |
| `--text-600` (fixes an undefined var) | `#475569` | Secondary text on any surface | 7.6:1 |
| `--text-500` ✓ | `#64748b` | Meta text **on white only** | 4.76:1 (4.32 on `--bg-color` ✗) |
| `--text-400` ✓ | `#94a3b8` | **Icons, placeholders and disabled only — never body text** | 2.56:1 ✗ text |
| `--text-300` ✓ | `#d1d5db` | Dividers | — |
| `--text-100` ✓ | `#f1f5f9` | Subtle fills | — |
| `--border` | `#e2e8f0` | Card and input borders (decorative) | — |
| `--border-strong` | `#64748b` | Input borders that must meet 3:1 | 4.76:1 |
| `--primary-700` ✓ | `#4338ca` | Primary hover/pressed, links | 7.9:1 |
| `--primary-600` ✓ | `#4f46e5` | Primary buttons (white text 6.29:1), focus ring | 6.29:1 |
| `--primary-100` ✓ | `#e0e7ff` | Selected chip bg (text `--primary-700` 6.41:1) | — |
| `--rose-500` ✓ | `#f43f5e` | Filled heart icon (UI ≥ 3:1 ✓ 3.67) | 3.67:1 |
| `--rose-600` | `#e11d48` | Rose **text** | 4.70:1 |
| `--amber-700` | `#b45309` | Star/rating text | 5.02:1 |
| `--success-700` | `#15803d` | "Instant bookable", success | 5.02:1 |
| `--danger-700` | `#b91c1c` | Errors | 6.47:1 |
| `--scrim` | `rgb(17 24 39 / 0.55)` | Sheet/dialog backdrop; image text overlays | — |
| `--image-gradient` | `linear-gradient(to top, rgb(17 24 39 / .6), transparent 60%)` | Text over photos (ref-inferred) | White text on darkest 40% ≥ 4.5 |

Dark mode is **out of MVP scope**. If added, the verified pairs are: `#e2e8f0` on `#0f172a` (14.5:1), `#94a3b8` on `#0f172a` (6.96:1), primary `#818cf8` (5.98:1), rose `#fb7185` (6.63:1).

### 2.2 Typography

Font stack: keep the existing `Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif` (repo). Body is 16 px, so iOS doesn't zoom on input focus.

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `--fs-display` | 2rem / 1.15 (desktop 2.5rem) | 700 | Home hero heading |
| `--fs-h1` | 1.5rem / 1.25 | 700 | Page title, details name |
| `--fs-h2` | 1.25rem / 1.3 | 600 | Section titles |
| `--fs-h3` | 1.0625rem / 1.35 | 600 | Card title |
| `--fs-body` | 1rem / 1.5 | 400 | Body |
| `--fs-sm` | 0.875rem / 1.45 | 400/500 | Meta, chips |
| `--fs-xs` | 0.75rem / 1.4 | 500 | Badges, captions (min size) |

Prices use `font-variant-numeric: tabular-nums` and weight 600.

### 2.3 Spacing, radii, elevation, motion

- **Spacing (4 px base):** `--space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 20 · `-6` 24 · `-8` 32 · `-10` 40 · `-12` 48 px. The page gutter is 16 px (mobile), 24 px (tablet) and 32 px (desktop).
- **Radii** (ref-inferred "consistent corner radii"): `--radius-sm` 8 (inputs, small buttons) · `--radius-md` 12 (chips-as-buttons, popovers) · `--radius-lg` 16 (cards, images) · `--radius-xl` 24 (sheets, search pill on mobile, detail hero) · `--radius-pill` 999 (search bar, chips, heart button).
- **Shadows:**
  - `--shadow-1`: `0 1px 2px rgb(15 23 42 / .06), 0 1px 3px rgb(15 23 42 / .08)` (cards at rest)
  - `--shadow-2`: `0 4px 12px rgb(15 23 42 / .10)` (hover, popovers, search pill)
  - `--shadow-3`: `0 12px 32px rgb(15 23 42 / .18)` (sheets, dialogs)
- **Motion:** `--dur-fast` 120 ms (hover/press), `--dur-base` 200 ms (popover), `--dur-slow` 300 ms (sheet), easing `cubic-bezier(.2,.8,.2,1)`. Under `@media (prefers-reduced-motion: reduce)` transitions are 0 ms and image zoom is disabled.
- **Focus ring:** `outline: 2px solid var(--primary-600); outline-offset: 2px;` applied with `:focus-visible`. This **replaces** the global `outline: none` in `index.css` (FR-A11Y-1).
- **z-index scale:** map 0 · map controls 400 · header 900 · popover 1000 (matches existing `.guestOptions`) · date picker 1002 (existing) · sheet/backdrop 1100 · toast 1200.

### 2.4 Breakpoints

| Name | Range | Layout |
|---|---|---|
| mobile | < 640 px | 1-column cards; bottom tab bar; search collapses into a pill that opens a full-screen sheet; map behind a toggle |
| tablet | 640–1023 px | 2-column grid; top header with compact search pill; map toggle |
| desktop | ≥ 1024 px | Full header search; `/hotels` split view list (≈ 55%) + sticky map (≈ 45%); 3–4 column grid on Home |

Use `min-width` media queries (mobile-first). This **inverts** the current `.sidebar` rule, which starts at 35% and goes to 50% at ≥ 768 px.

---

## 3. Information architecture & navigation

| Route | Page | Nav label | Notes |
|---|---|---|---|
| `/` | Home / Explore | Explore | (repo `LocationList`) |
| `/hotels?…` | Results (list + map) | — | (repo `AppLayout` + `Hotels`) |
| `/hotels/:id?…` | Details | — | (repo `SingleHotel`) |
| `/saved` | Saved (favorites) | Saved | (new, FR-FAV-3) |
| `/bookmark…` | Bookmarked places (login required) | Places | (repo) |
| `/login` | Login (demo) | Log in / user name | (repo) |

- **Desktop header** (`<header>`): wordmark "Stays" at left (text, no logo asset), pill search in the center, `Saved`, `Places`, and the user/login link at right.
- **Mobile:** sticky top bar containing the search pill ("Where to? · Dates · Guests" summary). A fixed **bottom tab bar** (`<nav aria-label="Primary">`) holds Explore · Saved · Places · Account, with 56 px height and safe-area padding. The active tab is indicated by color **and** a label weight change; the active link gets `aria-current="page"`, which NavLink provides. (airbnb-pattern)

---

## 4. Page layouts

### 4.1 Home / Explore (FR-LIST-5, FR-SRCH)

1. **Hero** (ref-inferred): full-bleed photo (first city's `imageUrl`) with `--radius-xl` at the bottom on mobile, heading "Find your next stay", and the search pill overlapping the bottom edge.
2. **Explore cities:** horizontal scroll-snap row on mobile, grid on desktop. Each city card is 3:4, shows the photo with a gradient, city name and "N stays", and links to `/hotels?city=<id>`.
3. **Top rated:** HotelCards (rating ≥ 4.8, `_sort=reviewCount&_order=desc&_limit=8`), in a horizontal row on mobile and a grid on desktop.
4. **Footer:** attribution (FR-ATTR-1).

### 4.2 Results (FR-LIST, FR-FILT, FR-SORT, FR-PAGE, FR-MAP)

```
Mobile                              Desktop (≥1024)
┌──────────────────────┐            ┌───────────────────────────┬──────────────┐
│ [search pill]        │            │ header + search           │              │
│ [Filters (2)] [chips→]│           │ 128 stays in Amsterdam    │              │
│ 128 stays · Sort ▾   │            │ [Filters][chips…] Sort ▾  │   MAP        │
│ ┌──────────────────┐ │            │ ┌─────┐ ┌─────┐           │  (sticky,    │
│ │  photo 4:3   ♥   │ │            │ │card │ │card │  2-col    │  full height)│
│ └──────────────────┘ │            │ └─────┘ └─────┘           │              │
│ title / meta / price │            │ …                         │              │
│ …                    │            │ ‹ 1 2 3 … ›               │              │
│      [ Map ⌖ ] (FAB) │            └───────────────────────────┴──────────────┘
└──────────────────────┘
```

- **Results header** (`aria-live="polite"`): "128 stays in Amsterdam · 12–15 Nov · 3 guests".
- **Filter bar:** a "Filters" button with an active-count badge, quick chips (room type, rating 4.5+, Instant), and a Sort select at right.
- **Map toggle (mobile/tablet):** floating pill button "Map" / "List" at bottom center, above the tab bar.
- **Desktop map:** sticky, `height: calc(100vh - header)`, `--radius-lg` on the left corners.

### 4.3 Details (FR-DET)

Mobile order: hero image (4:3, full-bleed, with back and heart buttons overlaid as 44 px circular white buttons) → title block → key facts row → highlights → description (clamped to 6 lines + "Read more") → amenities (10 + "Show all" dialog) → host → location mini-map (non-interactive until tapped) → **sticky bottom bar** with price/night + "Reserve — demo only".

**Built:** Details is its own full-width route (no results map beside it) on every size, with the location mini-map inside the page.

Desktop: two columns. On the left, content (max 680 px). On the right, a **sticky price card** (top 96 px): price/night (snapshot), date and guest summary (editable, which opens the search popovers), estimated total, disabled CTA, and helper text "Demo — this app does not take bookings. Prices are a snapshot from <date>."

### 4.4 Saved (FR-FAV-3)

Title "Saved", count, and a HotelCard grid. Unavailable favorites render a muted card with "No longer available" and a Remove button. The empty state reads "No saved stays yet — tap ♥ on any stay to save it" with a link to Explore.

### 4.5 Places (Bookmarks) and Login

These keep their current structure (repo) and adopt the tokens, form styles and focus rules. The Login password input becomes `type="password"` in P8.

---

## 5. Component specifications

Component file placement follows the repo convention `src/components/<Name>/<Name>.jsx`. Styles go in `App.css` under a comment header per component, with camelCase class names.

### 5.1 HotelCard (new; replaces `.searchItem` and `.locationItem` markup)

| Part | Spec |
|---|---|
| Container | `<article>` with the whole card linked through the title `<a>` (stretched-link pattern via `::after`) so the heart stays a separate button. Radius `--radius-lg`, no border, image + text stack, gap `--space-3`. |
| Image | `aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--radius-lg)`; `loading="lazy"` (eager for the first 2), `decoding="async"`, `alt="{name}"`. Hover (pointer only) scales the image 1.03 over `--dur-base`. |
| Heart | `<button aria-pressed aria-label="Save {name}">`, 40 px visual inside a 44 px hit area, top-right with 12 px inset, white circle at 90% opacity with `--shadow-1`. Outline icon `--text-900`; when pressed, filled `--rose-500`. Toggling announces through the toast "Saved" / "Removed". |
| Badges (over image, top-left) | "Superhost" or "Instant" in `--fs-xs`, white bg, `--radius-pill`. Max one. |
| Line 1 | Name, `--fs-h3`, 1 line ellipsis. Rating at right: ★ `--amber-700` + "4.86" (or "New"). |
| Line 2 | `{neighbourhood} · {city}`, `--fs-sm`, `--text-600`. |
| Line 3 | `{roomType} · {accommodates} guests · {beds} beds`, `--fs-sm`, `--text-600`. |
| Price | `**€142** night` (`Intl.NumberFormat(undefined,{style:'currency',currency})`), 600 weight + `--text-600` "night". If null: "Price unavailable" in `--text-600`. Optional tooltip or footnote "snapshot price". |
| Selected (map hover/active) | `outline: 2px solid var(--primary-600)` with `--primary-100` background (evolves `.current-hotel`). |
| Variants | `grid` (default) and `compact` (horizontal, 96 px thumb, used in map popups) |

### 5.2 SearchBar (evolves `Header.jsx` `.headerSearch`)

- **Desktop pill:** height 64 px, `--radius-pill`, `--shadow-2`, three segments (Where · When · Who) separated by 1 px `--border` dividers, and a 48 px circular primary search button with `aria-label="Search"`.
- **Destination combobox** (FR-SRCH-1, -5): `<input role="combobox" aria-expanded aria-controls aria-autocomplete="list">` + `<ul role="listbox">` of cities (flag via react-country-flag, name, "N stays"). ↑/↓ move, Enter selects, Esc closes. With no match, the list shows "No stays in that destination yet."
- **Dates:** the trigger is a `<button aria-haspopup="dialog">` with the label "12 Nov – 15 Nov" or "Add dates". The popover is a `role="dialog"` containing react-date-range `DateRange` (desktop `months={2}`, mobile 1). Footer: "Clear" and "Done". Theme overrides map `rdrSelected/InRange` colors to `--primary-600`.
- **Guests:** a dialog with steppers (repo `OptionItem`): Adults (min 1), Children (min 0). Rooms are removed. Each stepper button has `aria-label="Decrease adults"` and the count is `aria-live`.
- **Mobile:** the collapsed pill opens a full-screen sheet (`role="dialog" aria-modal="true"`) with stacked sections and sticky "Clear all" / "Search" buttons.
- **Built:** the full pill shows at ≥ 1024 px; below that the compact pill opens the sheet. All modals use the native `<dialog>` element with `showModal()` (focus containment, inert background, Esc and focus return come from the browser). On `/` the search sits in the hero instead of the header.
- `useOutsideClick` stays for pointer users. Esc and focus-return are added for keyboard users.

### 5.3 FilterBar, FilterChips, FilterSheet (new)

- **Chip:** 36 px height (44 px hit area through padding), `--radius-pill`, 1 px `--border-strong` border. Selected: `--primary-100` bg, `--primary-700` text and border, `aria-pressed="true"`.
- **FilterSheet:** bottom sheet on mobile (max-height 90vh, `--radius-xl` top corners) and a centered dialog of 560 px on desktop. Sections:
  1. Price per night: two number inputs (min/max, with currency prefix) + optional dual range. Empty means unbounded.
  2. Type of place: chips (multi).
  3. Rating: segmented radio group Any · 4.0+ · 4.5+ · 4.8+.
  4. Amenities: checkboxes in 2 columns, with icons from react-icons (`MdWifi`, `MdKitchen`, `MdAcUnit`, `MdLocalLaundryService`, `MdLocalParking`, `MdLaptop`).
  5. ~~Booking options: "Instant bookable" switch~~ (dropped: no data, see PRD FR-FILT-5).
  - Footer: "Clear all" (text button) and "Show N stays" (primary; N from a debounced count query with `_limit=1`).
- Changes apply on "Show" in the sheet and immediately for quick chips. Both reset `page` to 1 (FR-FILT-6).

### 5.4 SortSelect

A native `<select>` styled as a chip (accessible by default) with the options from FR-SORT-1 and the label "Sort by".

### 5.5 Pagination

`<nav aria-label="Pagination">`. Desktop shows ‹ Prev, numbers with ellipsis, and Next ›. Mobile shows Prev, "Page 2 of 11" and Next. The current page has `aria-current="page"` and a primary filled circle. Buttons are 44 px.

### 5.6 Map (evolves `Map.jsx`)

- Markers: on the Results page, a custom `L.divIcon` **price pill** marker (white pill with `--text-900` price; the selected or hovered marker inverts to `--text-900` bg with white text). This uses Leaflet's built-in divIcon, so it adds no dependency. Bookmarks keep default markers.
- The popup holds the compact HotelCard with an "Open" link.
- "Use your location" moves to a 44 px icon button at top-right with `aria-label`.
- The hotels map must not navigate to `/bookmark/add` on click (FR-MAP-2).

### 5.7 Details pieces

- **KeyFacts:** inline list "4 guests · 2 bedrooms · 2 beds · 1.5 baths", wrapping, with `·` separators set `aria-hidden`.
- **Highlights:** up to 3 rows (icon + title + one line): Superhost, Instant bookable, rating ≥ 4.8 "Guest favourite (rating)". (airbnb-pattern; wording is our own)
- **AmenityList:** 2-column grid, 24 px icons, `--fs-body`. The "Show all N amenities" dialog lists everything alphabetically.
- **PriceCard:** see §4.3. The CTA is `<button disabled aria-describedby="demo-note">Reserve — demo only</button>`.

### 5.8 Buttons and inputs (evolve `.btn`, `.formControl`)

| Variant | Spec |
|---|---|
| Primary | `--primary-600` bg, white text, 44 px min height, `--radius-sm` (pill in the search), hover `--primary-700`, disabled 40% opacity + `cursor:not-allowed` (repo rule) |
| Secondary | white bg, 1 px `--border-strong`, `--text-900` |
| Ghost / text | no bg, `--primary-700`, underline on hover |
| Icon button | 44 × 44 px, circular, `aria-label` required |
| Input | 44 px min height, 1 px `--border-strong`, `--radius-sm`, 16 px text; focus = focus ring; error = `--danger-700` border + message linked via `aria-describedby` |

---

## 6. States (FR-STATE)

| State | Visual | Copy | Behavior |
|---|---|---|---|
| Loading list | 6 (mobile) / 12 (desktop) **skeleton cards**: 4:3 block + 3 bars, `--surface-muted` with a 1.2 s shimmer (static under reduced motion) | Visually hidden "Loading stays…" (`role="status"`) | Replaces `Loader` text in lists; `Loader` stays for small inline cases |
| Loading details | Hero block + text bars + price card block | "Loading stay…" | |
| Empty results | Icon `HiOutlineSearch` 48 px, h2, body, 2 buttons | "No stays match your filters" / "Try removing a filter or choosing another destination." | Buttons: "Clear filters" (primary), "Change destination" (secondary) |
| Error (network) | Icon `HiOutlineExclamationCircle` `--danger-700`, h2, body | "We couldn't load stays" / "Check that the data server is running (`npm run server`) and try again." | "Retry" refetches. A toast also fires (repo convention). Aborts never show this state. |
| Not found (details) | as Error | "This stay isn't available" | Link back to results with the query preserved |
| Image fallback | `--surface-muted` box with `MdHotel` 40 px `--text-400` icon centered, same aspect ratio | alt stays the listing name | `onError` swaps in the placeholder once (no loop) |
| Price missing | text | "Price unavailable" | Excluded from price filter results by the query |
| Rating missing | text | "New" | Excluded when `rating_gte` is set |
| Favorite unavailable | 50% opacity card | "No longer available" | Remove button |
| Storage unavailable | none | — | Favorites work for the session only. A single info toast says "Favorites won't be saved on this device". |

---

## 7. Accessibility requirements (WCAG 2.2 AA, FR-A11Y)

- **Landmarks:** `<header>`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer>`, and a "Skip to content" link as the first focusable element.
- **Headings:** one `<h1>` per page (Home: hero heading; Results: "Stays in Amsterdam"; Details: listing name).
- **Focus:** `:focus-visible` ring everywhere (§2.3). Focus moves into a dialog or sheet on open and returns to its trigger on close. Esc closes. Background content is `inert` while a modal sheet is open.
- **Keyboard:** popovers today are `<div onClick>`. They must become `<button>`s, and the combobox follows the ARIA APG pattern.
- **Live regions:** the results count and guest counts are `aria-live="polite"`. Toasts come from react-hot-toast, which has its own role.
- **Contrast:** only the token pairs in §2.1 marked as passing are used for text. `--text-400` is never used for text.
- **Targets:** ≥ 44 × 44 px (exceeds WCAG 2.2's 24 px minimum).
- **Images:** card and detail images get `alt={name}`; decorative icons get `aria-hidden="true"`.
- **Map:** the map is supplementary. Every result is reachable in the list, the map container has `aria-label="Map of results"`, and marker buttons get the listing names. Keyboard users never need the map.
- **Forms:** visible labels (the existing `formControl` labels), errors announced through `aria-describedby`, and `autocomplete` on the login fields.
- **Motion:** honor `prefers-reduced-motion` (§2.3).
- **Zoom:** usable at 200% zoom and 320 px reflow without horizontal scroll (except the city carousel, which is scroll-snap and keyboard focusable).

---

## 8. Mapping to the existing codebase

| Design element | Existing file / class | Change type |
|---|---|---|
| Tokens, reset, focus ring | `src/index.css` `:root`, `*` reset | Extend tokens; replace `outline: none` with `:focus-visible` |
| SearchBar | `src/components/Header/Header.jsx` (`.headerSearch`, `GuestOptionList`, `OptionItem`) | Refactor in place; extract `SearchBar/` if the file grows over ~250 lines |
| Header / nav / bottom tab bar | `Header.jsx` (`NavLink`, `User`) | Add `<header>` and `<nav>`; add the `BottomNav/` component |
| HotelCard | Markup in `Hotels.jsx` (`.searchItem`) and `LocationList.jsx` (`.locationItem`) | New `HotelCard/HotelCard.jsx` used by both |
| Home / Explore | `LocationList/LocationList.jsx` (`.nearbyLocation`, `.locationList`) | Replaced by `Explore/Explore.jsx` (hero + cities + guest favourites) |
| Results list | `Hotels/Hotels.jsx` (`.searchList`) | Use HotelCard, filter bar, pagination |
| Results layout + map | `AppLayout/AppLayout.jsx` (`.appLayout`, `.sidebar`), `Map/Map.jsx` | Mobile-first split; map toggle; price markers; disable click-to-bookmark on hotels |
| Details | `SingleHotel/SingleHotel.jsx` (`.room`, `.roomDetail`) | Rebuilt per §4.3; route moved out of `AppLayout` |
| Filters / sort / pagination | — | New `FilterBar/`, `FilterSheet/`, `Pagination/` |
| Favorites | — (pattern from `context/BookmarkListContext.jsx`) | New `context/FavoritesProvider.jsx`, `Saved/Saved.jsx` |
| States | `Loader.jsx` | `States/States.jsx` (`StateMessage`, `ErrorState`, skeletons); `Loader` kept for bookmarks |
| Buttons and forms | `.btn`, `.btn--primary`, `.btn--back`, `.formControl` in `App.css` | Restyle per §5.8; keep class names |
| Date picker theme | `react-date-range/dist/theme/default.css` import in `Header.jsx` | Override colors in `App.css` |
| Icons | react-icons (`hi`, `md`) | Reuse; no new icon set |

**Not introduced:** CSS-in-JS, Tailwind, component libraries, web fonts, carousel or gallery libraries.
