import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import toast from "react-hot-toast";

const FavoritesContext = createContext();
const STORAGE_KEY = "stays.favorites.v1";

function readStorage() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return { ids: Array.isArray(value) ? value.map(String) : [], isPersisted: true };
  } catch {
    return { ids: [], isPersisted: false };
  }
}

function writeStorage(ids) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}

function favoritesReducer(state, action) {
  switch (action.type) {
    case "favorite/added":
      if (state.ids.includes(action.payload)) return state;
      return { ...state, ids: [action.payload, ...state.ids] };
    case "favorite/removed":
      return { ...state, ids: state.ids.filter((id) => id !== action.payload) };
    case "storage/failed":
      return { ...state, isPersisted: false };
    default:
      throw new Error("Unknown action");
  }
}

function FavoritesProvider({ children }) {
  const [{ ids, isPersisted }, dispatch] = useReducer(
    favoritesReducer,
    undefined,
    readStorage
  );
  const warned = useRef(false);

  useEffect(() => {
    if (writeStorage(ids)) return;
    dispatch({ type: "storage/failed" });
    if (!warned.current) {
      warned.current = true;
      toast("Favorites won't be saved on this device.", { id: "favorites-storage" });
    }
  }, [ids]);

  function isFavorite(id) {
    return ids.includes(String(id));
  }

  function toggleFavorite(id, name) {
    const key = String(id);
    if (ids.includes(key)) {
      dispatch({ type: "favorite/removed", payload: key });
      toast(`Removed ${name ? `“${name}”` : "stay"} from Saved`, { id: `fav-${key}` });
    } else {
      dispatch({ type: "favorite/added", payload: key });
      toast.success(`Saved ${name ? `“${name}”` : "stay"}`, { id: `fav-${key}` });
    }
  }

  function removeFavorite(id) {
    dispatch({ type: "favorite/removed", payload: String(id) });
  }

  return (
    <FavoritesContext.Provider
      value={{ ids, isPersisted, isFavorite, toggleFavorite, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesProvider;

// Provider and hook share a file by convention.
// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  return useContext(FavoritesContext);
}
