import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const BookmarkContext = createContext();

const initialState = {
  bookmarks: [],
  isLoading: false,
  currentBookmark: null,
  error: null,
};

function bookmarkReducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };
    case "bookmarks/loaded":
      return {
        ...state,
        isLoading: false,
        bookmarks: action.payload,
      };
    case "bookmark/loaded":
      return {
        ...state,
        isLoading: false,
        currentBookmark: action.payload,
      };
    case "bookmark/created":
      return {
        ...state,
        isLoading: false,
        bookmarks: [...state.bookmarks, action.payload],
        currentBookmark: action.payload,
      };
    case "bookmark/deleted":
      return {
        ...state,
        isLoading: false,
        bookmarks: state.bookmarks.filter((item) => item.id !== action.payload),
        currentBookmark: null,
      };
    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      throw new Error("Unknown action");
  }
}

function BookmarkListProvider({ children }) {
  const [{ bookmarks, isLoading, currentBookmark }, dispatch] = useReducer(
    bookmarkReducer,
    initialState
  );

  useEffect(() => {
    async function fetchBookmarkList() {
      dispatch({ type: "loading" });
      // setCurrentBookmark(null);
      try {
        const { data } = await api.get("/bookmarks");
        dispatch({ type: "bookmarks/loaded", payload: data });
      } catch (error) {
        toast.error(error.message);
        dispatch({
          type: "rejected",
          payload: "an Error occurred in loading bookmark",
        });
      }
    }
    fetchBookmarkList();
  }, []);

  const currentBookmarkId = currentBookmark?.id;
  const getBookmark = useCallback(async (id) => {
    if (String(id) === String(currentBookmarkId)) return;

    dispatch({ type: "loading" });
    try {
      const { data } = await api.get(`/bookmarks/${id}`);
      dispatch({ type: "bookmark/loaded", payload: data });
    } catch (error) {
      toast.error(error.message);
      dispatch({
        type: "rejected",
        payload: "an Error occurred in loading single bookmark",
      });
    }
  }, [currentBookmarkId]);

  async function createBookmark(newBookmark) {
    dispatch({ type: "loading" });
    try {
      const { data } = await api.post("/bookmarks", newBookmark);
      dispatch({ type: "bookmark/created", payload: data });
      return true;
    } catch (error) {
      toast.error(error.message);
      dispatch({
        type: "rejected",
        payload: error.message,
      });
      return false;
    }
  }

  async function deleteBookmark(id) {
    dispatch({ type: "loading" });

    try {
      await api.delete(`/bookmarks/${id}`);
      dispatch({ type: "bookmark/deleted", payload: id });
      return true;
    } catch (error) {
      toast.error(error.message);
      dispatch({
        type: "rejected",
        payload: error.message,
      });
      return false;
    }
  }

  // A hotel bookmark keeps the place fields the list and map use, plus the
  // hotel it came from.
  function getHotelBookmark(hotelId) {
    return bookmarks.find((item) => String(item.hotelId) === String(hotelId));
  }

  async function toggleHotelBookmark(hotel) {
    const existing = getHotelBookmark(hotel.id);
    if (existing) {
      if (!(await deleteBookmark(existing.id))) return;
      toast(`Removed “${hotel.name}” from Bookmarks`, { id: `bm-${hotel.id}` });
      return;
    }
    const created = await createBookmark({
      hotelId: hotel.id,
      hotelName: hotel.name,
      cityName: hotel.city,
      country: hotel.country,
      countryCode: hotel.countryCode,
      latitude: String(hotel.latitude),
      longitude: String(hotel.longitude),
      host_location: `${hotel.name}, ${hotel.city}`,
    });
    if (!created) return;
    toast.success(`Added “${hotel.name}” to Bookmarks`, { id: `bm-${hotel.id}` });
  }

  return (
    <BookmarkContext.Provider
      value={{
        isLoading,
        bookmarks,
        getBookmark,
        currentBookmark,
        createBookmark,
        deleteBookmark,
        getHotelBookmark,
        toggleHotelBookmark,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export default BookmarkListProvider;

// Provider and hook share a file by convention.
// eslint-disable-next-line react-refresh/only-export-components
export function useBookmark() {
  return useContext(BookmarkContext);
}

// context + reducer => value={{state,dispatch}} => SYNC ACTION => (no side effect)

// ASYNC ACTION => reducer function is a PURE function

// 1. pass dispatch
// 2. pass actions => for async in reduce use pass actions
