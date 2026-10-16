import { Link } from "react-router-dom";
import { HiOutlineTrash } from "react-icons/hi";
import HotelCard from "../HotelCard/HotelCard";
import { CardGridSkeleton, ErrorState, StateMessage } from "../States/States";
import { useFavorites } from "../context/FavoritesProvider";
import useFetch from "../../hooks/useFetch";
import { pluralize } from "../../services/hotels";

function Saved() {
  const { ids, removeFavorite } = useFavorites();
  const query = new URLSearchParams(ids.map((id) => ["id", id])).toString();
  const { data, isLoading, error, refetch } = useFetch(ids.length ? "/hotels" : null, query);

  // Keep the order the user saved them in; ids missing from the data are
  // shown as unavailable.
  const byId = new Map(data.map((hotel) => [hotel.id, hotel]));
  const missing = isLoading ? [] : ids.filter((id) => !byId.has(id));

  let content;
  if (!ids.length) {
    content = (
      <StateMessage
        icon="heart"
        title="No saved stays yet"
        actions={
          <Link to="/" className="btn btn--primary">
            Explore stays
          </Link>
        }
      >
        Tap the heart on any stay to save it here.
      </StateMessage>
    );
  } else if (error) {
    content = <ErrorState title="We couldn't load your saved stays" onRetry={refetch} />;
  } else if (isLoading && !data.length) {
    content = <CardGridSkeleton count={Math.min(ids.length, 6)} label="Loading saved stays…" />;
  } else {
    content = (
      <div className="cardGrid">
        {ids
          .filter((id) => byId.has(id))
          .map((id) => (
            <HotelCard key={id} hotel={byId.get(id)} to={`/hotels/${id}`} headingLevel={2} />
          ))}
        {missing.map((id) => (
          <div key={id} className="unavailableCard">
            <p className="stateTitle">No longer available</p>
            <p className="mutedText">This stay is no longer in the dataset.</p>
            <button type="button" className="btn btn--secondary btn--small" onClick={() => removeFavorite(id)}>
              <HiOutlineTrash aria-hidden="true" /> Remove
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="page" aria-labelledby="saved-title">
      <div className="pageHeader">
        <h1 id="saved-title" className="pageTitle">
          Saved
        </h1>
        {ids.length > 0 && <p className="mutedText">{pluralize(ids.length, "stay")}</p>}
      </div>
      {content}
    </section>
  );
}

export default Saved;
