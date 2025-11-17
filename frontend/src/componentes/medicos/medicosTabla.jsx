import { useEffect, useState } from "react";

export default function MedicoTable({ reloadKey }) {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== CARGAR MÉDICOS =====
  const loadMedicos = () => {
    setLoading(true);
    setError(null);

    fetch("http://localhost:8000/api/medicos")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar médicos");
        return res.json();
      })
      .then((data) => {
        setMedicos(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Cargar al inicio y cuando reloadKey cambia
  useEffect(() => {
    loadMedicos();
  }, [reloadKey]);

  // ===== BORRAR MÉDICO =====
  const deleteMedico = (id) => {
    if (!confirm("¿Seguro que querés eliminar este médico?")) return;

    fetch(`http://localhost:8000/api/medicos/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.status === 204) {
          loadMedicos();
        } else {
          return res.json().then((data) => {
            alert(data.detail || "Error al borrar médico");
          });
        }
      })
      .catch(() => alert("Error de conexión al eliminar médico"));
  };

  return (
    <div className="card shadow-sm border-0" style={{ width: "700px" }}>
      <div className="card-header bg-white border-0 pt-3 pb-1 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="h5 mb-1">Médicos registrados</h2>
          <p className="text-muted small mb-0">
            Listado de todos los médicos cargados.
          </p>
        </div>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={loadMedicos}
        >
          Recargar
        </button>
      </div>

      <div className="card-body p-0">
        {loading && (
          <p className="text-center text-muted py-3 mb-0">Cargando médicos…</p>
        )}

        {error && (
          <p className="text-center text-danger py-3 mb-0">Error: {error}</p>
        )}

        {!loading && !error && medicos.length === 0 && (
          <p className="text-center text-muted py-3 mb-0">
            No hay médicos cargados.
          </p>
        )}

        {!loading && !error && medicos.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Matrícula</th>
                  <th>Especialidad</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {medicos.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nombre}</td>
                    <td>{m.apellido}</td>
                    <td>{m.matricula}</td>
                    <td>{m.especialidades}</td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger"
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
