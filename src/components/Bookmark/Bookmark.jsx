import ReactCountryFlag from "react-country-flag";
import { useBookmark } from "../context/BookmarkListContext";
import Loader from "../Loader";
import { Link } from "react-router-dom";
import { HiTrash } from "react-icons/hi";
import { StateMessage } from "../States/States";
import HotelCard from "../HotelCard/HotelCard";
import useFetch from "../../hooks/useFetch";

function Bookmark() {
  const { isLoading, bookmarks, currentBookmark, deleteBookmark } =
    useBookmark();
  const hotelIds = bookmarks.filter((item) => item.hotelId).map((item) => item.hotelId);
  const query = new URLSearchParams(hotelIds.map((id) => ["id", id])).toString();
  const { data: hotels } = useFetch(hotelIds.length ? "/hotels" : null, query);
  const hotelsById = new Map(hotels.map((hotel) => [String(hotel.id), hotel]));

  const handleDelete = (e, id) => {
    e.preventDefault();
    deleteBookmark(id);
  };

  if (isLoading && !bookmarks.length) return <Loader />;
  if (!bookmarks.length)
    return (
      <StateMessage title="No bookmarked places" headingLevel={1}>
        Tap the heart on any stay, or click anywhere on the map, to add a bookmark.
      </StateMessage>
    );
  
  return (
    <div>
      <h1 className="pageTitle">Bookmarked places</h1>
      <p className="mutedText">Tap the heart on a stay or click the map to add a bookmark.</p>
      <div className="bookmarkList">
        {bookmarks.map((item) => {
          const hotel = item.hotelId && hotelsById.get(String(item.hotelId));
          const to = `${item.id}?lat=${item.latitude}&lng=${item.longitude}`;
          const deleteButton = (
            <button
              type="button"
              className="iconBtn"
              aria-label={`Delete ${item.hotelName ?? item.cityName}`}
              onClick={(e) => handleDelete(e, item.id)}
            >
              <HiTrash className="trash" aria-hidden="true" />
            </button>
          );
          if (hotel)
            return (
              <HotelCard
                key={item.id}
                hotel={hotel}
                variant="compact"
                to={to}
                headingLevel={2}
                isActive={item.id === currentBookmark?.id}
                action={deleteButton}
              />
            );
          return (
            <Link key={item.id} to={to}>
              <div
                className={`bookmarkItem ${
                  item.id === currentBookmark?.id ? "current-bookmark" : ""
                } `}
              >
                <div>
                  <ReactCountryFlag svg countryCode={item.countryCode} /> &nbsp;{" "}
                  <strong>{item.hotelName ?? item.cityName}</strong> &nbsp;{" "}
                  <span>{item.hotelName ? item.cityName : item.country}</span>
                </div>
                {deleteButton}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Bookmark;


