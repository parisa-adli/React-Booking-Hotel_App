// Imports Inside Airbnb listing snapshots into server/db.json.
//
// Download each city's listings.csv.gz once (see scripts/cities.config.json
// for the URLs) into data/raw/, then run:  npm run data:import
//
// No network access: Inside Airbnb asks that data is downloaded once, not
// fetched on every run. Existing `bookmarks` in db.json are preserved.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvRecords } from "./lib/csv.mjs";
import {
  REQUIRED_COLUMNS,
  buildCity,
  isEligible,
  listingScore,
  normalizeListing,
} from "./lib/normalize.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  readFileSync(resolve(root, "scripts/cities.config.json"), "utf8")
);
const dbPath = resolve(root, "server/db.json");

function readListings(file) {
  const path = resolve(root, file);
  if (!existsSync(path)) {
    throw new Error(
      `Missing ${file}. Download it from the sourceUrl in scripts/cities.config.json.`
    );
  }
  const buffer = readFileSync(path);
  const text = file.endsWith(".gz")
    ? gunzipSync(buffer).toString("utf8")
    : buffer.toString("utf8");
  return parseCsvRecords(text);
}

function importCity(city) {
  const eligible = [];
  let total = 0;
  let checkedColumns = false;

  for (const row of readListings(city.file)) {
    if (!checkedColumns) {
      const missing = REQUIRED_COLUMNS.filter((column) => !(column in row));
      if (missing.length) {
        throw new Error(`${city.file} is missing columns: ${missing.join(", ")}`);
      }
      checkedColumns = true;
    }
    total++;
    if (isEligible(row)) eligible.push(row);
  }

  const hotels = eligible
    .sort((a, b) => listingScore(b) - listingScore(a) || a.id.localeCompare(b.id))
    .slice(0, config.listingsPerCity)
    .map((row) => normalizeListing(row, city));

  console.log(
    `${city.name}: ${total} listings, ${eligible.length} eligible, ${hotels.length} imported`
  );
  return hotels;
}

const existing = existsSync(dbPath)
  ? JSON.parse(readFileSync(dbPath, "utf8"))
  : {};

const hotels = [];
const cities = [];
for (const city of config.cities) {
  const cityHotels = importCity(city);
  if (!cityHotels.length) continue;
  hotels.push(...cityHotels);
  cities.push(buildCity(city, cityHotels));
}

const db = {
  hotels,
  cities,
  bookmarks: existing.bookmarks ?? [],
};

const json = JSON.stringify(db, null, 2) + "\n";
writeFileSync(dbPath, json);
console.log(
  `Wrote ${hotels.length} hotels and ${cities.length} cities to server/db.json (${(
    Buffer.byteLength(json) / 1024
  ).toFixed(0)} KB)`
);
