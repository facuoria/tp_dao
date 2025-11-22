import { useState } from "react";
import TurnosPorMedicoTab from "./TurnosPorMedicoTab";
import TurnosPorEspecialidadTab from "./TurnosPorEspecialidadTab";
import PacientesAtendidosTab from "./PacientesAtendidosTab";
import AsistenciasInasistenciasTab from "./AsistenciasInasistenciasTab";

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19h16" />
    <path d="M8 19V9" />
    <path d="M12 19V5" />
    <path d="M16 19v-7" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="7" r="4" />
    <path d="M5 21c1.5-3 4.5-5 7-5s5.5 2 7 5" />
  </svg>
);

const MicroscopeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 18h12" />
    <path d="M9 18v-7l4-4" />
    <path d="M11 5l4 4" />
    <circle cx="15" cy="9" r="3" />
    <path d="M4 22h16" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="7" cy="7" r="3" />
    <circle cx="17" cy="7" r="3" />
    <path d="M2 21c0-3 2-6 5-6s5 3 5 6" />
    <path d="M12 21c0-3 2-6 5-6s5 3 5 6" />
  </svg>
);

const DonutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v6l4 2" />
  </svg>
);

const TABS = [
  {
    id: "turnos-medico",
    label: "Turnos por medico",
    description: "Filtra turnos atendidos por profesional y periodo",
    icon: <UserIcon />,
  },
  {
    id: "turnos-especialidad",
    label: "Cantidad por especialidad",
    description: "Explora la distribucion de estados por especialidad",
    icon: <MicroscopeIcon />,
  },
  {
    id: "pacientes-atendidos",
    label: "Pacientes atendidos",
    description: "Cantidad de pacientes con turnos atendidos en un periodo",
    icon: <PeopleIcon />,
  },
  {
    id: "asistencias-inasistencias",
    label: "Asistencias vs inasistencias",
    description: "Distribucion de asistencias e inasistencias de pacientes",
    icon: <DonutIcon />,
  },
];

const HospitalStats = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  return (
    <section id="hospital-stats" className="bg-light py-5">
      <div className="container">
        <div className="text-center mb-4">
          <p className="text-primary text-uppercase fw-semibold small mb-2">
            Analisis y estadisticas del hospital
          </p>
          <h2 className="fw-bold mb-3">Explora la actividad asistencial reciente</h2>
          <p className="text-muted mb-0">
            Filtra y compara los turnos por profesional o especialidad para entender la demanda de atencion.
          </p>
        </div>

        <div className="border rounded-4 bg-white px-3 py-2 shadow-sm mb-4">
          <div className="d-flex flex-wrap">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="bg-transparent border-0 py-3 px-3 text-start flex-grow-1"
                  style={{
                    color: isActive ? "#0d6efd" : "#6c757d",
                    borderBottom: `3px solid ${isActive ? "#0d6efd" : "transparent"}`,
                    borderRadius: 0,
                    minWidth: "200px",
                  }}
                >
                  <div className="d-flex align-items-center gap-2 fw-semibold">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "34px",
                        height: "34px",
                        backgroundColor: isActive ? "rgba(13,110,253,0.1)" : "rgba(108,117,125,0.1)",
                        color: isActive ? "#0d6efd" : "#6c757d",
                      }}
                    >
                      {tab.icon ?? <ChartIcon />}
                    </span>
                    {tab.label}
                  </div>
                  <p className="small mb-0 mt-1 text-muted">{tab.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {activeTab === "turnos-medico" && <TurnosPorMedicoTab />}
            {activeTab === "turnos-especialidad" && <TurnosPorEspecialidadTab />}
            {activeTab === "pacientes-atendidos" && <PacientesAtendidosTab />}
            {activeTab === "asistencias-inasistencias" && <AsistenciasInasistenciasTab />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalStats;
