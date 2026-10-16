import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvent,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdMyLocation } from "react-icons/md";
import useGeoLocation from "../../hooks/useGeoLocation";
import useUrlLocation from "../../hooks/useUrlLocation";
import { formatPrice } from "../../services/hotels";

// Vite rewrites asset URLs, which breaks Leaflet's icon path detection.
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

function priceIcon(item, isActive) {
  const label = formatPrice(item.price, item.currency) ?? "View";
  return L.divIcon({
    className: "pricePinWrap",
    html: `<span class="pricePin${isActive ? " is-active" : ""}">${escapeHtml(label)}</span>`,
    iconSize: null,
    iconAnchor: [0, 0],
  });
}

// variant: "hotels" (price pins, fit to results), "bookmarks" (default
// pins, click to add), "single" (one static pin for the detail page).
function Map({
  markerLocations,
  variant = "bookmarks",
  activeId = null,
  onMarkerClick,
  renderPopup,
  isVisible = true,
  label = "Map",
}) {
  const [mapCenter, setMapCenter] = useState([51, 20]);
  const [lat, lng] = useUrlLocation();
  const {
    isLoading: isLoadingPosition,
    position: geoLocationPosition,
    getPosition,
  } = useGeoLocation();

  useEffect(() => {
    if (variant === "bookmarks" && lat && lng) setMapCenter([Number(lat), Number(lng)]);
  }, [lat, lng, variant]);

  useEffect(() => {
    if (geoLocationPosition?.lat && geoLocationPosition?.lng)
      setMapCenter([geoLocationPosition.lat, geoLocationPosition.lng]);
  }, [geoLocationPosition]);

  const points = useMemo(
    () =>
      markerLocations
        .filter((item) => item.latitude !== null && item.longitude !== null)
        .map((item) => ({ item, position: [Number(item.latitude), Number(item.longitude)] })),
    [markerLocations]
  );

  const single = variant === "single";
  const initialCenter = single && points[0] ? points[0].position : mapCenter;

  return (
    <div className={`mapContainer mapContainer--${variant}`} role="region" aria-label={label}>
      <MapContainer
        className="map"
        center={initialCenter}
        zoom={single ? 14 : 13}
        scrollWheelZoom={!single}
      >
        {!single && (
          <button
            type="button"
            onClick={getPosition}
            className="getLocation"
            aria-label="Use your location"
          >
            <MdMyLocation aria-hidden="true" />
            <span>{isLoadingPosition ? "Locating…" : "Your location"}</span>
          </button>
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {variant === "bookmarks" && <DetectClick />}
        {variant === "bookmarks" && <ChangeCenter position={mapCenter} />}
        {variant === "hotels" && <FitBounds points={points} center={geoLocationPosition} />}
        <InvalidateSize isVisible={isVisible} />
        {points.map(({ item, position }) => (
          <Marker
            key={item.id}
            position={position}
            icon={variant === "hotels" ? priceIcon(item, item.id === activeId) : new L.Icon.Default()}
            zIndexOffset={item.id === activeId ? 1000 : 0}
            title={item.name ?? item.host_location}
            alt={item.name ?? item.host_location}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(item.id) } : undefined}
          >
            {!single && (
              <Popup>{renderPopup ? renderPopup(item) : item.host_location}</Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;

function ChangeCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [map, position]);
  return null;
}

function FitBounds({ points, center }) {
  const map = useMap();
  const key = points.map((point) => point.item.id).join(",");

  useEffect(() => {
    if (!points.length) return;
    map.fitBounds(L.latLngBounds(points.map((point) => point.position)), {
      padding: [48, 48],
      maxZoom: 15,
    });
    // refit only when the set of results changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);

  useEffect(() => {
    if (center?.lat && center?.lng) map.setView([center.lat, center.lng], 14);
  }, [map, center]);

  return null;
}

function InvalidateSize({ isVisible }) {
  const map = useMap();
  useEffect(() => {
    if (isVisible) map.invalidateSize();
  }, [map, isVisible]);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();
  useMapEvent({
    click: (e) => navigate(`/bookmark/add?lat=${e.latlng.lat}&lng=${e.latlng.lng}`),
  });
  return null;
}
