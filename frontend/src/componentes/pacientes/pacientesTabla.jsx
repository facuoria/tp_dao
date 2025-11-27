// src/components/PacienteTable.jsx
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../api.js";

function PacienteTable({ reloadKey, onEdit, onViewHistory }) {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  async function loadPacientes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/pacientes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPacientes(data);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los pacientes.");
    } finally {
      setLoading(false);
    }
  }

  // 👉 BORRAR PACIENTE
  async function deletePaciente(id) {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este paciente?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/pacientes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("No se pudo eliminar el paciente");

      // Recargar lista
      loadPacientes();
    } catch (err) {
      alert(err.message);
    }
  }

  // Se ejecuta al montar y cuando cambia reloadKey
  useEffect(() => {
    loadPacientes();
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pacientes;
    return pacientes.filter((p) => {
      return (
        p.dni?.toString().includes(q) ||
        p.nombre?.toLowerCase().includes(q) ||
        p.apellido?.toLowerCase().includes(q)
      );
    });
  }, [pacientes, query]);

  return (
  <div className="card shadow-lg border-0 rounded-4 mt-4 w-100">
    <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center rounded-top-4">
      <div>
        <h2 className="h5 fw-bold mb-1">Pacientes registrados</h2>
        <p className="text-muted small mb-0">
          Listado de todos los pacientes almacenados.
        </p>
      </div>

      <div className="d-flex gap-2">
        <input
          className="form-control form-control-sm"
          style={{ minWidth: "180px" }}
          placeholder="Buscar por DNI o nombre"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline-primary btn-sm px-3 rounded-3"
          onClick={loadPacientes}
        >
          Recargar
        </button>
      </div>
    </div>

    <div className="card-body p-0">
      {loading && (
        <div className="py-4 text-center text-muted">
          <div className="spinner-border spinner-border-sm me-2"></div>
          Cargando pacientes…
        </div>
      )}

      {error && !loading && (
        <div className="py-4 text-center text-danger fw-semibold">
          Error: {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-4 text-center text-muted">
          No hay pacientes que coincidan.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="table-scroll-x">
          <table className="table table-hover table-striped align-middle mb-0" style={{ overflow: "visible" }}>
            <thead className="table-light">
              <tr className="text-center text-muted">
                <th style={{ width: "12%" }}>DNI</th>
                <th style={{ width: "20%" }}>Nombre</th>
                <th style={{ width: "20%" }}>Apellido</th>
                <th style={{ width: "20%" }}>Mail</th>
                <th style={{ width: "16%" }}>Teléfono</th>
                <th style={{ width: "18%", minWidth: "230px" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="text-center">
                  <td>{p.dni}</td>
                  <td>{p.nombre}</td>
                  <td>{p.apellido}</td>
                  <td>{p.mail || "-"}</td>
                  <td>{p.telefono || "-"}</td>

                  <td>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <button
                        className="btn btn-danger btn-sm rounded-3 px-3 shadow-sm"
                        onClick={() => deletePaciente(p.id)}
                      >
                        Eliminar
                      </button>
                      <div className="dropdown position-relative">
                        <button
                          className="btn btn-outline-secondary btn-sm rounded-3 shadow-sm"
                          type="button"
                          onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                        >
                          <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>⋮</span>
                        </button>
                        <ul
                          className={`dropdown-menu dropdown-menu-end ${openMenu === p.id ? "show" : ""}`}
                          style={{
                            display: openMenu === p.id ? "block" : "none",
                            minWidth: "10rem",
                            transform: "translate(-20px, 8px)",
                            zIndex: 3000,
                            position: "absolute",
                            inset: "auto auto auto auto",
                            overflow: "visible"
                          }}
                        >
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                onEdit && onEdit(p);
                                setOpenMenu(null);
                              }}
                            >
                              Editar
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                onViewHistory && onViewHistory(p);
                                setOpenMenu(null);
                              }}
                            >
                              Ver historial
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
  );
}

export default PacienteTable;
