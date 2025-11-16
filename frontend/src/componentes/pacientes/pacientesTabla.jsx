// src/components/PacienteTable.jsx
import { useEffect, useState } from "react";
import { API_BASE } from "../../api.js";

function PacienteTable({ reloadKey }) {
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
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="h5 mb-1">Pacientes registrados</h2>
          <p className="text-muted small mb-2">
            Listado de todos los pacientes en la base de datos.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={loadPacientes}
        >
          Recargar
        </button>
      </div>

      <div className="card-body p-0">
        {loading && (
          <p className="text-center text-muted py-3 mb-0">
            Cargando pacientes…
          </p>
        )}

        {error && !loading && (
          <p className="text-center text-danger py-3 mb-0">
            Error: {error}
          </p>
        )}

        {!loading && !error && pacientes.length === 0 && (
          <p className="text-center text-muted py-3 mb-0">
            No hay pacientes cargados.
          </p>
        )}

        {!loading && !error && pacientes.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>DNI</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.dni}</td>
                    <td>{p.nombre}</td>
                    <td>{p.apellido}</td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger"
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
