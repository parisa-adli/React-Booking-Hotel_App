import { useNavigate } from "react-router-dom";
import useUrlLocation from "../../hooks/useUrlLocation";

function AddNewBookmark() {
  const [lat, lng] = useUrlLocation();
  console.log(lat, lng);
  const navigate = useNavigate();
  return (
    <div>
      <h2 className="h2Titles">Bookmark New Location</h2>
      <form className="form">
        <div className="formControl">
          <label htmlFor="cityName">city name :</label>
          <input type="text" name="cityName" id="cityName" />
        </div>
        <div className="formControl">
          <label htmlFor="country">country :</label>
          <input type="text" name="country" id="country" />
        </div>
        <div className="buttons">
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
            className="btn btn--back"
          >
            &larr; Back
          </button>
          <button className="btn btn--primary">Add</button>
        </div>
      </form>
    </div>
  );
}

export default AddNewBookmark;
