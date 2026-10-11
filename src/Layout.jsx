import { useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const NAV = {
  ADMIN: [
    ["/admin", "Dashboard"],
    ["/admin/students", "Students"],
    ["/admin/faculty", "Faculty"],
    ["/admin/classes", "Classes"],
    ["/admin/subjects", "Subjects"],
    ["/admin/records", "Attendance Records"],
    ["/admin/reports", "Reports"],
  ],
  FACULTY: [
    ["/faculty", "Dashboard"],
    ["/faculty/mark", "Mark Attendance"],
    ["/faculty/records", "Attendance Records"],
    ["/faculty/reports", "Reports"],
  ],
  STUDENT: [["/student", "My Attendance"]],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <strong>Attendance</strong>
          <span>Management System</span>
        </div>
        <nav>
          {NAV[user.role].map(([to, label]) => (
            <NavLink key={to} to={to} end onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="who">
            <strong>{user.name}</strong>
            <span>{user.role.toLowerCase()}</span>
          </div>
          <button className="btn ghost-light" onClick={logout}>Log out</button>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Open menu">Menu</button>
          <span>{user.name}</span>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
