import { useEffect, useState } from "react";

export default function MedicosTabla({ reloadKey }) {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMedicos = () => {
    setLoading(true);
    setError(null);

    fetch("http://localhost:8000/api/medicos")
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

    fetch(`http://localhost:8000/api/medicos/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.status === 204) loadMedicos();
      })
      .catch(() => alert("Error al eliminar médico"));
  };

  return (
    <div
      className="card shadow-lg border-0 rounded-4 mt-4 mx-auto"
      style={{ maxWidth: "900px" }}
    >
      <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between">
        <div>
          <h2 className="h5 fw-bold mb-1">Médicos registrados</h2>
          <p className="text-muted small">
            Listado de todos los médicos cargados.
          </p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadMedicos}>
          Recargar
        </button>
      </div>

      <div className="card-body p-0">
        {loading && (
          <p className="text-center text-muted py-4 mb-0">
            Cargando médicos…
          </p>
        )}

        {error && (
          <p className="text-center text-danger py-4 mb-0">
            {error}
          </p>
        )}

        {!loading && !error && medicos.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            No hay médicos cargados.
          </p>
        )}

        {!loading && !error && medicos.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="table-light">
                <tr className="text-center">
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Matrícula</th>
                  <th>Especialidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {medicos.map((m) => (
                  <tr key={m.id} className="text-center">
                    <td>{m.nombre}</td>
                    <td>{m.apellido}</td>
                    <td>{m.matricula}</td>
                    <td>{m.especialidades}</td>

                    <td>
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
