import { useEffect, useMemo, useRef, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import { API_BASE } from "../../api";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

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

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDate = value => {
  const parsed = parseDateTime(value);
  return parsed ? dateTimeFormatter.format(parsed) : "Sin fecha";
};

const chartOptions = {
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label(context) {
          const dataset = context.dataset;
          const total = dataset.data.reduce((sum, value) => sum + value, 0);
          const currentValue = dataset.data[context.dataIndex];
          const pct = total === 0 ? 0 : Math.round((currentValue / total) * 100);
          return `${context.label}: ${currentValue} (${pct}%)`;
        },
      },
    },
    legend: {
      position: "bottom",
    },
    title: {
      display: true,
      text: "Asistencias vs inasistencias",
    },
  },
};

const CATEGORY_CONFIG = {
  asistencias: {
    label: "Asistencias",
    color: "rgba(13,110,253,0.9)",
    borderColor: "rgba(13,110,253,1)",
    matcher: estado => estado === "atendido",
    emptyMessage: "No hubo asistencias en el periodo seleccionado.",
  },
  inasistencias: {
    label: "Inasistencias",
    color: "rgba(220,53,69,0.9)",
    borderColor: "rgba(220,53,69,1)",
    matcher: estado => estado !== "atendido",
    emptyMessage: "No hubo inasistencias en el periodo seleccionado.",
  },
};

const AsistenciasInasistenciasTab = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    desde: defaultDesde,
    hasta: defaultHasta,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadTurnos = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/turnos`);
        if (!res.ok) throw new Error("No se pudieron cargar los turnos");
        const data = await res.json();
        if (!cancelled) setTurnos(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Ocurrio un problema al cargar los turnos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTurnos();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedCategory(null);
  }, [filters.desde, filters.hasta, turnos]);

  const handleFilterChange = event => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTurnos = useMemo(() => {
    const desdeDate = filters.desde ? new Date(`${filters.desde}T00:00:00`) : null;
    const hastaDate = filters.hasta ? new Date(`${filters.hasta}T23:59:59`) : null;
    return turnos.filter(turno => {
      const fecha = parseDateTime(turno.inicio);
      if (!fecha) return false;
      if (desdeDate && fecha < desdeDate) return false;
      if (hastaDate && fecha > hastaDate) return false;
      return true;
    });
  }, [turnos, filters]);

  const categories = useMemo(() => {
    const normalized = filteredTurnos.map(turno => ({
      ...turno,
      estado_normalizado: turno.estado?.toLowerCase() ?? "",
    }));

    const asistencias = normalized.filter(t => CATEGORY_CONFIG.asistencias.matcher(t.estado_normalizado));
    const inasistencias = normalized.filter(t => CATEGORY_CONFIG.inasistencias.matcher(t.estado_normalizado));

    return {
      asistencias,
      inasistencias,
    };
  }, [filteredTurnos]);

  const pieData = useMemo(() => {
    return {
      labels: [CATEGORY_CONFIG.asistencias.label, CATEGORY_CONFIG.inasistencias.label],
      datasets: [
        {
          data: [categories.asistencias.length, categories.inasistencias.length],
          backgroundColor: [CATEGORY_CONFIG.asistencias.color, CATEGORY_CONFIG.inasistencias.color],
          borderColor: [CATEGORY_CONFIG.asistencias.borderColor, CATEGORY_CONFIG.inasistencias.borderColor],
          borderWidth: 2,
        },
      ],
    };
  }, [categories]);

  const handlePieClick = event => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const elements = chart.getElementsAtEventForMode(event.nativeEvent, "nearest", { intersect: true }, true);
    if (!elements.length) return;
    const index = elements[0].index;
    const newSelection = index === 0 ? "asistencias" : "inasistencias";
    setSelectedCategory(prev => (prev === newSelection ? null : newSelection));
  };

  const selectedTurnos = selectedCategory ? categories[selectedCategory] : [];

  return (
    <div>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label htmlFor="ai-desde" className="form-label fw-semibold">
            Desde
          </label>
          <input
            id="ai-desde"
            type="date"
            className="form-control"
            name="desde"
            value={filters.desde}
            max={filters.hasta || undefined}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-12 col-md-6">
          <label htmlFor="ai-hasta" className="form-label fw-semibold">
            Hasta
          </label>
          <input
            id="ai-hasta"
            type="date"
            className="form-control"
            name="hasta"
            value={filters.hasta}
            min={filters.desde || undefined}
            onChange={handleFilterChange}
          />
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
          <p className="mb-0">Analizando asistencias...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-4">
          {filteredTurnos.length === 0 ? (
            <div className="alert alert-info mb-0" role="alert">
              No hay turnos registrados en el rango seleccionado.
            </div>
          ) : (
            <>
              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body d-flex flex-column">
                      <div className="mb-3">
                        <p className="text-muted small mb-1">Clicks interactivos</p>
                        <p className="mb-0">
                          Tocá un segmento para mostrar los turnos que corresponden a esa categoría.
                        </p>
                      </div>
                      <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ minHeight: 280 }}>
                        <Pie ref={chartRef} data={pieData} options={chartOptions} onClick={handlePieClick} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <p className="text-uppercase text-muted fw-semibold small mb-2">Resumen</p>
                      <ul className="list-unstyled mb-3">
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                          const total = categories[key].length;
                          const overall = categories.asistencias.length + categories.inasistencias.length || 1;
                          const pct = Math.round((total / overall) * 100);
                          return (
                            <li key={key} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                              <span className="fw-semibold">{config.label}</span>
                              <span>
                                <span className="badge text-bg-light me-2">{pct}%</span>
                                {total} turno{total === 1 ? "" : "s"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="alert alert-secondary mb-0" role="alert">
                        Seleccion actual:{" "}
                        {selectedCategory ? CATEGORY_CONFIG[selectedCategory].label : "ninguna (muestra ambos estados)"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="mb-0">Turnos</h5>
                    <p className="text-muted small mb-0">
                      {selectedCategory
                        ? `Mostrando ${CATEGORY_CONFIG[selectedCategory].label.toLowerCase()} registradas`
                        : "Mostrando todas las asistencias e inasistencias del periodo"}
                    </p>
                  </div>
                </div>

                {selectedCategory && selectedTurnos.length === 0 ? (
                  <p className="text-muted mb-0">{CATEGORY_CONFIG[selectedCategory].emptyMessage}</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th scope="col">Paciente</th>
                          <th scope="col">Medico</th>
                          <th scope="col">Fecha</th>
                          <th scope="col">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedCategory ? selectedTurnos : filteredTurnos).map(turno => (
                          <tr key={turno.id}>
                            <td>
                              {turno.paciente_apellido}, {turno.paciente_nombre}
                              <div className="small text-muted">DNI {turno.paciente_dni}</div>
                            </td>
                            <td>
                              {turno.medico_apellido}, {turno.medico_nombre}
                              <div className="small text-muted">{turno.especialidad_nombre}</div>
                            </td>
                            <td>{formatDate(turno.inicio)}</td>
                            <td>
                              <span
                                className={`badge ${
                                  turno.estado?.toLowerCase() === "atendido"
                                    ? "bg-success-subtle text-success"
                                    : "bg-danger-subtle text-danger"
                                }`}
                              >
                                {turno.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AsistenciasInasistenciasTab;
