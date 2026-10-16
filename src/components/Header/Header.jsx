import { MdLogout } from "react-icons/md";
import {
  HiOutlineHeart,
  HiOutlineLocationMarker,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useBookmark } from "../context/BookmarkListContext";
import SearchBar from "../SearchBar/SearchBar";
import useTheme from "../../hooks/useTheme";
import logo from "../../assets/brand/stays-logo.svg";
import logoWhite from "../../assets/brand/stays-logo-white.svg";
import logoIcon from "../../assets/brand/stays-icon.svg";

function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const { bookmarks } = useBookmark();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className={`header ${isHome ? "header--home" : ""}`}>
      <Link to="/" className="brand" aria-label="Stays home">
        <img src={logoIcon} alt="" className="brandMark" />
        <img src={isDark ? logoWhite : logo} alt="" className="brandName" />
      </Link>
      {!isHome && <SearchBar />}
      <nav className="headerNav" aria-label="Account">
        <NavLink to="/hotels" className="headerLink">
          <HiOutlineLocationMarker aria-hidden="true" />
          Places
        </NavLink>
        <NavLink to="/bookmark" className="headerLink">
          <HiOutlineHeart aria-hidden="true" />
          Bookmarks
          {bookmarks.length > 0 && (
            <span className="countBadge" aria-label={`${bookmarks.length} bookmarks`}>
              {bookmarks.length}
            </span>
          )}
        </NavLink>
        <User />
      </nav>
      <button
        type="button"
        className="iconBtn themeToggle"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <HiOutlineSun aria-hidden="true" /> : <HiOutlineMoon aria-hidden="true" />}
      </button>
    </header>
  );
}

export default Header;

export function User() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <NavLink to="/login" className="headerLink">
        <HiOutlineUserCircle aria-hidden="true" />
        Log in
      </NavLink>
    );
  }

  return (
    <div className="userMenu">
      <span className="userAvatar" aria-hidden="true">
        {user.name.charAt(0).toUpperCase()}
      </span>
      <span className="userName">{user.name}</span>
      <button type="button" className="iconBtn" onClick={handleLogout} aria-label="Log out">
        <MdLogout className="logout icon" aria-hidden="true" />
      </button>
    </div>
  );
}
