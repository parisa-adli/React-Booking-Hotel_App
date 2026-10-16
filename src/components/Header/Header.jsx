import { MdLogout } from "react-icons/md";
import { HiOutlineHeart, HiOutlineLocationMarker, HiOutlineUserCircle } from "react-icons/hi";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useBookmark } from "../context/BookmarkListContext";
import SearchBar from "../SearchBar/SearchBar";
import logo from "../../assets/brand/stays-logo.svg";
import logoIcon from "../../assets/brand/stays-icon.svg";

function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const { bookmarks } = useBookmark();

  return (
    <header className={`header ${isHome ? "header--home" : ""}`}>
      <Link to="/" className="brand" aria-label="Stays home">
        <img src={logoIcon} alt="" className="brandMark" />
        <img src={logo} alt="" className="brandName" />
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
