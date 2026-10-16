import { Outlet } from "react-router-dom";
import Map from "../Map/Map";
import { useBookmark } from "../context/BookmarkListContext";

function BookmarkLayout() {
  const { bookmarks } = useBookmark();
  return (
    <div className="appLayout appLayout--bookmarks has-map">
      <div className="sidebar">
        <Outlet />
      </div>
      <Map variant="bookmarks" label="Map of bookmarked places. Click the map to bookmark a place." markerLocations={bookmarks} />
    </div>
  );
}

export default BookmarkLayout;
