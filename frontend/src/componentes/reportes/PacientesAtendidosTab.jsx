import { useEffect, useMemo, useState } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: "Turnos atendidos en el periodo",
    },
  },
  scales: {
    x: { title: { display: true, text: "Tiempo" } },
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1, precision: 0 },
      title: { display: true, text: "Cantidad de turnos" },
    },
  },
};

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

const PacientesAtendidosTab = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    desde: defaultDesde,
    hasta: defaultHasta,
  });

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
        if (!cancelled) setError("No pudimos obtener los turnos. Intentalo nuevamente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadTurnos();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = event => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTurnos = useMemo(() => {
    const desdeDate = filters.desde ? new Date(`${filters.desde}T00:00:00`) : null;
    const hastaDate = filters.hasta ? new Date(`${filters.hasta}T23:59:59`) : null;
    return turnos.filter(turno => {
      if (turno.estado?.toLowerCase() !== "atendido") return false;
      const fecha = parseDateTime(turno.inicio);
      if (!fecha) return false;
      if (desdeDate && fecha < desdeDate) return false;
      if (hastaDate && fecha > hastaDate) return false;
      return true;
    });
  }, [turnos, filters]);

  const patientsData = useMemo(() => {
    const grouped = filteredTurnos.reduce((acc, turno) => {
      const key = `${turno.paciente_apellido}, ${turno.paciente_nombre} (DNI ${turno.paciente_dni})`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    return {
      entries,
      chartEntries: entries,
    };
  }, [filteredTurnos]);

  const timelineData = useMemo(() => {
    const sorted = [...filteredTurnos].sort((a, b) => {
      const timeA = parseDateTime(a.inicio)?.getTime() ?? 0;
      const timeB = parseDateTime(b.inicio)?.getTime() ?? 0;
      return timeA - timeB;
    });

    const labels = sorted.map(turno => {
      const fecha = parseDateTime(turno.inicio);
      const fechaTexto = fecha ? dateTimeFormatter.format(fecha) : "Sin fecha";
      const nombre = `${turno.paciente_apellido}, ${turno.paciente_nombre}`;
      return `${fechaTexto} - ${nombre}`;
    });

    return {
      labels,
      datasets: [
        {
          label: "Turnos atendidos",
          data: sorted.map(() => 1),
          backgroundColor: "rgba(13,110,253,0.7)",
          borderColor: "rgba(13,110,253,1)",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [filteredTurnos]);

  return (
    <div>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label htmlFor="pacientes-desde" className="form-label fw-semibold">
            Desde
          </label>
          <input
            id="pacientes-desde"
            type="date"
            className="form-control"
            name="desde"
            value={filters.desde}
            max={filters.hasta || undefined}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-6">
          <label htmlFor="pacientes-hasta" className="form-label fw-semibold">
            Hasta
          </label>
          <input
            id="pacientes-hasta"
            type="date"
            className="form-control"
            name="hasta"
            value={filters.hasta}
            min={filters.desde || undefined}
            onChange={handleChange}
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
          <p className="mb-0">Cargando pacientes atendidos...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-4">
          {patientsData.chartEntries.length === 0 ? (
            <div className="alert alert-info mb-0" role="alert">
              No se registran pacientes atendidos en el rango seleccionado.
            </div>
          ) : (
            <>
              <div className="row g-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div style={{ minHeight: 320 }}>
                        <Bar data={timelineData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="mb-0">Pacientes atendidos</h5>
                    <p className="text-muted small mb-0">
                      {patientsData.chartEntries.length} paciente
                      {patientsData.chartEntries.length === 1 ? "" : "s"} recibieron atencion en el periodo.
                    </p>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Paciente</th>
                        <th scope="col">Cantidad de turnos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientsData.chartEntries.map(([paciente, cantidad]) => (
                        <tr key={paciente}>
                          <td>{paciente}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary">{cantidad}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PacientesAtendidosTab;
