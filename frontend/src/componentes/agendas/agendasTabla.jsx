import { useEffect, useState } from "react";
import { API_BASE } from "../../api";

export default function AgendasTabla({ reloadKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAgenda = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/agenda/medico/1`) // <-- cambiar luego si querés seleccionar médico
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAgenda();
  }, [reloadKey]);

  const deleteItem = (id) => {
    if (!confirm("¿Eliminar esta franja?")) return;

    fetch(`${API_BASE}/api/agenda/${id}`, { method: "DELETE" })
      .then((res) => res.status === 204 && loadAgenda());
  };

  return (
    <div
      className="card shadow-lg border-0 rounded-4 mt-4 mx-auto"
      style={{ maxWidth: "900px" }}
    >
      <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between">
        <h2 className="h5 fw-bold mb-1">Agenda cargada</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={loadAgenda}>
          Recargar
        </button>
      </div>

      <div className="card-body p-0">
        {loading && (
          <p className="text-center text-muted py-4 mb-0">
            Cargando agenda…
          </p>
        )}

        {!loading && items.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            No hay franjas cargadas.
          </p>
        )}

        {!loading && items.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="table-light">
                <tr className="text-center">
                  <th>Día</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Duración</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="text-center">
                    <td>{a.dia_semana}</td>
                    <td>{a.hora_inicio}</td>
                    <td>{a.hora_fin}</td>
                    <td>{a.duracion_min} min</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm rounded-3"
                        onClick={() => deleteItem(a.id)}
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
