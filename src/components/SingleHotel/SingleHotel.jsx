import { useParams } from "react-router-dom";
import Loader from "../Loader";
import { useHotels } from "../context/HotelsProvider";
import { useEffect } from "react";

function SingleHotel() {
  const { id } = useParams();
  const { getHotel, isLoadingCurrent, currentHotel: data } = useHotels();

  useEffect(() => {
    getHotel(id);
  }, [id]);

  if (isLoadingCurrent || !data) return <Loader />;

  return (
    <div className="room">
      <div className="roomDetail">
        <h2>{data.name}</h2>
        <div>{data.number_of_reviews} reviews &bull;</div>
        <img src={data.xl_picture_url} alt={data.name} />
      </div>
    </div>
  );
}

export default SingleHotel;
