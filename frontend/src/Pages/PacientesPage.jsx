import { useEffect, useState } from "react";
import PacientesForms from "../componentes/pacientes/pacientesForms.jsx";
import PacientesTabla from "../componentes/pacientes/pacientesTabla.jsx";
import { API_BASE } from "../api.js";

export default function PacientesPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyPaciente, setHistoryPaciente] = useState(null);
  const [historialTurnos, setHistorialTurnos] = useState([]);
  const [historialLoading, setHistorialLoading] = useState(false);

  const openHistory = (paciente) => {
    setHistoryPaciente(paciente);
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
    setHistorialTurnos([]);
    setHistoryPaciente(null);
  };

  useEffect(() => {
    if (showHistory && historyPaciente) {
      setHistorialLoading(true);
      fetch(`${API_BASE}/api/turnos`)
        .then((r) => r.json())
        .then((data) => {
          const dniPaciente = historyPaciente.dni?.toString();
          const filtrados = data.filter(
            (t) => t.paciente_dni?.toString() === dniPaciente
          );
          setHistorialTurnos(filtrados);
        })
        .finally(() => setHistorialLoading(false));
    }
  }, [showHistory, historyPaciente]);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestión de Pacientes</h1>

      <div className="d-flex flex-wrap gap-4 align-items-start justify-content-center">
        <div className="d-flex flex-column align-items-center" style={{ maxWidth: "520px", flex: "1 1 360px" }}>
          <PacientesForms
            onSuccess={() => setReloadKey((k) => k + 1)}
            editingPaciente={editingPaciente}
            onCancelEdit={() => setEditingPaciente(null)}
          />
        </div>

        <div className="flex-grow-1" style={{ minWidth: "460px", maxWidth: "1200px" }}>
          <PacientesTabla
            reloadKey={reloadKey}
            onEdit={setEditingPaciente}
            onViewHistory={openHistory}
          />
        </div>
      </div>

      {showHistory && historyPaciente && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div
            className="card shadow-lg border-0 rounded-4"
            style={{ width: "95%", maxWidth: "1100px", maxHeight: "90vh", overflow: "hidden" }}
          >
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Historial de {historyPaciente.nombre} {historyPaciente.apellido}</h5>
                <small className="text-light">DNI: {historyPaciente.dni} • Tel: {historyPaciente.telefono || "-"}</small>
              </div>
              <button className="btn btn-outline-light btn-sm" onClick={closeHistory}>Cerrar</button>
            </div>

            <div className="card-body p-0" style={{ overflowY: "auto" }}>
              {historialLoading ? (
                <p className="text-center text-muted py-4 mb-0">
                  Cargando historial...
                </p>
              ) : historialTurnos.length === 0 ? (
                <p className="text-center text-muted py-4 mb-0">
                  No hay turnos registrados para este paciente.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr className="text-center">
                        <th>Fecha</th>
                        <th>Médico</th>
                        <th>Especialidad</th>
                        <th>Estado</th>
                        <th>Duración</th>
                        <th>Motivo</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialTurnos.map((t) => (
                        <tr key={t.id} className="text-center">
                          <td>{t.inicio ? new Date(t.inicio).toLocaleString("es-AR") : "-"}</td>
                          <td>{t.medico_nombre} {t.medico_apellido}</td>
                          <td>{t.especialidad_nombre}</td>
                          <td>{t.estado}</td>
                          <td>{t.duracion} min</td>
                          <td>{t.motivo || "-"}</td>
                          <td style={{ whiteSpace: "pre-wrap" }}>{t.observaciones || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
