import { useEffect, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { useCities } from "../context/CitiesProvider";
import { useHotels } from "../context/HotelsProvider";
import useMediaQuery, { DESKTOP_QUERY } from "../../hooks/useMediaQuery";
import { formatDateRange, guestsLabel } from "../../services/hotels";
import Modal from "../Modal/Modal";
import DestinationField from "./DestinationField";
import DatesField from "./DatesField";
import GuestsField from "./GuestsField";

function pickDraft(search) {
  const { city, checkIn, checkOut, adults, children } = search;
  return { city, checkIn, checkOut, adults, children };
}

function SearchForm({ draft, setDraft, layout, onSubmit }) {
  const { cities } = useCities();
  const [destinationError, setDestinationError] = useState(null);
  const isStacked = layout === "stacked";
  const missingCheckOut = Boolean(draft.checkIn && !draft.checkOut);

  function handleSubmit(event) {
    event.preventDefault();
    if (destinationError || missingCheckOut) return;
    onSubmit();
  }

  return (
    <form
      className={`searchForm searchForm--${layout}`}
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search stays"
    >
      <DestinationField
        cities={cities}
        value={draft.city}
        onChange={(city) => setDraft((d) => ({ ...d, city }))}
        error={destinationError}
        onErrorChange={setDestinationError}
      />
      <DatesField
        checkIn={draft.checkIn}
        checkOut={draft.checkOut}
        onChange={(dates) => setDraft((d) => ({ ...d, ...dates }))}
        inline={isStacked}
        months={2}
      />
      <GuestsField
        guests={{ adults: draft.adults, children: draft.children }}
        onChange={(guests) => setDraft((d) => ({ ...d, ...guests }))}
        inline={isStacked}
      />
      <button
        type="submit"
        className={isStacked ? "btn btn--primary btn--block" : "searchSubmit"}
        disabled={Boolean(destinationError) || missingCheckOut}
        aria-label="Search"
      >
        <HiSearch aria-hidden="true" className="searchSubmitIcon" />
        {isStacked && <span>Search</span>}
      </button>
    </form>
  );
}

function SearchBar({ variant = "header" }) {
  const { search, updateSearch } = useHotels();
  const { getCity } = useCities();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [draft, setDraft] = useState(() => pickDraft(search));
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setDraft(pickDraft(search));
  }, [search]);

  function submit() {
    updateSearch(draft);
    setIsSheetOpen(false);
  }

  if (isDesktop) {
    return (
      <div className={`searchBar searchBar--${variant}`}>
        <SearchForm draft={draft} setDraft={setDraft} layout="inline" onSubmit={submit} />
      </div>
    );
  }

  const city = getCity(search.city);
  const dates = formatDateRange(search.checkIn, search.checkOut);

  return (
    <div className={`searchBar searchBar--${variant}`}>
      <button
        type="button"
        className="searchPill"
        onClick={() => setIsSheetOpen(true)}
        aria-haspopup="dialog"
      >
        <HiSearch className="searchPillIcon" aria-hidden="true" />
        <span className="searchPillText">
          <span className="searchPillTitle">{city?.name ?? "Where to?"}</span>
          <span className="searchPillMeta">
            {dates ?? "Any week"} · {guestsLabel(search.adults, search.children)}
          </span>
        </span>
      </button>
      <Modal
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setDraft(pickDraft(search));
        }}
        title="Search stays"
        variant="full"
      >
        <SearchForm draft={draft} setDraft={setDraft} layout="stacked" onSubmit={submit} />
      </Modal>
    </div>
  );
}

export default SearchBar;
