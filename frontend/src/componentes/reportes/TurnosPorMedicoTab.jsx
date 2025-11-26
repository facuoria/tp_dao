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

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const today = new Date();
const defaultHasta = today.toISOString().slice(0, 10);
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const defaultDesde = firstOfMonth.toISOString().slice(0, 10);

const parseDateTime = value => {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateTime = value => {
  const parsed = parseDateTime(value);
  return parsed ? dateTimeFormatter.format(parsed) : "Sin fecha";
};

const formatInputDate = value => {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? "" : shortDateFormatter.format(parsed);
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: "Turnos atendidos por dia",
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Fecha",
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0,
      },
      title: {
        display: true,
        text: "Cantidad",
      },
    },
  },
};

const TurnosPorMedicoTab = () => {
  const [medicos, setMedicos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    medicoId: "",
    desde: defaultDesde,
    hasta: defaultHasta,
  });
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [medicosRes, turnosRes] = await Promise.all([
          fetch(`${API_BASE}/api/medicos`),
          fetch(`${API_BASE}/api/turnos`),
        ]);

        if (!medicosRes.ok) throw new Error("Error al cargar medicos");
        if (!turnosRes.ok) throw new Error("Error al cargar turnos");

        const [medicosData, turnosData] = await Promise.all([
          medicosRes.json(),
          turnosRes.json(),
        ]);

        if (cancelled) return;
        setMedicos(medicosData);
        setTurnos(turnosData);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("No pudimos cargar los datos. Proba nuevamente en unos minutos.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFilterChange = event => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const hasMedicoSelected = Boolean(filters.medicoId);
  const selectedMedico = medicos.find(m => String(m.id) === filters.medicoId);

  const filteredTurnos = useMemo(() => {
    if (!hasMedicoSelected) return [];

    const desdeDate = filters.desde ? new Date(`${filters.desde}T00:00:00`) : null;
    const hastaDate = filters.hasta ? new Date(`${filters.hasta}T23:59:59`) : null;

    return turnos
      .filter(turno => turno.estado?.toLowerCase() === "atendido")
      .filter(turno => String(turno.medico_id) === filters.medicoId)
      .filter(turno => {
        const fecha = parseDateTime(turno.inicio);
        if (!fecha) return false;
        if (desdeDate && fecha < desdeDate) return false;
        if (hastaDate && fecha > hastaDate) return false;
        return true;
      })
      .sort((a, b) => {
        const fechaA = parseDateTime(a.inicio)?.getTime() ?? 0;
        const fechaB = parseDateTime(b.inicio)?.getTime() ?? 0;
        return fechaB - fechaA;
      });
  }, [turnos, filters, hasMedicoSelected]);

  const chartData = useMemo(() => {
    if (filteredTurnos.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Turnos atendidos",
            data: [],
            backgroundColor: "rgba(13,110,253,0.75)",
            borderColor: "rgba(13,110,253,1)",
            borderWidth: 1,
            borderRadius: 8,
          },
        ],
      };
    }

    const grouped = filteredTurnos.reduce((acc, turno) => {
      const fecha = parseDateTime(turno.inicio);
      if (!fecha) return acc;
      const key = fecha.toISOString().slice(0, 10);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(grouped).sort();

    return {
      labels: labels.map(label => shortDateFormatter.format(new Date(`${label}T00:00:00`))),
      datasets: [
        {
          label: "Turnos atendidos",
          data: labels.map(label => grouped[label]),
          backgroundColor: "rgba(13,110,253,0.75)",
          borderColor: "rgba(13,110,253,1)",
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  }, [filteredTurnos]);

  const handleDownload = async () => {
    if (!hasMedicoSelected || !reportRef.current) return;
    setDownloading(true);
    try {
      await downloadReportPdf({
        element: reportRef.current,
        fileName: `turnos-medico-${selectedMedico?.apellido || "sin-medico"}`,
        title: "Turnos atendidos por medico",
        subtitle: `${selectedMedico ? `${selectedMedico.nombre} ${selectedMedico.apellido}` : "Sin medico"} | Periodo: ${formatInputDate(filters.desde)} - ${formatInputDate(filters.hasta)} | Total: ${filteredTurnos.length}`,
      });
    } catch (err) {
      console.error("No se pudo generar el PDF", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <label htmlFor="turnos-desde" className="form-label fw-semibold">
            Desde
          </label>
          <input
            id="turnos-desde"
            type="date"
            className="form-control"
            name="desde"
            value={filters.desde}
            max={filters.hasta || undefined}
            onChange={handleFilterChange}
          />
        </div>

        <div className="col-12 col-md-4">
          <label htmlFor="turnos-hasta" className="form-label fw-semibold">
            Hasta
          </label>
          <input
            id="turnos-hasta"
            type="date"
            className="form-control"
            name="hasta"
            value={filters.hasta}
            min={filters.desde || undefined}
            onChange={handleFilterChange}
          />
        </div>

        <div className="col-12 col-md-4">
          <label htmlFor="turnos-medico" className="form-label fw-semibold">
            Medico
          </label>
          <select
            id="turnos-medico"
            className="form-select"
            name="medicoId"
            value={filters.medicoId}
            onChange={handleFilterChange}
          >
            <option value="">Selecciona un medico...</option>
            {medicos.map(medico => (
              <option key={medico.id} value={medico.id}>
                {medico.apellido}, {medico.nombre} - {medico.especialidades}
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
          <p className="mb-0">Cargando datos...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-4">
          {!hasMedicoSelected && (
            <div className="alert alert-info mb-0" role="alert">
              Selecciona un medico para visualizar los turnos atendidos en el periodo indicado.
            </div>
          )}

          {hasMedicoSelected && (
            <>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h5 className="mb-1">Reporte de turnos atendidos</h5>
                  <p className="text-muted small mb-0">
                    Incluye grafico, resumen y tabla visibles del medico seleccionado.
                  </p>
                </div>
                <button className="btn btn-outline-primary" onClick={handleDownload} disabled={downloading}>
                  {downloading ? "Generando PDF..." : "Descargar PDF"}
                </button>
              </div>

              <div ref={reportRef}>
                <div className="row g-4">
                  <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="text-uppercase text-muted fw-semibold mb-3">Distribucion</h6>
                        {filteredTurnos.length === 0 ? (
                          <p className="text-muted mb-0">No hay turnos atendidos para el periodo seleccionado.</p>
                        ) : (
                          <div style={{ minHeight: 320 }}>
                            <Bar data={chartData} options={chartOptions} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body d-flex flex-column">
                        <h6 className="text-uppercase text-muted fw-semibold mb-3">Resumen</h6>
                        <p className="mb-1">
                          <span className="fw-semibold">Medico:</span>{" "}
                          {selectedMedico
                            ? `${selectedMedico.nombre} ${selectedMedico.apellido} (${selectedMedico.especialidades})`
                            : "No disponible"}
                        </p>
                        <p className="mb-1">
                          <span className="fw-semibold">Periodo:</span>{" "}
                          {`${formatInputDate(filters.desde)} - ${formatInputDate(filters.hasta)}`}
                        </p>
                        <div className="mt-auto">
                          <p className="text-muted mb-1">Total de turnos atendidos</p>
                          <p className="display-5 fw-bold text-primary mb-0">{filteredTurnos.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div>
                      <h5 className="mb-0">Turnos atendidos</h5>
                      <p className="text-muted mb-0 small">
                        Mostrando {filteredTurnos.length} turno{filteredTurnos.length === 1 ? "" : "s"} atendido
                        {filteredTurnos.length === 1 ? "" : "s"} por el medico seleccionado.
                      </p>
                    </div>
                  </div>

                  {filteredTurnos.length === 0 ? (
                    <p className="text-muted mb-0">No se encontraron turnos atendidos para los filtros indicados.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead>
                          <tr>
                            <th scope="col">Paciente</th>
                            <th scope="col">Fecha y hora</th>
                            <th scope="col">Motivo</th>
                            <th scope="col">Observaciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTurnos.map(turno => (
                            <tr key={turno.id}>
                              <td>
                                <p className="fw-semibold mb-0">
                                  {turno.paciente_nombre} {turno.paciente_apellido}
                                </p>
                                <small className="text-muted">DNI {turno.paciente_dni}</small>
                              </td>
                              <td>
                                <span className="badge bg-success-subtle text-success fw-semibold mb-1">
                                  Atendido
                                </span>
                                <div className="small text-muted">{formatDateTime(turno.inicio)}</div>
                                <div className="small text-muted">Duracion: {turno.duracion ?? 0} min</div>
                              </td>
                              <td>{turno.motivo || "Sin motivo"}</td>
                              <td>{turno.observaciones || "Sin datos"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TurnosPorMedicoTab;
