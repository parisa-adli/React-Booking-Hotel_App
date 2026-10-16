import { NavLink } from "react-router-dom";
import {
  HiOutlineHeart,
  HiOutlineLocationMarker,
  HiOutlineSearch,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { useAuth } from "../context/AuthProvider";
import { useBookmark } from "../context/BookmarkListContext";

function BottomNav() {
  const { isAuthenticated, user } = useAuth();
  const { bookmarks } = useBookmark();

  const items = [
    { to: "/", label: "Explore", icon: HiOutlineSearch, end: true },
    { to: "/hotels", label: "Places", icon: HiOutlineLocationMarker },
    { to: "/bookmark", label: "Bookmarks", icon: HiOutlineHeart, badge: bookmarks.length },
    {
      to: "/login",
      label: isAuthenticated ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "Log in",
      icon: HiOutlineUserCircle,
    },
  ];

  return (
    <nav className="bottomNav" aria-label="Primary">
      {items.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink key={to} to={to} end={end} className="bottomNavItem">
          <span className="bottomNavIcon">
            <Icon aria-hidden="true" />
            {badge > 0 && <span className="countBadge countBadge--dot">{badge}</span>}
          </span>
          <span className="bottomNavLabel">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
