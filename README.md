# Booking Hotel App — "Stays"

A hotel and short-stay discovery app built with **React** and **Vite**. Search a destination, filter and sort stays, see them on a map, open the details and save favourites. Bookmarked map places and a demo login are included too.

Listing data is a static snapshot from [Inside Airbnb](https://insideairbnb.com/get-the-data/) (CC BY 4.0). **This is a demo:** it does not take bookings, and prices are snapshot prices, not live rates.

---

## Features

1. **Search:** destination combobox (from the cities in the data), check-in/check-out range and guest steppers. All search state lives in the URL, so results can be shared and reloaded.
2. **Results:** image-led cards, a list + map split view on desktop, a map toggle on mobile, and price-pill markers.
3. **Filters & sorting:** price range, type of place, guest rating, amenities, and sort by price or rating. Pagination reads `X-Total-Count` from json-server.
4. **Details:** photo, key facts, highlights, description, amenities, host, location map and a price card with an estimated total.
5. **Favourites:** heart any stay; saved stays persist in `localStorage` and are listed on `/saved`.
6. **Bookmarks:** click the map to bookmark a place (requires the demo login).
7. **States & accessibility:** skeletons, empty and error states with Retry, image fallbacks, visible focus, keyboard-operable popovers and dialogs, and a mobile bottom navigation.

## Tech

React 18, React Router 6, Context API + reducers, Axios, React-Leaflet, React-Date-Range, React-Hot-Toast, react-icons, JSON Server 0.17, ESLint, plus Node's built-in test runner for unit tests.

---

## Getting started

```bash
npm install
npm run dev      # app on http://localhost:5173 + json-server on http://localhost:5000
```

The app reads the API address from `VITE_API_URL` (default `http://localhost:5000`). If port 5000 is taken, run `npx json-server --watch server/db.json --port 5055` and start the app alone with `VITE_API_URL=http://localhost:5055 npm run client`, or put the variable in `.env.local` (see `.env.example`).

| Script | What it does |
|---|---|
| `npm run dev` | Client and server together; Ctrl+C stops both |
| `npm run client` | Vite dev server only |
| `npm run server` | json-server only, with a 500 ms delay |
| `npm run build` / `npm run preview` | Production build and local preview |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm test` | Unit tests (search/query mapping, CSV import) |
| `npm run data:import` | Rebuild `server/db.json` from downloaded Inside Airbnb files |

## Updating the data

1. Download each city's `listings.csv.gz` **once** from the `sourceUrl` values in `scripts/cities.config.json` into the matching `data/raw/<city>/<date>/` folder (git-ignored).
2. Run `npm run data:import`. It keeps the top 25 listings per city, normalizes them and preserves `bookmarks`.

See `server/ATTRIBUTION.md` for the source, license and the transformations applied.

---

## Project structure

```
src/
├── components/
│   ├── <Name>/<Name>.jsx   # one folder per component (HotelCard, SearchBar, FilterSheet, …)
│   └── context/            # Auth, Cities, Favorites, Bookmarks and Hotels providers
├── hooks/                  # useFetch, useDismiss, useMediaQuery, useGeoLocation, …
├── services/               # API client, search ↔ URL ↔ query mapping, formatters (+ tests)
├── App.jsx                 # providers, layout and routes
├── App.css / index.css     # component styles / design tokens
scripts/                    # Inside Airbnb import (CSV parser, normalizer, tests)
server/db.json              # json-server data: hotels, cities, bookmarks
docs/                       # PRD and design spec
tasks/TASK.md               # implementation plan
CONTEXT.md                  # architecture notes for contributors
```

---

## Data & attribution

Listing data © [Inside Airbnb](https://insideairbnb.com/), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Photos are served from Airbnb's CDN. Not affiliated with Airbnb.

## License

This project is licensed under the **MIT License**.
