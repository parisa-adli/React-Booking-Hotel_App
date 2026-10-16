import { useNavigate, useParams } from "react-router-dom";
import { useBookmark } from "../context/BookmarkListContext";
import { useEffect } from "react";
import Loader from "../Loader";
import ReactCountryFlag from "react-country-flag";

function SingleBookmark() {
  const { id } = useParams();
  const { getBookmark, isLoading, currentBookmark } = useBookmark();
  const navigate = useNavigate();
  useEffect(() => {
    getBookmark(id);
  }, [id, getBookmark]);

  if (isLoading || !currentBookmark) return <Loader />;

  return (
    <div>
      <button type="button" onClick={() => navigate(-1)} className="btn btn--back" aria-label="Back">
        &larr;
      </button>
      <h1 className="pageTitle">{currentBookmark.cityName}</h1>
      <div className="bookmarkItem">
        <div>
          <ReactCountryFlag svg countryCode={currentBookmark.countryCode} />
          &nbsp; <strong>{currentBookmark.cityName}</strong> &nbsp;
          <span>{currentBookmark.country}</span>
        </div>
      </div>
    </div>
  );
}

export default SingleBookmark;
