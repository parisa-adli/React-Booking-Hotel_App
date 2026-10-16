import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { HiOutlineMap, HiOutlineViewList } from "react-icons/hi";
import Map from "../Map/Map";
import HotelCard from "../HotelCard/HotelCard";
import { useHotels } from "../context/HotelsProvider";
import useMediaQuery, { DESKTOP_QUERY } from "../../hooks/useMediaQuery";

function AppLayout() {
  const { hotels, activeHotelId, setActiveHotelId } = useHotels();
  const { search } = useLocation();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [showMap, setShowMap] = useState(false);
  const isMapVisible = isDesktop || showMap;

  function handleMarkerClick(id) {
    setActiveHotelId(id);
    if (isDesktop) {
      document
        .querySelector(`.sidebar [data-hotel-id="${CSS.escape(id)}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  return (
    <div className={`appLayout ${isMapVisible ? "has-map" : ""} ${showMap ? "is-map" : ""}`}>
      <div className="sidebar" hidden={!isDesktop && showMap}>
        <Outlet />
      </div>
      {isMapVisible && (
        <Map
          variant="hotels"
          label="Map of results"
          markerLocations={hotels}
          activeId={activeHotelId}
          onMarkerClick={handleMarkerClick}
          isVisible={isMapVisible}
          renderPopup={(hotel) => (
            <HotelCard
              hotel={hotel}
              variant="compact"
              to={`/hotels/${hotel.id}${search}`}
              headingLevel={2}
            />
          )}
        />
      )}
      {!isDesktop && (
        <button
          type="button"
          className="mapToggle"
          onClick={() => setShowMap((value) => !value)}
          aria-pressed={showMap}
        >
          {showMap ? (
            <>
              <HiOutlineViewList aria-hidden="true" /> Show list
            </>
          ) : (
            <>
              <HiOutlineMap aria-hidden="true" /> Show map
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default AppLayout;
