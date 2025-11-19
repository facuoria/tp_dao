import { Link } from "react-router-dom";
export default function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary px-4"
      style={{ position: "relative", zIndex: 9999 }}
    >
      <Link className="navbar-brand fw-bold" to="/">Turnero Médico</Link>

      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="navbar-collapse show" id="navbarNav" style={{ display: "block" }}>
        <ul className="navbar-nav ms-auto">
          <li className="nav-item"><Link className="nav-link" to="/pacientes">Pacientes</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/medicos">Médicos</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/agendas">Agendas</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/turnos">Turnos</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/especialidades">Especialidades</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/recetas">Recetas</Link></li>
        </ul>
      </div>
    </nav>
  );
}
