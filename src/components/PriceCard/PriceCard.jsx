import { useId } from "react";
import { HiExternalLink } from "react-icons/hi";
import { format, parseISO } from "date-fns";
import {
  formatPrice,
  guestsLabel,
  nightsBetween,
  pluralize,
} from "../../services/hotels";
import { Price } from "../HotelCard/HotelCard";

function PriceCard({ hotel, search }) {
  const noteId = useId();
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const guests = search.adults + search.children;
  const tooManyGuests = hotel.accommodates !== null && guests > hotel.accommodates;
  const belowMinimum = nights > 0 && hotel.minimumNights && nights < hotel.minimumNights;
  const snapshot = format(parseISO(hotel.snapshotDate), "d MMM yyyy");

  return (
    <aside className="priceCard" aria-label="Price">
      <p className="priceCardPrice">
        <Price price={hotel.price} currency={hotel.currency} />
      </p>
      <dl className="priceCardFacts">
        <div>
          <dt>Dates</dt>
          <dd>
            {search.checkIn && search.checkOut
              ? `${format(parseISO(search.checkIn), "d MMM")} – ${format(parseISO(search.checkOut), "d MMM")}`
              : "Add dates in search"}
          </dd>
        </div>
        <div>
          <dt>Guests</dt>
          <dd>{guestsLabel(search.adults, search.children)}</dd>
        </div>
      </dl>
      {tooManyGuests && (
        <p className="priceCardWarning">This place fits up to {pluralize(hotel.accommodates, "guest")}.</p>
      )}
      {belowMinimum && (
        <p className="priceCardWarning">Minimum stay is {pluralize(hotel.minimumNights, "night")}.</p>
      )}
      {nights > 0 && hotel.price !== null && (
        <p className="priceCardTotal">
          <span>
            {formatPrice(hotel.price, hotel.currency)} × {pluralize(nights, "night")}
          </span>
          <span>
            <strong>{formatPrice(hotel.price * nights, hotel.currency)}</strong>
            <span className="priceUnit"> estimate</span>
          </span>
        </p>
      )}
      <button type="button" className="btn btn--primary btn--block" disabled aria-describedby={noteId}>
        Reserve — demo only
      </button>
      <p id={noteId} className="priceCardNote">
        Demo: this app doesn&apos;t take bookings. Prices are a snapshot from {snapshot} and may
        have changed.
      </p>
      {hotel.listingUrl && (
        <a
          className="externalLink"
          href={hotel.listingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View listing on Airbnb <HiExternalLink aria-hidden="true" />
          <span className="visuallyHidden"> (opens in a new tab)</span>
        </a>
      )}
    </aside>
  );
}

export default PriceCard;
