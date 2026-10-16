import { useState } from "react";
import { Link } from "react-router-dom";
import { HiHeart, HiOutlineHeart, HiStar } from "react-icons/hi";
import { MdHotel } from "react-icons/md";
import { useBookmark } from "../context/BookmarkListContext";
import {
  formatPrice,
  imageSrc,
  imageSrcSet,
  pluralize,
  ratingLabel,
} from "../../services/hotels";

// `sizes` describes the rendered width so the browser picks a small file.
export function HotelImage({
  src,
  alt,
  eager = false,
  className = "",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
}) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <div className={`imageFallback ${className}`} role="img" aria-label={alt}>
        <MdHotel aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={imageSrc(src, 720)}
      srcSet={imageSrcSet(src)}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function Rating({ rating, reviewCount, showCount = false }) {
  return (
    <span className="rating">
      <HiStar className="ratingStar" aria-hidden="true" />
      <span>
        <span className="visuallyHidden">Rated </span>
        {ratingLabel(rating)}
        {rating !== null && <span className="visuallyHidden"> out of 5</span>}
      </span>
      {showCount && reviewCount > 0 && (
        <span className="ratingCount">({pluralize(reviewCount, "review")})</span>
      )}
    </span>
  );
}

export function FavoriteButton({ hotel, className = "" }) {
  const { getHotelBookmark, toggleHotelBookmark } = useBookmark();
  const saved = Boolean(getHotelBookmark(hotel.id));
  return (
    <button
      type="button"
      className={`favoriteBtn ${saved ? "is-saved" : ""} ${className}`}
      aria-pressed={saved}
      aria-label={`Bookmark ${hotel.name}`}
      onClick={(event) => {
        event.preventDefault();
        toggleHotelBookmark(hotel);
      }}
    >
      {saved ? <HiHeart aria-hidden="true" /> : <HiOutlineHeart aria-hidden="true" />}
    </button>
  );
}

export function Price({ price, currency, unit = "night" }) {
  const formatted = formatPrice(price, currency);
  if (!formatted) return <span className="price price--missing">Price unavailable</span>;
  return (
    <span className="price">
      <strong>{formatted}</strong> <span className="priceUnit">{unit}</span>
    </span>
  );
}

function HotelCard({
  hotel,
  to,
  eager = false,
  isActive = false,
  variant = "grid",
  onActivate,
  headingLevel = 3,
  action,
}) {
  const Heading = `h${headingLevel}`;
  const badge = hotel.isSuperhost ? "Superhost" : hotel.rating >= 4.9 ? "Guest favourite" : null;

  return (
    <article
      className={`hotelCard hotelCard--${variant} ${isActive ? "is-active" : ""}`}
      onMouseEnter={() => onActivate?.(hotel.id)}
      onFocus={() => onActivate?.(hotel.id)}
      data-hotel-id={hotel.id}
    >
      <div className="hotelCardMedia">
        <HotelImage
          src={hotel.imageUrl}
          alt={hotel.name}
          eager={eager}
          className="hotelCardImage"
          sizes={variant === "compact" ? "88px" : undefined}
        />
        {badge && variant === "grid" && <span className="mediaBadge">{badge}</span>}
        {!action && <FavoriteButton hotel={hotel} className="hotelCardFavorite" />}
      </div>
      <div className="hotelCardBody">
        <div className="hotelCardTitleRow">
          <Heading className="hotelCardTitle">
            <Link to={to} className="stretchedLink">
              {hotel.name}
            </Link>
          </Heading>
          <Rating rating={hotel.rating} />
        </div>
        <p className="hotelCardMeta">
          {hotel.neighbourhood ? `${hotel.neighbourhood} · ` : ""}
          {hotel.city}
        </p>
        <p className="hotelCardMeta">
          {hotel.roomType} · {pluralize(hotel.accommodates ?? 1, "guest")}
          {hotel.beds ? ` · ${pluralize(hotel.beds, "bed")}` : ""}
        </p>
        <p className="hotelCardPrice">
          <Price price={hotel.price} currency={hotel.currency} />
        </p>
      </div>
      {action && <div className="hotelCardAction">{action}</div>}
    </article>
  );
}

export default HotelCard;
