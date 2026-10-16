import { useEffect, useId, useState } from "react";
import Modal from "../Modal/Modal";
import AMENITY_ICONS from "./amenityIcons";
import useFetch from "../../hooks/useFetch";
import {
  AMENITIES,
  RATING_OPTIONS,
  ROOM_TYPES,
  buildHotelQuery,
  clearFilters,
  pluralize,
} from "../../services/hotels";

function pickFilters(search) {
  const { minPrice, maxPrice, types, rating, amenities } = search;
  return { minPrice, maxPrice, types, rating, amenities };
}

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function FilterSheet({ isOpen, onClose, search, currency, onApply }) {
  const id = useId();
  const [draft, setDraft] = useState(() => pickFilters(search));

  useEffect(() => {
    if (isOpen) setDraft(pickFilters(search));
  }, [isOpen, search]);

  const preview = { ...search, ...draft, page: 1 };
  const { total, isLoading } = useFetch(
    isOpen ? "/hotels" : null,
    buildHotelQuery(preview, { pageSize: 1 })
  );

  function setPrice(key, value) {
    const number = value === "" ? null : Math.max(0, Number(value));
    setDraft((d) => ({ ...d, [key]: Number.isFinite(number) ? number : null }));
  }

  const footer = (
    <>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => setDraft(pickFilters(clearFilters(search)))}
      >
        Clear all
      </button>
      <button type="button" className="btn btn--primary" onClick={() => onApply(draft)}>
        {isLoading || total === null ? "Show stays" : `Show ${pluralize(total, "stay")}`}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters" footer={footer}>
      <section className="filterSection" aria-labelledby={`${id}-price`}>
        <h3 id={`${id}-price`} className="filterTitle">
          Price per night
        </h3>
        <p className="filterHint">
          {currency ? `In ${currency}. ` : "In each city's local currency. "}
          Snapshot prices, not live rates.
        </p>
        <div className="priceInputs">
          <div className="formControl">
            <label htmlFor={`${id}-min`}>Minimum</label>
            <input
              id={`${id}-min`}
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="No min"
              value={draft.minPrice ?? ""}
              onChange={(event) => setPrice("minPrice", event.target.value)}
            />
          </div>
          <span className="priceDash" aria-hidden="true">
            –
          </span>
          <div className="formControl">
            <label htmlFor={`${id}-max`}>Maximum</label>
            <input
              id={`${id}-max`}
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="No max"
              value={draft.maxPrice ?? ""}
              onChange={(event) => setPrice("maxPrice", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="filterSection" aria-labelledby={`${id}-type`}>
        <h3 id={`${id}-type`} className="filterTitle">
          Type of place
        </h3>
        <div className="chipGroup">
          {ROOM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="chip"
              aria-pressed={draft.types.includes(type)}
              onClick={() => setDraft((d) => ({ ...d, types: toggle(d.types, type) }))}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <fieldset className="filterSection">
        <legend className="filterTitle">Guest rating</legend>
        <div className="segmented">
          {RATING_OPTIONS.map((option) => (
            <label key={option.label} className="segment">
              <input
                type="radio"
                name={`${id}-rating`}
                checked={draft.rating === option.value}
                onChange={() => setDraft((d) => ({ ...d, rating: option.value }))}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="filterSection">
        <legend className="filterTitle">Amenities</legend>
        <div className="checkGrid">
          {AMENITIES.map((amenity) => {
            const Icon = AMENITY_ICONS[amenity.id];
            return (
              <label key={amenity.id} className="checkItem">
                <input
                  type="checkbox"
                  checked={draft.amenities.includes(amenity.id)}
                  onChange={() =>
                    setDraft((d) => ({ ...d, amenities: toggle(d.amenities, amenity.id) }))
                  }
                />
                <Icon aria-hidden="true" className="checkIcon" />
                <span>{amenity.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </Modal>
  );
}

export default FilterSheet;
