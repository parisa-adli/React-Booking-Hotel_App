import { useNavigate, useParams } from "react-router-dom";
import { useBookmark } from "../context/BookmarkListContext";
import { useEffect } from "react";
import Loader from "../Loader";
import ReactCountryFlag from "react-country-flag";

function SingleBookmark() {
  const { id } = useParams();
  const { getBookmark, isLoadingCurrBookmark, currentBookmark } = useBookmark();
  const navigate = useNavigate();
  useEffect(() => {
    getBookmark(id);
  }, [id]);

  if (isLoadingCurrBookmark || !currentBookmark) return <Loader />;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn--back">
        &larr;
      </button>
      <h2 className="h2Titles">{currentBookmark.cityName}</h2>
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
