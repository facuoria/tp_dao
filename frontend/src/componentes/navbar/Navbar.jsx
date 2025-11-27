import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 992 : true
  );
  const location = useLocation();

  const toggle = () => setOpen(prev => !prev);
  const close = () => setOpen(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setOpen(true);
    }
  }, [isDesktop]);

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary px-4"
      style={{ position: "relative", zIndex: 9999 }}
    >
      <Link className="navbar-brand fw-bold" to="/" onClick={close}>
        Clínica San Gabriel
      </Link>

      <button
        className="navbar-toggler d-lg-none"
        type="button"
        aria-controls="navbarNav"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={toggle}
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div
        className="navbar-collapse"
        id="navbarNav"
        style={{ display: isDesktop ? "block" : open ? "block" : "none" }}
      >
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className={`nav-link ${isActive("/pacientes") ? "active" : ""}`} to="/pacientes" onClick={close}>
              Pacientes
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${isActive("/medicos") ? "active" : ""}`} to="/medicos" onClick={close}>
              Médicos
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${isActive("/agendas") ? "active" : ""}`} to="/agendas" onClick={close}>
              Agendas
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${isActive("/turnos") ? "active" : ""}`} to="/turnos" onClick={close}>
              Turnos
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${isActive("/especialidades") ? "active" : ""}`} to="/especialidades" onClick={close}>
              Especialidades
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${isActive("/recetas") ? "active" : ""}`} to="/recetas" onClick={close}>
              Recetas
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
