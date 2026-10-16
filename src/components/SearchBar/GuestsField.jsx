import { useCallback, useId, useRef, useState } from "react";
import { HiMinus, HiPlus, HiUsers } from "react-icons/hi";
import useDismiss from "../../hooks/useDismiss";
import { MAX_GUESTS, guestsLabel } from "../../services/hotels";

const GUEST_TYPES = [
  { key: "adults", label: "Adults", hint: "Ages 13 or above", min: 1 },
  { key: "children", label: "Children", hint: "Ages 2–12", min: 0 },
];

function Stepper({ type, value, total, onChange }) {
  const labelId = useId();
  return (
    <div className="stepperRow">
      <div id={labelId}>
        <p className="stepperLabel">{type.label}</p>
        <p className="stepperHint">{type.hint}</p>
      </div>
      <div className="stepper" role="group" aria-labelledby={labelId}>
        <button
          type="button"
          className="stepperBtn"
          onClick={() => onChange(value - 1)}
          disabled={value <= type.min}
          aria-label={`Decrease ${type.label.toLowerCase()}`}
        >
          <HiMinus aria-hidden="true" />
        </button>
        <span className="stepperValue" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className="stepperBtn"
          onClick={() => onChange(value + 1)}
          disabled={total >= MAX_GUESTS}
          aria-label={`Increase ${type.label.toLowerCase()}`}
        >
          <HiPlus aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function GuestsField({ guests, onChange, inline = false }) {
  const id = useId();
  const triggerId = `${id}-trigger`;
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef();
  const close = useCallback(() => setIsOpen(false), []);
  useDismiss(panelRef, triggerId, isOpen, close);

  const { adults, children } = guests;
  const values = guests;
  const total = adults + children;
  const steppers = GUEST_TYPES.map((type) => (
    <Stepper
      key={type.key}
      type={type}
      value={values[type.key]}
      total={total}
      onChange={(value) => onChange({ ...values, [type.key]: value })}
    />
  ));

  if (inline) {
    return (
      <fieldset className="searchField searchField--stacked">
        <legend className="searchLabel">Who</legend>
        {steppers}
      </fieldset>
    );
  }

  return (
    <div className="searchField">
      <span className="searchLabel" id={`${id}-label`}>
        Who
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
        <HiUsers className="searchIcon" aria-hidden="true" />
        <span>{guestsLabel(adults, children)}</span>
      </button>
      {isOpen && (
        <div
          ref={panelRef}
          className="popover guestsPopover"
          role="dialog"
          aria-label="Choose guests"
        >
          {steppers}
        </div>
      )}
    </div>
  );
}

export default GuestsField;
