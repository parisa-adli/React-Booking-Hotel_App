import { useEffect, useId, useMemo, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { MdLocationOn } from "react-icons/md";
import { pluralize } from "../../services/hotels";

// ARIA 1.2 combobox with list autocomplete. Only cities from the dataset
// can be chosen; an empty value means "anywhere".
function DestinationField({ cities, value, onChange, error, onErrorChange }) {
  const id = useId();
  const listId = `${id}-list`;
  const selected = cities.find((city) => city.id === value);
  const [text, setText] = useState(selected?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setText(selected?.name ?? "");
  }, [selected?.name]);

  const options = useMemo(() => {
    const query = text.trim().toLowerCase();
    if (!query || query === selected?.name.toLowerCase()) return cities;
    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query)
    );
  }, [cities, text, selected?.name]);

  function choose(city) {
    onChange(city?.id ?? null);
    setText(city?.name ?? "");
    onErrorChange(null);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function commitText() {
    const query = text.trim().toLowerCase();
    if (!query) return choose(null);
    const match = cities.find((city) => city.name.toLowerCase() === query);
    if (match) return choose(match);
    if (options.length === 1) return choose(options[0]);
    onChange(null);
    onErrorChange("Choose a destination from the list");
  }

  function handleKeyDown(event) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        if (isOpen && activeIndex >= 0 && options[activeIndex]) {
          event.preventDefault();
          choose(options[activeIndex]);
        } else {
          commitText();
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  }

  const activeId = activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined;

  return (
    <div className={`searchField searchField--destination ${isOpen ? "is-open" : ""}`}>
      <label htmlFor={id} className="searchLabel">
        Where
      </label>
      <div className="searchControl">
        <MdLocationOn className="searchIcon searchIcon--rose" aria-hidden="true" />
        <input
          id={id}
          className="searchInput"
          type="text"
          role="combobox"
          aria-expanded={isOpen && options.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
          placeholder="Search destinations"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
            onErrorChange(null);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setIsOpen(false);
            commitText();
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="fieldError" role="alert">
          {error}
        </p>
      )}
      <ul
        id={listId}
        role="listbox"
        aria-label="Destinations"
        className="popover destinationList"
        hidden={!isOpen}
      >
        {options.length === 0 && (
          <li className="destinationEmpty" role="presentation">
            No stays in that destination yet.
          </li>
        )}
        {options.map((city, index) => (
          <li
            key={city.id}
            id={`${id}-opt-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            className={`destinationOption ${index === activeIndex ? "is-active" : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => choose(city)}
          >
            <ReactCountryFlag svg countryCode={city.countryCode} aria-hidden="true" />
            <span className="destinationName">
              {city.name}
              <span className="destinationCountry">{city.country}</span>
            </span>
            <span className="destinationCount">
              {pluralize(city.listingCount, "stay")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DestinationField;
