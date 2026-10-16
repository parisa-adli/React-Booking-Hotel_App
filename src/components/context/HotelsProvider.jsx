import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import {
  buildHotelQuery,
  parseSearchParams,
  toSearchParams,
} from "../../services/hotels";

const HotelContext = createContext();

function HotelsProvider({ children }) {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeHotelId, setActiveHotelId] = useState(null);

  const search = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const isResultsPage = pathname === "/hotels";

  const {
    isLoading,
    data: hotels,
    total,
    error,
    refetch,
  } = useFetch(isResultsPage ? "/hotels" : null, buildHotelQuery(search));

  // Merges a partial search into the URL. Any change other than the page
  // itself sends the user back to page 1.
  const updateSearch = useCallback(
    (changes, { pathname: target = "/hotels" } = {}) => {
      const next = { ...search, ...changes };
      if (!("page" in changes)) next.page = 1;
      navigate({ pathname: target, search: toSearchParams(next).toString() });
    },
    [navigate, search]
  );

  return (
    <HotelContext.Provider
      value={{
        search,
        updateSearch,
        hotels,
        total: total ?? hotels.length,
        isLoading,
        error,
        refetch,
        activeHotelId,
        setActiveHotelId,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export default HotelsProvider;

// Provider and hook share a file by convention.
// eslint-disable-next-line react-refresh/only-export-components
export function useHotels() {
  return useContext(HotelContext);
}
