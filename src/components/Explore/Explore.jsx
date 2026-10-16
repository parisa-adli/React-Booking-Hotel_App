import { Link } from "react-router-dom";
import ReactCountryFlag from "react-country-flag";
import SearchBar from "../SearchBar/SearchBar";
import HotelCard, { HotelImage } from "../HotelCard/HotelCard";
import { CardGridSkeleton, ErrorState } from "../States/States";
import { useCities } from "../context/CitiesProvider";
import useFetch from "../../hooks/useFetch";
import { pluralize } from "../../services/hotels";

function CityCard({ city }) {
  return (
    <li className="cityCard">
      <HotelImage src={city.imageUrl} alt="" className="cityCardImage" />
      <div className="cityCardOverlay">
        <h3 className="cityCardTitle">
          <Link to={`/hotels?city=${city.id}`} className="stretchedLink">
            {city.name}
          </Link>
        </h3>
        <p className="cityCardMeta">
          <ReactCountryFlag svg countryCode={city.countryCode} aria-hidden="true" /> {city.country}{" "}
          · {pluralize(city.listingCount, "stay")}
        </p>
      </div>
    </li>
  );
}

function Explore() {
  const { cities, isLoading: isLoadingCities, error: citiesError, refetch } = useCities();
  const topRated = useFetch(
    "/hotels",
    "rating_gte=4.9&_sort=reviewCount&_order=desc&_limit=8"
  );
  const heroImage = cities[0]?.imageUrl;

  return (
    <div className="explore">
      <section className="hero" aria-labelledby="hero-title">
        {heroImage && (
          <HotelImage src={heroImage} alt="" eager className="heroImage" sizes="(min-width: 1280px) 1280px, 100vw" />
        )}
        <div className="heroContent">
          <p className="heroEyebrow">Amsterdam · Barcelona · Lisbon · London</p>
          <h1 id="hero-title" className="heroTitle">
            Find your next stay
          </h1>
          <p className="heroText">
            Browse well-reviewed homes and rooms, compare prices and save your favourites.
          </p>
        </div>
        <div className="heroSearch">
          <SearchBar variant="hero" />
        </div>
      </section>

      <section className="exploreSection" aria-labelledby="cities-title">
        <div className="sectionHeader">
          <h2 id="cities-title" className="sectionTitle">
            Explore cities
          </h2>
        </div>
        {citiesError ? (
          <ErrorState title="We couldn't load destinations" onRetry={refetch} />
        ) : isLoadingCities ? (
          <CardGridSkeleton count={4} label="Loading destinations…" className="cityRow" />
        ) : (
          <ul className="cityRow">
            {cities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </ul>
        )}
      </section>

      <section className="exploreSection" aria-labelledby="top-title">
        <div className="sectionHeader">
          <h2 id="top-title" className="sectionTitle">
            Guest favourites
          </h2>
          <Link to="/hotels?sort=rating" className="sectionLink">
            Show all
          </Link>
        </div>
        {topRated.error ? (
          <ErrorState onRetry={topRated.refetch} />
        ) : topRated.isLoading ? (
          <CardGridSkeleton count={4} className="cardRow" />
        ) : (
          <div className="cardRow">
            {topRated.data.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} to={`/hotels/${hotel.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Explore;
