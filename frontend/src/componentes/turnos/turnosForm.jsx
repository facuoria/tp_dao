import { useEffect, useState } from "react";
import TurnosTable from "./turnosTabla.jsx";

export default function TurnoForm({ onCreated }) {
  const EMPTY_FORM = {
    paciente_id: "",
    medico_id: "",
    fecha: "",
    duracion_min: "30",
    horario: "",
    estado_turno_id: "",
    motivo: "",
    observaciones: "",
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [alert, setAlert] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // ================================
  // Cargar listas
  // ================================
  useEffect(() => {
    fetch("http://localhost:8000/api/pacientes")
      .then((r) => r.json())
      .then(setPacientes);

    fetch("http://localhost:8000/api/medicos")
      .then((r) => r.json())
      .then(setMedicos);

    fetch("http://localhost:8000/api/estados")
      .then((r) => r.json())
      .then(setEstados);
  }, []);

  // ================================
  // Generador de horarios dinámicos
  // ================================
  const generarHorarios = (duracion) => {
    const lista = [];
    const start = 10 * 60; 
    const end = 20 * 60;

    duracion = parseInt(duracion);
    if (!duracion || duracion <= 0) return [];

    for (let min = start; min <= end; min += duracion) {
      const h = String(Math.floor(min / 60)).padStart(2, "0");
      const m = String(min % 60).padStart(2, "0");
      lista.push(`${h}:${m}`);
    }
    return lista;
  };

  useEffect(() => {
    if (form.fecha && form.duracion_min) {
      setHorarios(generarHorarios(form.duracion_min));
      setForm({ ...form, horario: "" });
    }
  }, [form.fecha, form.duracion_min]);

  // ================================
  // Formato de fecha humano
  // ================================
  const formatoFechaHumano = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    try {
      const body = {
        paciente_id: form.paciente_id,
        medico_id: form.medico_id,
        fecha_hora: form.fecha ? `${form.fecha} ${form.horario || "00:00"}` : "",
        duracion_min: form.duracion_min,
        estado_turno_id: form.estado_turno_id,
        motivo: form.motivo,
        observaciones: form.observaciones,
      };

      const res = await fetch("http://localhost:8000/api/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 201) {
        setAlert({ ok: true, text: "Turno guardado correctamente." });
        setForm(EMPTY_FORM);
        setReloadKey((k) => k + 1);
        if (onCreated) onCreated();
      } else {
        const data = await res.json().catch(() => ({}));
        setAlert({ ok: false, text: data.detail || "No se pudo guardar el turno." });
      }
    } catch (err) {
      setAlert({ ok: false, text: err.message || "Error al guardar turno." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-center align-items-start gap-4">

        {/* Botón + Formulario */}
        <div className="d-flex flex-column align-items-center" style={{ width: "460px", maxWidth: "100%" }}>
          <div className="text-center w-100">
            <button
              className="btn btn-primary btn-lg px-4"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cerrar formulario" : "Registrar Turno"}
            </button>
          </div>

          <div className={`slide-left mt-4 w-100 ${showForm ? "show" : ""}`}>

            <div className="card shadow border-0 rounded-4">
              <div className="card-header text-center bg-white border-0">
                <h2 className="h5 fw-bold">Registrar Turno</h2>
                <p className="text-muted small">Complete los datos del turno.</p>
              </div>

              <div className="card-body">

                {alert && (
                  <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"}`}>
                    {alert.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">

                  <div className="d-flex gap-2 align-items-center text-muted small">
                    <span>Fecha seleccionada:</span>
                    <strong>{form.fecha ? formatoFechaHumano(form.fecha) : "-----"}</strong>
                  </div>

                  {/* PACIENTE */}
                  <div className="form-floating">
                    <select
                      className="form-select"
                      name="paciente_id"
                      value={form.paciente_id}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar...</option>
                      {pacientes.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.dni} - {p.nombre} {p.apellido}
                        </option>
                      ))}
                    </select>
                    <label>Paciente</label>
                  </div>

                  {/* MÉDICO */}
                  <div className="form-floating">
                    <select
                      className="form-select"
                      name="medico_id"
                      value={form.medico_id}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar...</option>
                      {medicos.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nombre} {m.apellido} - Mat: {m.matricula}
                        </option>
                      ))}
                    </select>
                    <label>Médico</label>
                  </div>

                  {/* FECHA */}
                  <div className="form-floating">
                    <input
                      type="date"
                      name="fecha"
                      className="form-control"
                      value={form.fecha}
                      onChange={handleChange}
                    />
                    <label>Fecha</label>
                  </div>

                  {/* DURACIÓN */}
                  <div className="form-floating">
                    <input
                      type="number"
                      name="duracion_min"
                      className="form-control"
                      value={form.duracion_min}
                      min={5}
                      onChange={handleChange}
                    />
                    <label>Duración (min)</label>
                  </div>

                  {/* HORARIOS DISPONIBLES */}
                  <div className="form-floating">
                    <select
                      className="form-select"
                      name="horario"
                      value={form.horario}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar horario...</option>
                      {horarios.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <label>Horario disponible</label>
                  </div>

                  {/* ESTADO DEL TURNO */}
                  <div className="form-floating">
                    <select
                      className="form-select"
                      name="estado_turno_id"
                      value={form.estado_turno_id}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar...</option>
                      {estados.map((e, idx) => (
                        <option key={idx} value={idx + 1}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                    <label>Estado del turno</label>
                  </div>

                  {/* MOTIVO */}
                  <div className="form-floating">
                    <input
                      className="form-control"
                      name="motivo"
                      value={form.motivo}
                      onChange={handleChange}
                      placeholder="Motivo"
                    />
                    <label>Motivo</label>
                  </div>

                  {/* OBSERVACIONES */}
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      name="observaciones"
                      style={{ height: "80px" }}
                      value={form.observaciones}
                      onChange={handleChange}
                      placeholder="Observaciones"
                    />
                    <label>Observaciones</label>
                  </div>

                  <button className="btn btn-primary w-100" disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar Turno"}
                  </button>

                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla a la derecha */}
        <div className="flex-grow-1" style={{ minWidth: "380px", maxWidth: "900px" }}>
          <TurnosTable reloadKey={reloadKey} />
        </div>
      </div>
    </div>
  );
}
