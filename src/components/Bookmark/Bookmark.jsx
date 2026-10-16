import ReactCountryFlag from "react-country-flag";
import { useBookmark } from "../context/BookmarkListContext";
import Loader from "../Loader";
import { Link } from "react-router-dom";
import { HiTrash } from "react-icons/hi";
import { StateMessage } from "../States/States";

function Bookmark() {
  const { isLoading, bookmarks, currentBookmark, deleteBookmark } =
    useBookmark();

  const handleDelete = (e, id) => {
    e.preventDefault();
    deleteBookmark(id);
  };

  if (isLoading) return <Loader />;
  if (!bookmarks.length)
    return (
      <StateMessage title="No bookmarked places" headingLevel={1}>
        Click anywhere on the map to bookmark a place.
      </StateMessage>
    );
  
  return (
    <div>
      <h1 className="pageTitle">Bookmarked places</h1>
      <p className="mutedText">Click the map to bookmark a new place.</p>
      <div className="bookmarkList">
        {bookmarks.map((item) => {
          return (
            <Link
              key={item.id}
              to={`${item.id}?lat=${item.latitude}&lng=${item.longitude}`}
            >
              <div
                className={`bookmarkItem ${
                  item.id === currentBookmark?.id ? "current-bookmark" : ""
                } `}
              >
                <div>
                  <ReactCountryFlag svg countryCode={item.countryCode} /> &nbsp;{" "}
                  <strong>{item.cityName}</strong> &nbsp;{" "}
                  <span>{item.country}</span>
                </div>
                <button
                  type="button"
                  className="iconBtn"
                  aria-label={`Delete ${item.cityName}`}
                  onClick={(e) => handleDelete(e, item.id)}
                >
                  <HiTrash className="trash" aria-hidden="true" />
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Bookmark;


