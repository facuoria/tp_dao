// src/components/PacienteTable.jsx
import { useEffect, useState } from "react";
import { API_BASE } from "../../api.js";

function PacienteTable({ reloadKey, onEdit }) {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
  <div className="card shadow-lg border-0 rounded-4 mt-4 w-100">
    <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center rounded-top-4">
      <div>
        <h2 className="h5 fw-bold mb-1">Pacientes registrados</h2>
        <p className="text-muted small mb-0">
          Listado de todos los pacientes almacenados.
        </p>
      </div>

      <button
        type="button"
        className="btn btn-outline-primary btn-sm px-3 rounded-3"
        onClick={loadPacientes}
      >
        Recargar
      </button>
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

      {!loading && !error && pacientes.length === 0 && (
        <div className="py-4 text-center text-muted">
          No hay pacientes cargados.
        </div>
      )}

      {!loading && !error && pacientes.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead className="table-light">
              <tr className="text-center text-muted">
                <th style={{ width: "12%" }}>DNI</th>
                <th style={{ width: "20%" }}>Nombre</th>
                <th style={{ width: "20%" }}>Apellido</th>
                <th style={{ width: "20%" }}>Mail</th>
                <th style={{ width: "16%" }}>Teléfono</th>
                <th style={{ width: "12%" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id} className="text-center">
                  <td>{p.dni}</td>
                  <td>{p.nombre}</td>
                  <td>{p.apellido}</td>
                  <td>{p.mail || "-"}</td>
                  <td>{p.telefono || "-"}</td>

                  <td className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm rounded-3 px-3 shadow-sm"
                      onClick={() => onEdit && onEdit(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-3 px-3 shadow-sm"
                      onClick={() => deletePaciente(p.id)}
                    >
                      Eliminar
                    </button>
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
