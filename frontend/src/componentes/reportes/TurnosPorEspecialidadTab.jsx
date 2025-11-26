import { useEffect, useMemo, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { API_BASE } from "../../api";
import { downloadReportPdf } from "./downloadReportPdf";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const palette = [
  { background: "rgba(13,110,253,0.75)", border: "rgba(13,110,253,1)" },
  { background: "rgba(111,66,193,0.75)", border: "rgba(111,66,193,1)" },
  { background: "rgba(25,135,84,0.75)", border: "rgba(25,135,84,1)" },
  { background: "rgba(255,193,7,0.75)", border: "rgba(255,193,7,1)" },
  { background: "rgba(220,53,69,0.75)", border: "rgba(220,53,69,1)" },
  { background: "rgba(32,201,151,0.75)", border: "rgba(32,201,151,1)" },
];

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: "Turnos por estado",
    },
  },
  scales: {
    x: {
      title: { display: true, text: "Estado del turno" },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0,
      },
      title: { display: true, text: "Cantidad" },
    },
  },
};

const TurnosPorEspecialidadTab = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [especialidadId, setEspecialidadId] = useState("");
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [espRes, turnosRes] = await Promise.all([
          fetch(`${API_BASE}/api/especialidades`),
          fetch(`${API_BASE}/api/turnos`),
        ]);

        if (!espRes.ok) throw new Error("No se pudieron cargar las especialidades");
        if (!turnosRes.ok) throw new Error("No se pudieron cargar los turnos");

        const [espData, turnosData] = await Promise.all([espRes.json(), turnosRes.json()]);
        if (cancelled) return;

        setEspecialidades(espData);
        setTurnos(turnosData);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Ocurrio un problema al obtener los datos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTurnos = useMemo(() => {
    if (!especialidadId) return [];
    return turnos.filter(turno => String(turno.especialidad_id) === especialidadId);
  }, [turnos, especialidadId]);

  const statusCounts = useMemo(() => {
    return filteredTurnos.reduce((acc, turno) => {
      const key = turno.estado || "Sin estado";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [filteredTurnos]);

  const chartData = useMemo(() => {
    const labels = Object.keys(statusCounts);
    if (labels.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Turnos",
            data: [],
            backgroundColor: "rgba(13,110,253,0.75)",
            borderColor: "rgba(13,110,253,1)",
            borderWidth: 1,
            borderRadius: 8,
          },
        ],
      };
    }

    return {
      labels,
      datasets: [
        {
          label: "Turnos",
          data: labels.map(label => statusCounts[label]),
          backgroundColor: labels.map((_, idx) => palette[idx % palette.length].background),
          borderColor: labels.map((_, idx) => palette[idx % palette.length].border),
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  }, [statusCounts]);

  const selectedEspecialidad = especialidades.find(esp => String(esp.id) === especialidadId);
  const totalTurnos = filteredTurnos.length;
  const handleDownload = async () => {
    if (!especialidadId || !reportRef.current) return;
    setDownloading(true);
    try {
      await downloadReportPdf({
        element: reportRef.current,
        fileName: `turnos-especialidad-${selectedEspecialidad?.nombre || "sin-especialidad"}`,
        title: "Turnos por especialidad",
        subtitle: selectedEspecialidad
          ? `Especialidad: ${selectedEspecialidad.nombre} | Total de turnos: ${totalTurnos}`
          : undefined,
      });
    } catch (err) {
      console.error("Error al descargar el PDF", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label htmlFor="reporte-especialidad" className="form-label fw-semibold">
            Especialidad
          </label>
          <select
            id="reporte-especialidad"
            className="form-select"
            value={especialidadId}
            onChange={event => setEspecialidadId(event.target.value)}
          >
            <option value="">Selecciona una especialidad...</option>
            {especialidades.map(esp => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mt-3 mb-0" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-muted py-5">
          <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
          <p className="mb-0">Preparando el reporte...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-4">
          {!especialidadId ? (
            <div className="alert alert-info mb-0" role="alert">
              Elegi una especialidad para ver la distribucion de estados de sus turnos.
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h5 className="mb-1">Reporte por especialidad</h5>
                  <p className="text-muted small mb-0">
                    Incluye el grafico y el resumen visible para la especialidad seleccionada.
                  </p>
                </div>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleDownload}
                  disabled={downloading || chartData.labels.length === 0}
                >
                  {downloading ? "Generando PDF..." : "Descargar PDF"}
                </button>
              </div>

              <div ref={reportRef}>
                <div className="row g-4">
                  <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        {chartData.labels.length === 0 ? (
                          <p className="text-muted mb-0">No se registran turnos para la especialidad indicada.</p>
                        ) : (
                          <div style={{ minHeight: 320 }}>
                            <Bar data={chartData} options={chartOptions} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <p className="text-uppercase text-muted fw-semibold small mb-2">Resumen</p>
                        <h5 className="mb-2">
                          {selectedEspecialidad ? selectedEspecialidad.nombre : "Especialidad sin nombre"}
                        </h5>
                        <p className="text-muted mb-4">
                          Turnos contabilizados en todos los estados para la especialidad seleccionada.
                        </p>
                        <div className="border rounded-4 p-3 mb-3 bg-light">
                          <p className="text-muted mb-1 small">Total de turnos</p>
                          <p className="display-6 fw-bold mb-0">{totalTurnos}</p>
                        </div>
                        <ul className="list-unstyled mb-0">
                          {Object.entries(statusCounts).map(([estado, cantidad], idx) => (
                            <li key={estado} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "999px",
                                    backgroundColor: palette[idx % palette.length].background,
                                  }}
                                ></span>
                                <span className="fw-semibold">{estado}</span>
                              </div>
                              <span>{cantidad}</span>
                            </li>
                          ))}
                          {Object.keys(statusCounts).length === 0 && (
                            <li className="text-muted">Sin turnos registrados.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TurnosPorEspecialidadTab;
