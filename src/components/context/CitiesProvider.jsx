import { createContext, useCallback, useContext } from "react";
import useFetch from "../../hooks/useFetch";

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const { data: cities, isLoading, error, refetch } = useFetch(
    "/cities",
    "_sort=name"
  );

  const getCity = useCallback(
    (id) => cities.find((city) => city.id === id) ?? null,
    [cities]
  );

  return (
    <CitiesContext.Provider
      value={{ cities, isLoading, error, refetch, getCity }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

export default CitiesProvider;

// Provider and hook share a file by convention.
// eslint-disable-next-line react-refresh/only-export-components
export function useCities() {
  return useContext(CitiesContext);
}
