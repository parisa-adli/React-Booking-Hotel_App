import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildHotelQuery,
  countActiveFilters,
  formatPrice,
  imageSrc,
  imageSrcSet,
  nightsBetween,
  parseSearchParams,
  ratingLabel,
  toSearchParams,
} from "./hotels.js";

test("parseSearchParams applies defaults", () => {
  const search = parseSearchParams("");
  assert.equal(search.city, null);
  assert.equal(search.adults, 1);
  assert.equal(search.children, 0);
  assert.equal(search.sort, "recommended");
  assert.equal(search.page, 1);
  assert.deepEqual(search.types, []);
});

test("parseSearchParams reads every supported param", () => {
  const search = parseSearchParams(
    "city=lisbon&checkIn=2026-11-12&checkOut=2026-11-15&adults=2&children=1" +
      "&minPrice=50&maxPrice=300&type=Private%20room&type=Hotel%20room" +
      "&rating=4.5&amenity=wifi&amenity=kitchen&sort=price_asc&page=3"
  );
  assert.deepEqual(search, {
    city: "lisbon",
    checkIn: "2026-11-12",
    checkOut: "2026-11-15",
    adults: 2,
    children: 1,
    minPrice: 50,
    maxPrice: 300,
    types: ["Private room", "Hotel room"],
    rating: 4.5,
    amenities: ["wifi", "kitchen"],
    sort: "price_asc",
    page: 3,
  });
});

test("parseSearchParams ignores invalid values", () => {
  const search = parseSearchParams(
    "adults=0&children=-2&type=Castle&rating=3.3&amenity=pool&sort=random&page=abc&checkIn=2026-11-15&checkOut=2026-11-12"
  );
  assert.equal(search.adults, 1);
  assert.equal(search.children, 0);
  assert.deepEqual(search.types, []);
  assert.equal(search.rating, null);
  assert.deepEqual(search.amenities, []);
  assert.equal(search.sort, "recommended");
  assert.equal(search.page, 1);
  assert.equal(search.checkOut, null);
});

test("parseSearchParams swaps an inverted price range", () => {
  const search = parseSearchParams("minPrice=300&maxPrice=100");
  assert.equal(search.minPrice, 100);
  assert.equal(search.maxPrice, 300);
});

test("parseSearchParams understands the legacy header params", () => {
  const params = new URLSearchParams({
    destination: "Amsterdam",
    date: JSON.stringify([
      { startDate: "2026-11-12T10:00:00", endDate: "2026-11-14T10:00:00", key: "selection" },
    ]),
    options: JSON.stringify({ Adult: 2, children: 1, room: 1 }),
  });
  const search = parseSearchParams(params);
  assert.equal(search.city, "amsterdam");
  assert.equal(search.checkIn, "2026-11-12");
  assert.equal(search.checkOut, "2026-11-14");
  assert.equal(search.adults, 2);
  assert.equal(search.children, 1);
});

test("toSearchParams round-trips and omits defaults", () => {
  const query = "city=london&adults=3&type=Private+room&amenity=wifi&sort=rating&page=2";
  assert.equal(toSearchParams(parseSearchParams(query)).toString(), query);
  assert.equal(toSearchParams(parseSearchParams("")).toString(), "");
});

test("buildHotelQuery maps search state to json-server 0.17 params", () => {
  const query = new URLSearchParams(
    buildHotelQuery(
      parseSearchParams(
        "city=amsterdam&adults=2&children=1&minPrice=50&maxPrice=200&type=Private%20room&type=Shared%20room&rating=4.8&amenity=kitchen&sort=price_desc&page=2"
      )
    )
  );
  assert.equal(query.get("cityId"), "amsterdam");
  assert.equal(query.get("accommodates_gte"), "3");
  assert.equal(query.get("price_gte"), "50");
  assert.equal(query.get("price_lte"), "200");
  assert.deepEqual(query.getAll("roomType"), ["Private room", "Shared room"]);
  assert.equal(query.get("rating_gte"), "4.8");
  assert.equal(query.get("hasKitchen"), "true");
  assert.equal(query.get("_sort"), "price");
  assert.equal(query.get("_order"), "desc");
  assert.equal(query.get("_page"), "2");
  assert.equal(query.get("_limit"), "12");
});

test("buildHotelQuery skips the capacity filter for one guest", () => {
  const query = new URLSearchParams(buildHotelQuery(parseSearchParams("")));
  assert.equal(query.has("accommodates_gte"), false);
  assert.equal(query.get("_sort"), "reviewCount");
});

test("countActiveFilters counts price once and each option separately", () => {
  const search = parseSearchParams("minPrice=10&maxPrice=90&type=Private%20room&rating=4&amenity=wifi&amenity=ac");
  assert.equal(countActiveFilters(search), 5);
});

test("formatters", () => {
  assert.equal(formatPrice(null, "EUR"), null);
  assert.match(formatPrice(142, "GBP", "en-GB"), /£142/);
  assert.equal(ratingLabel(null), "New");
  assert.equal(ratingLabel(4.86), "4.86");
  assert.equal(ratingLabel(4.9), "4.9");
  assert.equal(nightsBetween("2026-11-12", "2026-11-15"), 3);
  assert.equal(nightsBetween("2026-11-15", "2026-11-12"), 0);
  assert.equal(nightsBetween(null, "2026-11-12"), 0);
});

test("imageSrc resizes Airbnb CDN originals and leaves other URLs alone", () => {
  const original = "https://a0.muscache.com/pictures/miso/Hosting-1/original/a.jpeg";
  assert.equal(imageSrc(original, 480), "https://a0.muscache.com/im/pictures/miso/Hosting-1/original/a.jpeg?im_w=480");
  assert.match(imageSrcSet(original), /im_w=480 480w, .*im_w=1200 1200w$/);
  assert.equal(imageSrc("https://example.com/a.jpg", 480), "https://example.com/a.jpg");
  assert.equal(imageSrcSet("https://example.com/a.jpg"), undefined);
  assert.equal(imageSrc("", 480), "");
});
