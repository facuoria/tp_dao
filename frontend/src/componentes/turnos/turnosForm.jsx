import { useEffect, useState } from "react";
import { API_BASE } from "../../api.js";

export default function TurnosForm({ onSuccess, editingTurno, onCancelEdit }) {
  const EMPTY_FORM = {
    paciente_id: "",
    medico_id: "",
    fecha: "",
    horario: "",
    duracion_min: "30",
    estado_turno_id: "",
    motivo: "",
    observaciones: ""
  };

  const isEdit = Boolean(editingTurno?.id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [horarios, setHorarios] = useState([]);
  // New state to hold agenda entries for selected doctor
  const [agenda, setAgenda] = useState([]);
  const hoy = new Date().toISOString().split("T")[0];

  // ---------------- VALIDACIONES ----------------
  // ---------------- VALIDACIONES ----------------
  const validate = () => {
    const e = {};

    // Validaciones solo para creación
    if (!isEdit) {
      if (!form.paciente_id) e.paciente_id = "Elegí paciente";
      if (!form.medico_id) e.medico_id = "Elegí médico";
    }

    // Validaciones comunes
    if (!form.estado_turno_id) e.estado_turno_id = "Elegí estado";

    // Validar fecha/hora solo si es nuevo O si es reprogramado
    const isReprogramado = estados.find(est => est.id == form.estado_turno_id)?.nombre.toLowerCase() === "reprogramado";

    if (!isEdit || isReprogramado) {
      if (!form.fecha) e.fecha = "La fecha es obligatoria";
      if (!form.horario) e.horario = "Elegí horario";
    }
    
    return e;
  };

  useEffect(() => {
    setErrors(validate());
  }, [form, isEdit, estados]); // Agregamos dependencias

  // ---------------- CARGO LISTAS ----------------
  useEffect(() => {
    fetch(`${API_BASE}/api/pacientes`).then(r => r.json()).then(setPacientes);
    fetch(`${API_BASE}/api/medicos?solo_con_agenda=true`).then(r => r.json()).then(setMedicos);
    fetch(`${API_BASE}/api/estados`).then(r => r.json()).then(setEstados);
  }, []);

  // Fetch agenda whenever a doctor is selected
  useEffect(() => {
    if (form.medico_id) {
      fetch(`${API_BASE}/api/agenda?medico_id=${form.medico_id}`)
        .then(r => r.json())
        .then(setAgenda);
    } else {
      setAgenda([]);
    }
  }, [form.medico_id]);

  // ---------------- HORARIOS ----------------
  const generarHorarios = (inicioStr, finStr, duracion) => {
    const toMinutes = (t) => {
      const [h, m] = t.split(":");
      return Number(h) * 60 + Number(m);
    };
    const inicio = toMinutes(inicioStr);
    const fin = toMinutes(finStr);
    const step = Number(duracion);
    const arr = [];
    for (let m = inicio; m <= fin; m += step) {
      const h = String(Math.floor(m / 60)).padStart(2, "0");
      const min = String(m % 60).padStart(2, "0");
      arr.push(`${h}:${min}`);
    }
    return arr;
  };

  useEffect(() => {
    if (form.fecha && agenda.length > 0) {
      const dateObj = new Date(form.fecha);
      const weekday = dateObj.getDay(); // 0 = Sunday, 1 = Monday ...
      const entry = agenda.find(a => a.dia_semana === weekday);
      if (entry) {
        // Update form duration to match agenda
        setForm(prev => ({ ...prev, duracion_min: entry.duracion_min }));
        const slots = generarHorarios(entry.hora_inicio, entry.hora_fin, entry.duracion_min);
        setHorarios(slots);
      } else {
        // No agenda for this day
        setHorarios([]);
        // Optionally set an error for fecha
        setErrors(prev => ({ ...prev, fecha: "El médico no atiende este día" }));
      }
    } else {
      setHorarios([]);
    }
  }, [form.fecha, agenda]);

  // ---------------- EDICIÓN ----------------
  useEffect(() => {
    if (editingTurno && estados.length > 0) {
      // Mapear el nombre del estado al ID
      const estadoEncontrado = estados.find(e => e.nombre.toLowerCase() === editingTurno.estado.toLowerCase());

      setForm({
        paciente_id: "", // No se edita
        medico_id: "",   // No se edita
        fecha: editingTurno.inicio.split("T")[0],
        horario: editingTurno.inicio.split("T")[1].slice(0, 5),
        duracion_min: editingTurno.duracion,
        estado_turno_id: estadoEncontrado ? estadoEncontrado.id : "",
        motivo: editingTurno.motivo,
        observaciones: editingTurno.observaciones
      });
      setShowForm(true);
      setTouched({});
      setErrors({});
    } else if (!editingTurno) {
      setForm(EMPTY_FORM);
    }
  }, [editingTurno, estados]);

  const markTouched = (f) => {
    setTouched(prev => ({ ...prev, [f]: true }));
  };

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAlert(null);
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);

    let payload;
    let endpoint;
    let method;

    if (isEdit) {
      // Payload reducido para edición
      payload = {
        estado_turno_id: Number(form.estado_turno_id),
        fecha_hora: (form.fecha && form.horario) ? `${form.fecha}T${form.horario}` : null
      };
      endpoint = `${API_BASE}/api/turnos/${editingTurno.id}`;
      method = "PUT";
    } else {
      // Payload completo para creación
      payload = {
        paciente_id: Number(form.paciente_id),
        medico_id: Number(form.medico_id),
        fecha_hora: `${form.fecha}T${form.horario}`,
        duracion_min: Number(form.duracion_min),
        estado_turno_id: Number(form.estado_turno_id),
        motivo: form.motivo,
        observaciones: form.observaciones
      };
      endpoint = `${API_BASE}/api/turnos`;
      method = "POST";
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAlert({ ok: true, text: isEdit ? "Turno actualizado" : "Turno registrado" });
        if (onSuccess) onSuccess();
        if (onCancelEdit) onCancelEdit();
        setForm(EMPTY_FORM);
      } else {
        const data = await res.json();
        setAlert({ ok: false, text: data.detail || "Error inesperado" });
      }

    } catch {
      setAlert({ ok: false, text: "Error de conexión" });
    }

    setSubmitting(false);
  };

  // ---------------- RENDER ----------------
  return (
    <div className="d-flex flex-column align-items-center gap-3" style={{ width: "100%", maxWidth: "520px" }}>
      {/* BOTÓN */}
      <div className="text-center w-100">
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cerrar formulario" : isEdit ? "Editar Turno" : "Registrar Turno"}
        </button>

        {isEdit && (
          <div className="text-muted small mt-1">
            Editando Turno #{editingTurno?.id}
          </div>
        )}
      </div>

      {/* FORM */}
      <div className={`slide-left w-100 ${showForm ? "show" : ""}`}>
        <div className="card shadow border-0 rounded-4 p-4" style={{ width: "100%" }}>

          {alert && (
            <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"}`}>
              {alert.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* PACIENTE - Solo visible en creación */}
              {!isEdit && (
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className={`form-select ${touched.paciente_id && errors.paciente_id ? "is-invalid" : ""
                        }`}
                      name="paciente_id"
                      value={form.paciente_id}
                      onChange={handleChange}
                      onBlur={() => markTouched("paciente_id")}
                    >
                      <option value="">Seleccionar...</option>
                      {pacientes.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.dni} - {p.nombre} {p.apellido}
                        </option>
                      ))}
                    </select>
                    <label>Paciente</label>
                    <div className="invalid-feedback">{errors.paciente_id}</div>
                  </div>
                </div>
              )}

              {/* MÉDICO - Solo visible en creación */}
              {!isEdit && (
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className={`form-select ${touched.medico_id && errors.medico_id ? "is-invalid" : ""
                        }`}
                      name="medico_id"
                      value={form.medico_id}
                      onChange={handleChange}
                      onBlur={() => markTouched("medico_id")}
                    >
                      <option value="">Seleccionar...</option>
                      {medicos.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nombre} {m.apellido} - Mat: {m.matricula}
                        </option>
                      ))}
                    </select>
                    <label>Médico</label>
                    <div className="invalid-feedback">{errors.medico_id}</div>
                  </div>
                </div>
              )}

              {/* ESTADO - Siempre visible */}
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className={`form-select ${touched.estado_turno_id && errors.estado_turno_id ? "is-invalid" : ""
                      }`}
                    name="estado_turno_id"
                    value={form.estado_turno_id}
                    onChange={handleChange}
                    onBlur={() => markTouched("estado_turno_id")}
                  >
                    <option value="">Seleccionar...</option>
                    {estados.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                  <label>Estado</label>
                  <div className="invalid-feedback">{errors.estado_turno_id}</div>
                </div>
              </div>

              {/* FECHA - Visible en creación O si es reprogramado */}
              {(!isEdit || (isEdit && estados.find(e => e.id == form.estado_turno_id)?.nombre.toLowerCase() === "reprogramado")) && (
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="date"
                      name="fecha"
                      min={hoy} 
                      className={`form-control ${touched.fecha && errors.fecha ? "is-invalid" : ""
                        }`}
                      value={form.fecha}
                      onChange={handleChange}
                      onBlur={() => markTouched("fecha")}
                    />
                    <label>Fecha</label>
                    <div className="invalid-feedback">{errors.fecha}</div>
                  </div>
                </div>
              )}

              {/* HORARIO - Visible en creación O si es reprogramado */}
              {(!isEdit || (isEdit && estados.find(e => e.id == form.estado_turno_id)?.nombre.toLowerCase() === "reprogramado")) && (
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className={`form-select ${touched.horario && errors.horario ? "is-invalid" : ""
                        }`}
                      name="horario"
                      value={form.horario}
                      onChange={handleChange}
                      onBlur={() => markTouched("horario")}
                    >
                      <option value="">Seleccionar...</option>
                      {horarios.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <label>Horario</label>
                    <div className="invalid-feedback">{errors.horario}</div>
                  </div>
                </div>
              )}

              {/* MOTIVO - Solo visible en creación */}
              {!isEdit && (
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      className="form-control"
                      name="motivo"
                      value={form.motivo}
                      onChange={handleChange}
                    />
                    <label>Motivo</label>
                  </div>
                </div>
              )}

              {/* OBSERVACIONES - Solo visible en creación (según pedido estricto) */}
              {!isEdit && (
                <div className="col-12">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      name="observaciones"
                      style={{ height: "80px" }}
                      value={form.observaciones}
                      onChange={handleChange}
                    />
                    <label>Observaciones</label>
                  </div>
                </div>
              )}

              {/* BOTONES */}
              <div className="col-12 d-flex gap-2 mt-3">
                <button className="btn btn-primary flex-grow-1" disabled={submitting || !isValid}>
                  {submitting ? "Guardando..." : isEdit ? "Actualizar Turno" : "Guardar Turno"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setTouched({});
                    setErrors({});
                    if (onCancelEdit) onCancelEdit();
                  }}
                >
                  {isEdit ? "Cancelar edición" : "Limpiar"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
