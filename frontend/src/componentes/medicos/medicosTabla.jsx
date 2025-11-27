import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../api.js";

export default function MedicosTabla({ reloadKey, onEdit }) {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const loadMedicos = () => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/medicos`)
      .then((res) => res.json())
      .then(setMedicos)
      .catch(() => setError("Error al cargar médicos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedicos();
  }, [reloadKey]);

  const deleteMedico = (id) => {
    if (!confirm("¿Seguro que querés eliminar este médico?")) return;

    fetch(`${API_BASE}/api/medicos/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.status === 204) loadMedicos();
      })
      .catch(() => alert("Error al eliminar médico"));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicos;
    return medicos.filter((m) => {
      return (
        m.matricula?.toString().toLowerCase().includes(q) ||
        m.nombre?.toLowerCase().includes(q) ||
        m.apellido?.toLowerCase().includes(q)
      );
    });
  }, [medicos, query]);

  return (
    <div className="card shadow-lg border-0 rounded-4 mt-4 w-100" style={{ maxWidth: "900px" }}>
      <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between">
        <div>
          <h2 className="h5 fw-bold mb-1">Médicos registrados</h2>
          <p className="text-muted small">
            Listado de todos los médicos cargados.
          </p>
        </div>
        <div className="d-flex gap-2">
          <input
            className="form-control form-control-sm"
            style={{ minWidth: "180px", maxWidth: "220px" }}
            placeholder="Buscar por nombre o matrícula"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-outline-primary btn-sm" onClick={loadMedicos}>
            Recargar
          </button>
        </div>
      </div>

      <div className="card-body p-0">
        {loading && (
          <p className="text-center text-muted py-4 mb-0">
            Cargando médicos...
          </p>
        )}

        {error && (
          <p className="text-center text-danger py-4 mb-0">
            {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            No hay médicos que coincidan.
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr className="text-center">
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Matrícula</th>
                  <th>Especialidad</th>
                  <th style={{ width: "18%" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="text-center">
                    <td>{m.nombre}</td>
                    <td>{m.apellido}</td>
                    <td>{m.matricula}</td>
                    <td>{m.especialidades}</td>

                    <td className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-3"
                        onClick={() => onEdit && onEdit(m)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm rounded-3"
                        onClick={() => deleteMedico(m.id)}
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
