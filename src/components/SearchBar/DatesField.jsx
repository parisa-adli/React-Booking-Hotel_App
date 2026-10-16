import { useCallback, useId, useRef, useState } from "react";
import { HiCalendar } from "react-icons/hi";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { format, parseISO } from "date-fns";
import useDismiss from "../../hooks/useDismiss";
import { formatDateRange, nightsBetween, pluralize } from "../../services/hotels";

const ISO = "yyyy-MM-dd";

function DatePicker({ checkIn, checkOut, onChange, months }) {
  const today = new Date();
  const ranges = [
    {
      startDate: checkIn ? parseISO(checkIn) : today,
      endDate: checkOut ? parseISO(checkOut) : checkIn ? parseISO(checkIn) : today,
      key: "selection",
    },
  ];

  return (
    <DateRange
      ranges={ranges}
      onChange={({ selection }) => {
        const start = format(selection.startDate, ISO);
        const end = format(selection.endDate, ISO);
        onChange({ checkIn: start, checkOut: end > start ? end : null });
      }}
      minDate={today}
      months={months}
      direction="horizontal"
      showDateDisplay={false}
      moveRangeOnFirstSelection={false}
      rangeColors={["#13243f"]}
      // react-date-range needs a range; hide the placeholder until a date is picked
      className={`datePicker ${checkIn ? "" : "datePicker--empty"}`}
    />
  );
}

function DatesField({ checkIn, checkOut, onChange, inline = false, months = 1 }) {
  const id = useId();
  const triggerId = `${id}-trigger`;
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef();
  const close = useCallback(() => setIsOpen(false), []);
  useDismiss(panelRef, triggerId, isOpen, close);

  const nights = nightsBetween(checkIn, checkOut);
  const label = formatDateRange(checkIn, checkOut) ?? "Add dates";
  const hint = checkIn && !checkOut ? "Choose a check-out date" : null;

  const footer = (
    <div className="popoverFooter">
      <span className="popoverHint" aria-live="polite">
        {nights ? pluralize(nights, "night") : hint ?? "Prices are per night"}
      </span>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => onChange({ checkIn: null, checkOut: null })}
        disabled={!checkIn}
      >
        Clear
      </button>
      {!inline && (
        <button type="button" className="btn btn--primary" onClick={close}>
          Done
        </button>
      )}
    </div>
  );

  if (inline) {
    return (
      <fieldset className="searchField searchField--stacked">
        <legend className="searchLabel">When</legend>
        <DatePicker checkIn={checkIn} checkOut={checkOut} onChange={onChange} months={1} />
        {footer}
      </fieldset>
    );
  }

  return (
    <div className="searchField">
      <span className="searchLabel" id={`${id}-label`}>
        When
      </span>
      <button
        type="button"
        id={triggerId}
        className="searchControl searchTrigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label ${triggerId}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <HiCalendar className="searchIcon searchIcon--primary" aria-hidden="true" />
        <span className={checkIn ? "" : "searchPlaceholder"}>{label}</span>
      </button>
      {isOpen && (
        <div
          ref={panelRef}
          className="popover datesPopover"
          role="dialog"
          aria-label="Choose dates"
        >
          <DatePicker checkIn={checkIn} checkOut={checkOut} onChange={onChange} months={months} />
          {footer}
        </div>
      )}
    </div>
  );
}

export default DatesField;
