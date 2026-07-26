import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "◱" },
  { to: "/researchers", label: "Researchers", icon: "◎" },
  { to: "/publications", label: "Publications", icon: "▤" },
  { to: "/projects", label: "Projects & Collaboration", icon: "⇄" },
  { to: "/conferences", label: "Conferences", icon: "▦" },
  { to: "/citations", label: "Citations", icon: "❝" },
  { to: "/institutions", label: "Institutions", icon: "⌂" },
  { to: "/reports", label: "Reports", icon: "▥" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="mark">
            <span>◈</span> SCNA
          </div>
          <div className="sub">Collaboration Network</div>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          {(user?.role === "system_admin" || user?.role === "institution_admin") && (
            <NavLink to="/audit" className={({ isActive }) => (isActive ? "active" : "")}>
              <span aria-hidden="true">◐</span>
              Audit Log
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            {user?.name}
            <div className="role-pill">{user?.role?.replace("_", " ")}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
