import { useEffect, useState } from "react";
import { API_BASE } from "../../api.js";

export default function TurnosTable({ reloadKey }) {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTurnos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/turnos`);
      if (!res.ok) throw new Error("No se pudieron cargar los turnos");
      const data = await res.json();
      setTurnos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar turnos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurnos();
  }, [reloadKey]);

  const deleteTurno = async (id, estado) => {
    // opcional: chequeo front-end (el back igual valida)
    const esCancelado = /cancelado/i.test(estado || "");
    if (!esCancelado) {
      alert("Solo se pueden eliminar turnos en estado cancelado.");
      return;
    }

    if (!window.confirm("¿Seguro que querés eliminar este turno?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/turnos/${id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        setTurnos((prev) => prev.filter((t) => t.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "No se pudo eliminar el turno.");
      }
    } catch {
      alert("Error de conexión al intentar borrar el turno.");
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white border-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="h5 mb-1">Turnos registrados</h2>
          <p className="text-muted small mb-0">
            Listado de turnos con paciente, médico y estado.
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={loadTurnos}
        >
          Recargar
        </button>
      </div>

      <div className="card-body p-0">
        {loading && (
          <p className="text-center text-muted py-3 mb-0">
            Cargando turnos…
          </p>
        )}

        {error && !loading && (
          <p className="text-center text-danger py-3 mb-0">
            {error}
          </p>
        )}

        {!loading && !error && turnos.length === 0 && (
          <p className="text-center text-muted py-3 mb-0">
            No hay turnos registrados.
          </p>
        )}

        {!loading && !error && turnos.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Inicio</th>
                  <th>Duración</th>
                  <th>Motivo</th>
                  <th>Observaciones</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnos.map((t) => {
                  const esCancelado = /cancelado/i.test(t.estado || "");
                  return (
                    <tr key={t.id}>
                      <td>
                        {t.paciente_apellido}, {t.paciente_nombre}
                        <br />
                        <small className="text-muted">
                          DNI {t.paciente_dni}
                        </small>
                      </td>
                      <td>
                        {t.medico_apellido}, {t.medico_nombre}
                        <br />
                        <small className="text-muted">
                          Mat. {t.medico_matricula}
                        </small>
                      </td>
                      <td>{t.inicio}</td>
                      <td>{t.duracion} min</td>
                      <td>{t.motivo || "-"}</td>
                      <td>
                        <span style={{ whiteSpace: "pre-wrap" }}>
                          {t.observaciones || "-"}
                        </span>
                      </td>
                      <td>{t.estado}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-danger"
                          disabled={!esCancelado}
                          title={
                            esCancelado
                              ? "Eliminar turno cancelado"
                              : "Solo se pueden eliminar turnos cancelados"
                          }
                          onClick={() => deleteTurno(t.id, t.estado)}
                        >
                          Eliminar
                        </button>
                      </td>
                      
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
