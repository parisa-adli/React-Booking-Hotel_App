import { createContext, useContext, useEffect, useReducer } from "react";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
};

function AuthReducer(state, action) {
  switch (action.type) {
    case "login":
      return {
        user: action.payload,
        isAuthenticated: true,
      };
    case "logout":
      return {
        user: null,
        isAuthenticated: false,
      };

    default:
      throw new Error("Unknown action!");
  }
}

const FAKE_USER = {
  name: "ali",
  email: "user@test.com",
  password: "1234",
};

// The session lives in localStorage so a reload or deep link stays logged in.
// Only the public profile is stored, never the password.
const SESSION_KEY = "stays:session";

function readSession() {
  try {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY));
    return user?.email ? user : null;
  } catch {
    return null;
  }
}

function loadSession() {
  const user = readSession();
  return user ? { user, isAuthenticated: true } : initialState;
}

export default function AuthContextProvider({ children }) {
  const [{ user, isAuthenticated }, dispatch] = useReducer(
    AuthReducer,
    initialState,
    loadSession
  );

  // Keep other tabs in step when one logs in or out.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== SESSION_KEY) return;
      const sessionUser = readSession();
      if (sessionUser) dispatch({ type: "login", payload: sessionUser });
      else dispatch({ type: "logout" });
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function login(email, password) {
    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      const sessionUser = { name: FAKE_USER.name, email: FAKE_USER.email };
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      } catch {
        // Storage unavailable: the session just won't survive a reload.
      }
      dispatch({ type: "login", payload: sessionUser });
      return true;
    }
    return false;
  }

  function logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Nothing stored to clear.
    }
    dispatch({ type: "logout" });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Provider and hook share a file by convention.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
