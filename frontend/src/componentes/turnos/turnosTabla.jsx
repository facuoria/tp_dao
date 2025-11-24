import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../api.js";

export default function TurnosTabla({ reloadKey, onEdit }) {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const loadTurnos = () => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/turnos`)
      .then(res => res.json())
      .then(setTurnos)
      .catch(() => setError("Error al cargar turnos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTurnos();
  }, [reloadKey]);

  const deleteTurno = (id, estado) => {
    if (!/cancelado/i.test(estado)) {
      alert("Solo se pueden eliminar turnos cancelados.");
      return;
    }

    if (!confirm("¿Seguro que querés eliminar este turno?")) return;

    fetch(`${API_BASE}/api/turnos/${id}`, { method: "DELETE" })
      .then(res => {
        if (res.status === 204) loadTurnos();
      })
      .catch(() => alert("Error al eliminar turno"));
  };

  const formatFecha = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return turnos;
    return turnos.filter((t) => {
      const paciente = `${t.paciente_apellido || ""} ${t.paciente_nombre || ""}`.toLowerCase();
      const medico = `${t.medico_apellido || ""} ${t.medico_nombre || ""}`.toLowerCase();
      const estado = (t.estado || "").toLowerCase();
      return paciente.includes(q) || medico.includes(q) || estado.includes(q);
    });
  }, [turnos, query]);

  return (
    <div className="card shadow-lg border-0 rounded-4 mt-4 w-100" style={{ maxWidth: "900px" }}>

      <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between">
        <div>
          <h2 className="h5 fw-bold mb-1">Turnos registrados</h2>
          <p className="text-muted small">Listado de turnos cargados.</p>
        </div>

        <div className="d-flex gap-2">
          <input
            className="form-control form-control-sm"
            style={{ minWidth: "220px" }}
            placeholder="Buscar por paciente, médico o estado"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-outline-primary btn-sm" onClick={loadTurnos}>
            Recargar
          </button>
        </div>
      </div>

      <div className="card-body p-0">
        {loading && (
          <p className="text-center text-muted py-4 mb-0">Cargando turnos...</p>
        )}

        {error && (
          <p className="text-center text-danger py-4 mb-0">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">No hay turnos cargados.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">

              <thead className="table-light">
                <tr className="text-center">
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Inicio</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                  <th>Observaciones</th>
                  <th style={{ width: "18%" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="text-center">

                    <td>{t.paciente_apellido}, {t.paciente_nombre}</td>

                    <td>{t.medico_apellido}, {t.medico_nombre}</td>

                    <td>{formatFecha(t.inicio)}</td>

                    <td>{t.duracion} min</td>

                    <td>{t.estado}</td>

                    <td>{t.motivo || "-"}</td>

                    <td style={{ whiteSpace: "pre-wrap" }}>
                      {t.observaciones || "-"}
                    </td>

                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm rounded-3"
                          onClick={() => onEdit && onEdit(t)}
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-danger btn-sm rounded-3"
                          disabled={!/cancelado/i.test(t.estado)}
                          onClick={() => deleteTurno(t.id, t.estado)}
                        >
                          Eliminar
                        </button>
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
