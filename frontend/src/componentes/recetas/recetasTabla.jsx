import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../api";

export default function RecetasTabla({ reloadKey }) {
  const [recetas, setRecetas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function loadData() {
    setLoading(true);

    const [recRes, pacRes, medRes] = await Promise.all([
      fetch(`${API_BASE}/api/recetas`).then(r => r.json()),
      fetch(`${API_BASE}/api/pacientes`).then(r => r.json()),
      fetch(`${API_BASE}/api/medicos`).then(r => r.json())
    ]);

    setPacientes(pacRes);
    setMedicos(medRes);

    // Crear mapas por ID para nombres
    const mapPacientes = Object.fromEntries(
      pacRes.map(p => [p.id, `${p.nombre} ${p.apellido}`])
    );

    const mapMedicos = Object.fromEntries(
      medRes.map(m => [m.id, `${m.nombre} ${m.apellido}`])
    );

    // Enriquecer recetas
    const enriched = recRes.map(r => ({
      ...r,
      paciente_nombre: mapPacientes[r.paciente_id],
      medico_nombre: mapMedicos[r.medico_id]
    }));

    setRecetas(enriched);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [reloadKey]);

  async function deleteReceta(id) {
    if (!window.confirm("¿Eliminar receta?")) return;

    const res = await fetch(`${API_BASE}/api/recetas/${id}`, {
      method: "DELETE"
    });

    if (res.ok) loadData();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recetas;
    return recetas.filter((r) => {
      const paciente = (r.paciente_nombre || "").toLowerCase();
      const medico = (r.medico_nombre || "").toLowerCase();
      const indic = (r.indicaciones || "").toLowerCase();
      return paciente.includes(q) || medico.includes(q) || indic.includes(q);
    });
  }, [recetas, query]);

  return (
    <div className="card shadow-lg border-0 rounded-4 mt-4 w-100">
      <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center rounded-top-4">
        <div>
          <h2 className="h5 fw-bold mb-1">Recetas generadas</h2>
          <p className="text-muted small mb-0">
            Listado de todas las recetas registradas en el sistema.
          </p>
        </div>

        <div className="d-flex gap-2">
          <input
            className="form-control form-control-sm"
            style={{ minWidth: "220px" }}
            placeholder="Buscar por paciente, médico o indicaciones"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline-primary btn-sm px-3 rounded-3"
            onClick={loadData}
          >
            Recargar
          </button>
        </div>
      </div>

      <div className="card-body p-0">
        {loading ? (
          <div className="py-4 text-center text-muted">
            Cargando recetas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-4 text-center text-muted">
            No hay recetas que coincidan.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr className="text-center text-muted">
                  <th style={{ width: "15%" }}>Fecha</th>
                  <th style={{ width: "25%" }}>Paciente</th>
                  <th style={{ width: "25%" }}>Médico</th>
                  <th style={{ width: "25%" }}>Indicaciones</th>
                  <th style={{ width: "10%" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {recetas.map(r => (
                  <tr key={r.id} className="text-center">
                    <td>{r.fecha_emision}</td>
                    <td>{r.paciente_nombre}</td>
                    <td>{r.medico_nombre}</td>
                    <td>{r.indicaciones}</td>

                    <td className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-3 px-3 shadow-sm"
                        onClick={() => window.open(`${API_BASE}/api/recetas/${r.id}/pdf`, "_blank")}
                      >
                        Descargar PDF de receta
                      </button>

                      <button
                        className="btn btn-danger btn-sm rounded-3 px-3 shadow-sm"
                        onClick={() => deleteReceta(r.id)}
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
