import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, parseCsvRecords } from "./csv.mjs";
import {
  amenityFlags,
  isEligible,
  normalizeListing,
  parseAmenities,
  parsePrice,
  parseRating,
  stripHtml,
} from "./normalize.mjs";

test("parseCsv handles quotes, escaped quotes and embedded newlines", () => {
  const rows = [...parseCsv('a,b,c\r\n1,"two, ""quoted""","line1\nline2"\n3,,\n')];
  assert.deepEqual(rows, [
    ["a", "b", "c"],
    ["1", 'two, "quoted"', "line1\nline2"],
    ["3", "", ""],
  ]);
});

test("parseCsvRecords keys rows by header and skips blank lines", () => {
  const records = [...parseCsvRecords("id,name\n1,One\n\n2,Two")];
  assert.deepEqual(records, [
    { id: "1", name: "One" },
    { id: "2", name: "Two" },
  ]);
});

test("field parsers", () => {
  assert.equal(parsePrice("$1,200.00"), 1200);
  assert.equal(parsePrice(""), null);
  assert.equal(parseRating("4.86"), 4.86);
  assert.equal(parseRating("96"), 4.8);
  assert.equal(parseRating(""), null);
  assert.deepEqual(parseAmenities('["Wifi", "Kitchen", "Wifi"]'), ["Wifi", "Kitchen"]);
  assert.deepEqual(parseAmenities("not json"), []);
  assert.equal(stripHtml("Hello<br />world <b>bold</b> &amp; more"), "Hello\nworld bold & more");
});

test("amenityFlags matches label prefixes case-insensitively", () => {
  const flags = amenityFlags(["Fast wifi – 300 Mbps", "Wifi – 50 Mbps", "Kitchen", "Free street parking"]);
  assert.equal(flags.hasWifi, true);
  assert.equal(flags.hasKitchen, true);
  assert.equal(flags.hasFreeParking, true);
  assert.equal(flags.hasWasher, false);
});

const row = {
  id: "42",
  name: " Canal loft ",
  picture_url: "https://example.com/a.jpg",
  listing_url: "https://www.airbnb.com/rooms/42",
  latitude: "52.37",
  longitude: "4.89",
  price: "$180.00",
  room_type: "Entire home/apt",
  property_type: "Entire loft",
  accommodates: "4",
  bedrooms: "2",
  beds: "",
  bathrooms_text: "1.5 baths",
  amenities: '["Wifi", "Dedicated workspace"]',
  number_of_reviews: "120",
  review_scores_rating: "4.91",
  availability_365: "200",
  minimum_nights: "2",
  host_name: "Anna & Jo",
  host_is_superhost: "t",
  host_about: "Private bio",
  description: "Line one<br />Line two",
  neighbourhood_cleansed: "Centrum-West",
};

const city = {
  id: "amsterdam",
  name: "Amsterdam",
  country: "Netherlands",
  countryCode: "NL",
  currency: "EUR",
  snapshotDate: "2026-09-16",
};

test("normalizeListing maps a row to the Hotel schema and drops host PII", () => {
  const hotel = normalizeListing(row, city);
  assert.equal(hotel.id, "42");
  assert.equal(hotel.name, "Canal loft");
  assert.equal(hotel.price, 180);
  assert.equal(hotel.currency, "EUR");
  assert.equal(hotel.rating, 4.91);
  assert.equal(hotel.beds, null);
  assert.equal(hotel.hostName, "Anna");
  assert.equal(hotel.isSuperhost, true);
  assert.equal(hotel.hasWorkspace, true);
  assert.equal(hotel.description, "Line one\nLine two");
  assert.equal("host_about" in hotel, false);
});

test("isEligible requires photo, coordinates, price, reviews and availability", () => {
  assert.equal(isEligible(row), true);
  assert.equal(isEligible({ ...row, price: "" }), false);
  assert.equal(isEligible({ ...row, picture_url: "" }), false);
  assert.equal(isEligible({ ...row, number_of_reviews: "2" }), false);
  assert.equal(isEligible({ ...row, availability_365: "0" }), false);
});
