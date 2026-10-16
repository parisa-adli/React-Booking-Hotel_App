import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiBadgeCheck,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiStar,
} from "react-icons/hi";
import useFetch from "../../hooks/useFetch";
import { useHotels } from "../context/HotelsProvider";
import { FavoriteButton, HotelImage, Rating } from "../HotelCard/HotelCard";
import PriceCard from "../PriceCard/PriceCard";
import Map from "../Map/Map";
import Modal from "../Modal/Modal";
import { DetailSkeleton, ErrorState, StateMessage } from "../States/States";
import { pluralize } from "../../services/hotels";

const TOP_AMENITIES = 10;

function Highlights({ hotel }) {
  const items = [];
  if (hotel.isSuperhost)
    items.push({
      icon: HiBadgeCheck,
      title: `${hotel.hostName || "The host"} is a Superhost`,
      text: "Experienced, highly rated host.",
    });
  if (hotel.rating >= 4.9)
    items.push({
      icon: HiStar,
      title: "Guest favourite",
      text: `Rated ${hotel.rating} from ${pluralize(hotel.reviewCount, "review")}.`,
    });
  if (hotel.minimumNights)
    items.push({
      icon: HiOutlineCalendar,
      title: `Minimum stay: ${pluralize(hotel.minimumNights, "night")}`,
      text: "Set by the host.",
    });
  if (!items.length) return null;

  return (
    <ul className="highlights">
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="highlight">
          <Icon className="highlightIcon" aria-hidden="true" />
          <div>
            <p className="highlightTitle">{title}</p>
            <p className="highlightText">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AmenityList({ amenities }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!amenities.length) return <p className="mutedText">No amenities listed.</p>;
  const sorted = [...amenities].sort((a, b) => a.localeCompare(b));

  return (
    <>
      <ul className="amenityList">
        {amenities.slice(0, TOP_AMENITIES).map((amenity) => (
          <li key={amenity}>
            <HiOutlineCheckCircle aria-hidden="true" /> {amenity}
          </li>
        ))}
      </ul>
      {amenities.length > TOP_AMENITIES && (
        <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(true)}>
          Show all {amenities.length} amenities
        </button>
      )}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="What this place offers">
        <ul className="amenityList amenityList--all">
          {sorted.map((amenity) => (
            <li key={amenity}>
              <HiOutlineCheckCircle aria-hidden="true" /> {amenity}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

function Description({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > 360;
  return (
    <section className="detailSection" aria-labelledby="about-title">
      <h2 id="about-title" className="sectionTitle">
        About this place
      </h2>
      <p className={`description ${isLong && !isExpanded ? "is-clamped" : ""}`}>{text}</p>
      {isLong && (
        <button
          type="button"
          className="btn btn--ghost btn--inline"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}
    </section>
  );
}

function SingleHotel() {
  const { id } = useParams();
  const { search: queryString } = useLocation();
  const { search } = useHotels();
  const { data: hotel, isLoading, error, status, refetch } = useFetch(
    `/hotels/${encodeURIComponent(id)}`,
    "",
    { initialData: null }
  );
  const backTo = `/hotels${queryString}`;

  if (isLoading) return <DetailSkeleton />;

  if (status === 404) {
    return (
      <div className="page">
        <StateMessage
          title="This stay isn't available"
          headingLevel={1}
          actions={
            <Link to={backTo} className="btn btn--primary">
              Back to results
            </Link>
          }
        >
          It may have been removed from the dataset.
        </StateMessage>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="page">
        <ErrorState title="We couldn't load this stay" onRetry={refetch} />
      </div>
    );
  }

  const facts = [
    pluralize(hotel.accommodates ?? 1, "guest"),
    hotel.bedrooms ? pluralize(hotel.bedrooms, "bedroom") : null,
    hotel.beds ? pluralize(hotel.beds, "bed") : null,
    hotel.bathroomsText,
  ].filter(Boolean);

  return (
    <article className="detail">
      <div className="detailTopBar">
        <Link to={backTo} className="btn btn--secondary btn--small">
          <HiArrowLeft aria-hidden="true" /> Back to results
        </Link>
      </div>

      <div className="detailHero">
        <HotelImage
          src={hotel.imageUrl}
          alt={hotel.name}
          eager
          className="detailHeroImage"
          sizes="(min-width: 1120px) 1120px, 100vw"
        />
        <Link to={backTo} className="iconBtn iconBtn--floating detailBack" aria-label="Back to results">
          <HiArrowLeft aria-hidden="true" />
        </Link>
        <FavoriteButton hotel={hotel} className="detailFavorite" />
      </div>

      <div className="detailBody">
        <div className="detailMain">
          <header className="detailHeader">
            <p className="eyebrow">
              {hotel.propertyType} · {hotel.roomType}
            </p>
            <h1 className="detailTitle">{hotel.name}</h1>
            <p className="detailMeta">
              <Rating rating={hotel.rating} reviewCount={hotel.reviewCount} showCount />
              <span aria-hidden="true"> · </span>
              <span>
                {hotel.neighbourhood ? `${hotel.neighbourhood}, ` : ""}
                {hotel.city}, {hotel.country}
              </span>
            </p>
            <ul className="keyFacts" aria-label="Key facts">
              {facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </header>

          <Highlights hotel={hotel} />
          <Description text={hotel.description} />

          <section className="detailSection" aria-labelledby="amenities-title">
            <h2 id="amenities-title" className="sectionTitle">
              What this place offers
            </h2>
            <AmenityList amenities={hotel.amenities} />
          </section>

          {hotel.hostName && (
            <section className="detailSection host" aria-labelledby="host-title">
              <span className="userAvatar userAvatar--lg" aria-hidden="true">
                {hotel.hostName.charAt(0)}
              </span>
              <div>
                <h2 id="host-title" className="sectionTitle sectionTitle--sm">
                  Hosted by {hotel.hostName}
                </h2>
                <p className="mutedText">{hotel.isSuperhost ? "Superhost" : "Host"}</p>
              </div>
            </section>
          )}

          <section className="detailSection" aria-labelledby="location-title">
            <h2 id="location-title" className="sectionTitle">
              Where you&apos;ll be
            </h2>
            <p className="mutedText">
              {hotel.neighbourhood ? `${hotel.neighbourhood}, ` : ""}
              {hotel.city}. The pin shows the approximate location.
            </p>
            <Map
              key={hotel.id}
              variant="single"
              label={`Map showing ${hotel.name}`}
              markerLocations={[hotel]}
            />
          </section>
        </div>

        <PriceCard hotel={hotel} search={search} />
      </div>
    </article>
  );
}

export default SingleHotel;
