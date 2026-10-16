import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import HotelCard from "../HotelCard/HotelCard";
import FilterBar from "../FilterBar/FilterBar";
import Pagination from "../Pagination/Pagination";
import { CardGridSkeleton, ErrorState, StateMessage } from "../States/States";
import { useHotels } from "../context/HotelsProvider";
import { useCities } from "../context/CitiesProvider";
import {
  PAGE_SIZE,
  clearFilters,
  countActiveFilters,
  formatDateRange,
  guestsLabel,
  pluralize,
} from "../../services/hotels";

function Hotels() {
  const {
    search,
    updateSearch,
    hotels,
    total,
    isLoading,
    error,
    refetch,
    activeHotelId,
    setActiveHotelId,
  } = useHotels();
  const { getCity } = useCities();
  const { search: queryString } = useLocation();
  const topRef = useRef();
  const city = getCity(search.city);
  const pages = Math.ceil(total / PAGE_SIZE);
  const dates = formatDateRange(search.checkIn, search.checkOut);

  useEffect(() => {
    if (!isLoading && !error && pages > 0 && search.page > pages) {
      updateSearch({ page: pages });
    }
  }, [isLoading, error, pages, search.page, updateSearch]);

  function changePage(page) {
    updateSearch({ page });
    topRef.current?.scrollIntoView({ block: "start" });
  }

  let content;
  if (error) {
    content = <ErrorState onRetry={refetch} />;
  } else if (isLoading) {
    content = <CardGridSkeleton count={6} />;
  } else if (!hotels.length) {
    const hasFilters = countActiveFilters(search) > 0;
    content = (
      <StateMessage
        title={hasFilters ? "No stays match your filters" : "No stays in that destination yet"}
        actions={
          <>
            {hasFilters && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => updateSearch(clearFilters(search))}
              >
                Clear filters
              </button>
            )}
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => updateSearch({ city: null })}
            >
              Show all destinations
            </button>
          </>
        }
      >
        {hasFilters
          ? "Try removing a filter or choosing another destination."
          : "This demo includes Amsterdam, Barcelona, Lisbon and London."}
      </StateMessage>
    );
  } else {
    content = (
      <>
        <div className="cardGrid cardGrid--results">
          {hotels.map((hotel, index) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              to={`/hotels/${hotel.id}${queryString}`}
              eager={index < 2}
              isActive={hotel.id === activeHotelId}
              onActivate={setActiveHotelId}
              headingLevel={2}
            />
          ))}
        </div>
        <Pagination page={search.page} pages={pages} onChange={changePage} />
      </>
    );
  }

  return (
    <section className="results" aria-labelledby="results-title">
      <div className="resultsHeader" ref={topRef}>
        <h1 id="results-title" className="resultsTitle">
          {city ? `Stays in ${city.name}` : "Stays in all destinations"}
        </h1>
        <p className="resultsSummary" aria-live="polite">
          {isLoading ? "Searching…" : error ? "" : pluralize(total, "stay")}
          {dates ? ` · ${dates}` : ""} · {guestsLabel(search.adults, search.children)}
        </p>
      </div>
      <FilterBar currency={city?.currency} />
      {content}
    </section>
  );
}

export default Hotels;
