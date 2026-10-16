import { useNavigate, useParams } from "react-router-dom";
import { useBookmark } from "../context/BookmarkListContext";
import { useEffect } from "react";
import { HiTrash } from "react-icons/hi";
import Loader from "../Loader";
import ReactCountryFlag from "react-country-flag";
import HotelCard from "../HotelCard/HotelCard";
import useFetch from "../../hooks/useFetch";

function SingleBookmark() {
  const { id } = useParams();
  const { getBookmark, isLoading, currentBookmark, deleteBookmark } = useBookmark();
  const navigate = useNavigate();
  useEffect(() => {
    getBookmark(id);
  }, [id, getBookmark]);

  const hotelId = String(currentBookmark?.id) === id ? currentBookmark.hotelId : null;
  const { data: hotel } = useFetch(hotelId ? `/hotels/${hotelId}` : null, "", {
    initialData: null,
  });

  const handleDelete = async () => {
    if (await deleteBookmark(currentBookmark.id)) navigate("/bookmark");
  };

  if (isLoading || !currentBookmark) return <Loader />;

  const name = currentBookmark.hotelName ?? currentBookmark.cityName;

  return (
    <div>
      <button type="button" onClick={() => navigate(-1)} className="btn btn--back" aria-label="Back">
        &larr;
      </button>
      <h1 className="pageTitle">{name}</h1>
      <div className="bookmarkList">
        {hotel ? (
          <HotelCard
            hotel={hotel}
            variant="compact"
            to={`/hotels/${hotel.id}`}
            headingLevel={2}
            action={
              <button
                type="button"
                className="iconBtn"
                aria-label={`Delete ${name}`}
                onClick={handleDelete}
              >
                <HiTrash className="trash" aria-hidden="true" />
              </button>
            }
          />
        ) : (
          <div className="bookmarkItem">
            <div>
              <ReactCountryFlag svg countryCode={currentBookmark.countryCode} />
              &nbsp; <strong>{currentBookmark.cityName}</strong> &nbsp;
              <span>{currentBookmark.country}</span>
            </div>
          </div>
        )}
      </div>
     
    </div>
  );
}

export default SingleBookmark;
