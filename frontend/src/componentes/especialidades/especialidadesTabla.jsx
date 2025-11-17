import { useEffect, useState } from "react";
import { API_BASE } from "../../api.js";

export default function EspecialidadTable({ reloadKey }) {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadEspecialidades() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/especialidades`);
      if (!res.ok) throw new Error("No se pudo cargar la lista");
      const data = await res.json();
      setEspecialidades(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEspecialidad(id) {
    if (!confirm("¿Eliminar esta especialidad?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/especialidades/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al borrar la especialidad");

      loadEspecialidades();
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    loadEspecialidades();
  }, [reloadKey]);

  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between">
        <div>
          <h2 className="h5 mb-1">Especialidades registradas</h2>
          <p className="text-muted small mb-2">Listado de especialidades.</p>
        </div>

        <button className="btn btn-outline-secondary btn-sm" onClick={loadEspecialidades}>
          Recargar
        </button>
      </div>

      <div className="card-body p-0">
        {loading && <p className="text-center text-muted py-3 mb-0">Cargando…</p>}
        {error && <p className="text-center text-danger py-3 mb-0">{error}</p>}

        {!loading && !error && especialidades.length === 0 && (
          <p className="text-center text-muted py-3 mb-0">No hay especialidades cargadas.</p>
        )}

        {!loading && !error && especialidades.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {especialidades.map((esp) => (
                  <tr key={esp.id}>
                    <td>{esp.nombre}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteEspecialidad(esp.id)}
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