import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Award, User, LogOut, Shield, FileText, CheckCircle2 } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout, admin, isAdminAuthenticated, adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleAdminLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <Award className="text-accent" size={26} color="#0ea5a3" />
          <span>AI Interview <span className="accent">Portal</span></span>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
                Home
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/interview" className={`nav-link ${isActive("/interview") ? "active" : ""}`}>
                    Interviews
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/resume" className={`nav-link ${isActive("/resume") ? "active" : ""}`}>
                    <FileText size={16} /> Resume ATS
                  </Link>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="badge badge-accent">
                    <User size={13} /> {user?.name?.split(" ")[0]}
                  </span>
                  <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sign Out">
                    <LogOut size={14} /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Register
                  </Link>
                </li>
              </>
            )}

            {isAdminAuthenticated ? (
              <li>
                <Link to="/admin" className="badge badge-warning" style={{ textDecoration: "none" }}>
                  <Shield size={13} /> Admin
                </Link>
                <button onClick={handleAdminLogout} className="btn btn-secondary btn-sm" style={{ marginLeft: "4px" }}>
                  Exit
                </button>
              </li>
            ) : (
              <li>
                <Link to="/admin/login" className="nav-link" title="Admin Portal">
                  <Shield size={16} /> Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

