import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../api.js";

export default function EspecialidadesTabla({ reloadKey }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState("");

  const loadData = () => {
    setLoading(true);
    setErr(null);

    fetch(`${API_BASE}/api/especialidades`)
      .then(r => {
        if (!r.ok) throw new Error("Error al cargar");
        return r.json();
      })
      .then(setLista)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [reloadKey]);

  const eliminar = (id) => {
    if (!confirm("¿Eliminar especialidad?")) return;

    fetch(`${API_BASE}/api/especialidades/${id}`, { method: "DELETE" })
      .then(r => {
        if (r.status === 204) loadData();
      })
      .catch(() => alert("Error de conexión"));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((e) => e.nombre?.toLowerCase().includes(q));
  }, [lista, query]);

  return (
    <div
      className="card shadow-lg border-0 rounded-4 mt-4 w-100"
      style={{ maxWidth: "700px" }}
    >
      <div className="card-header bg-white border-0 d-flex justify-content-between">
        <div>
          <h2 className="h5 fw-bold mb-1">Especialidades registradas</h2>
          <p className="text-muted small mb-0">
            Listado de especialidades médicas.
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <input
            className="form-control form-control-sm"
            style={{ minWidth: "180px", maxWidth: "220px" }}
            placeholder="Buscar por nombre"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={loadData}
          >
            Recargar
          </button>
        </div>
      </div>

      <div className="card-body p-0">
        {loading && (
          <p className="text-center text-muted py-4">Cargando…</p>
        )}

        {err && (
          <p className="text-center text-danger py-4">{err}</p>
        )}

        {!loading && !err && filtered.length === 0 && (
          <p className="text-center text-muted py-4">
            No hay especialidades que coincidan.
          </p>
        )}

        {!loading && !err && filtered.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover table-striped text-center align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th style={{ width: "18%" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td className="fw-semibold">{e.nombre}</td>
                    <td className="d-flex justify-content-center">
                      <button
                        className="btn btn-danger btn-sm rounded-3"
                        onClick={() => eliminar(e.id)}
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

