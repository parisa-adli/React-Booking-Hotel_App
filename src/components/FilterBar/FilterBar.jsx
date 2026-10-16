import { useId, useState } from "react";
import { HiAdjustments } from "react-icons/hi";
import { useHotels } from "../context/HotelsProvider";
import FilterSheet from "../FilterSheet/FilterSheet";
import { SORT_OPTIONS, countActiveFilters } from "../../services/hotels";

const QUICK_TYPES = [
  { type: "Entire home/apt", label: "Entire home" },
  { type: "Private room", label: "Private room" },
];

function FilterBar({ currency }) {
  const id = useId();
  const { search, updateSearch } = useHotels();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const activeCount = countActiveFilters(search);

  function toggleType(type) {
    const types = search.types.includes(type)
      ? search.types.filter((item) => item !== type)
      : [...search.types, type];
    updateSearch({ types });
  }

  return (
    <div className="filterBar">
      <div className="filterChips">
        <button
          type="button"
          className={`chip chip--filters ${activeCount ? "is-active" : ""}`}
          onClick={() => setIsSheetOpen(true)}
          aria-haspopup="dialog"
        >
          <HiAdjustments aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="countBadge" aria-label={`${activeCount} active`}>
              {activeCount}
            </span>
          )}
        </button>
        {QUICK_TYPES.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            className="chip"
            aria-pressed={search.types.includes(type)}
            onClick={() => toggleType(type)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="chip"
          aria-pressed={search.rating === 4.8}
          onClick={() => updateSearch({ rating: search.rating === 4.8 ? null : 4.8 })}
        >
          Rated 4.8+
        </button>
      </div>
      <div className="sortControl">
        <label htmlFor={`${id}-sort`} className="sortLabel">
          Sort by
        </label>
        <select
          id={`${id}-sort`}
          className="sortSelect"
          value={search.sort}
          onChange={(event) => updateSearch({ sort: event.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <FilterSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        search={search}
        currency={currency}
        onApply={(filters) => {
          setIsSheetOpen(false);
          updateSearch(filters);
        }}
      />
    </div>
  );
}

export default FilterBar;
