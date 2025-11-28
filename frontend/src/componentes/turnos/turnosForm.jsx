import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../api.js";

export default function TurnosForm({ onSuccess, editingTurno, onCancelEdit }) {
  const jsToAgendaDay = (jsDay) => (jsDay + 6) % 7; // JS: 0=Domingo; Agenda: 0=Lunes
  const EMPTY_FORM = {
    paciente_id: "",
    medico_id: "",
    fecha: "",
    horario: "",
    duracion_min: "30",
    estado_turno_id: "",
    motivo: "",
    observaciones: "",
  };

  const isEdit = Boolean(editingTurno?.id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [horarios, setHorarios] = useState([]); // {hora, duracion}
  const [turnos, setTurnos] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const fechasDisponibles = useMemo(() => {
    if (!agenda.length) return [];
    const daysSet = new Set(agenda.map(a => Number(a.dia_semana)));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const res = [];
    for (let i = 0; i < 730; i++) {
      const d = new Date(today.getTime() + i * 86400000);
      const agendaDay = jsToAgendaDay(d.getDay());
      if (daysSet.has(agendaDay)) res.push(d.toISOString().slice(0, 10));
    }
    return res;
  }, [agenda]);

  const atiendeFecha = (dateStr) => {
    if (!dateStr || !agenda.length) return false;
    const dow = jsToAgendaDay(new Date(`${dateStr}T00:00:00`).getDay());
    return agenda.some(a => Number(a.dia_semana) === Number(dow));
  };

  const opcionesFecha = useMemo(() => {
    const set = new Set(fechasDisponibles);
    if (form.fecha && atiendeFecha(form.fecha)) set.add(form.fecha);
    return Array.from(set).sort();
  }, [fechasDisponibles, form.fecha, agenda]);

  // ---------------- VALIDACIONES ----------------
  const validate = () => {
    const e = {};

    if (!isEdit) {
      if (!form.paciente_id) e.paciente_id = "Elegí paciente";
      if (!form.medico_id) e.medico_id = "Elegí médico";
    }

    if (!form.estado_turno_id) e.estado_turno_id = "Elegí estado";

    const isReprogramado = estados.find(est => est.id == form.estado_turno_id)?.nombre.toLowerCase() === "reprogramado";

    if (!isEdit || isReprogramado) {
      if (!form.fecha) {
        e.fecha = "La fecha es obligatoria";
      } else if (agenda.length && !atiendeFecha(form.fecha)) {
        e.fecha = "El médico no atiende este día";
      }
      if (!form.horario) e.horario = "Elegí horario";
    }

    return e;
  };

  useEffect(() => {
    setErrors(validate());
  }, [form, isEdit, estados, fechasDisponibles, agenda]);

  // ---------------- CARGO LISTAS ----------------
  const loadTurnos = () => fetch(`${API_BASE}/api/turnos`).then(r => r.json()).then(setTurnos);

  useEffect(() => {
    fetch(`${API_BASE}/api/pacientes`).then(r => r.json()).then(setPacientes);
    fetch(`${API_BASE}/api/medicos?solo_con_agenda=true`).then(r => r.json()).then(setMedicos);
    fetch(`${API_BASE}/api/estados`).then(r => r.json()).then(setEstados);
    loadTurnos();
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

  useEffect(() => {
    if (agenda.length && form.fecha && !atiendeFecha(form.fecha)) {
      setForm(prev => ({ ...prev, fecha: "" }));
      setHorarios([]);
    }
  }, [agenda, form.fecha]);


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
    for (let m = inicio; m + step <= fin; m += step) {
      const h = String(Math.floor(m / 60)).padStart(2, "0");
      const min = String(m % 60).padStart(2, "0");
      arr.push({ hora: `${h}:${min}`, duracion: step });
    }
    return arr;
  };

  useEffect(() => {
    if (form.fecha && agenda.length > 0) {
      const dateObj = new Date(`${form.fecha}T00:00:00`);
      const weekday = jsToAgendaDay(dateObj.getDay()); // agenda: 0 = Monday
      const entries = agenda.filter(a => Number(a.dia_semana) === Number(weekday));
      if (entries.length) {
        const slots = entries.flatMap(a => generarHorarios(a.hora_inicio, a.hora_fin, a.duracion_min));

        const disponibles = slots.filter(slot => {
          const ignoreId = isEdit ? editingTurno?.id : null;
          return !turnos.some(t => {
            if (ignoreId && t.id === ignoreId) return false;
            if (String(t.medico_id) !== String(form.medico_id)) return false;
            if (/atendido|cancelado/i.test(t.estado || "")) return false;
            if (!t.inicio) return false;
            const tFecha = t.inicio.split("T")[0];
            const tHora = t.inicio.slice(11, 16);
            return tFecha === form.fecha && tHora === slot.hora;
          });
        });

        setHorarios(disponibles);
        if (disponibles.length) {
          setForm(prev => ({
            ...prev,
            duracion_min: disponibles.find(d => d.hora === prev.horario)?.duracion ?? disponibles[0].duracion
          }));
        }
      } else {
        setHorarios([]);
        setErrors(prev => ({ ...prev, fecha: "El médico no atiende este día" }));
      }
    } else {
      setHorarios([]);
    }
  }, [form.fecha, agenda, turnos, form.medico_id, isEdit, editingTurno]);

  // ---------------- EDICIÓN ----------------
  useEffect(() => {
    if (editingTurno && estados.length > 0) {
      const estadoEncontrado = estados.find(e => e.nombre.toLowerCase() === editingTurno.estado.toLowerCase());

      setForm({
        paciente_id: "",
        medico_id: editingTurno.medico_id ?? "",
        fecha: editingTurno.inicio.split("T")[0],
        horario: editingTurno.inicio.split("T")[1].slice(0, 5),
        duracion_min: editingTurno.duracion,
        estado_turno_id: estadoEncontrado ? estadoEncontrado.id : "",
        motivo: editingTurno.motivo,
        observaciones: editingTurno.observaciones,
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
    const { name, value } = e.target;
    if (name === "horario") {
      const slot = horarios.find(h => h.hora === value);
      setForm(prev => ({ ...prev, horario: value, duracion_min: slot?.duracion ?? prev.duracion_min }));
    } else if (name === "fecha") {
      if (!agenda.length) {
        setForm({ ...form, fecha: value });
        setHorarios([]);
        return;
      }
      const permitida = atiendeFecha(value) ? value : "";
      if (!permitida) {
        setForm({ ...form, fecha: "" });
        setErrors(prev => ({ ...prev, fecha: "El médico no atiende este día" }));
        setHorarios([]);
        return;
      }
      setForm({ ...form, [name]: permitida });
      setHorarios([]);
    } else {
      setForm({ ...form, [name]: value });
    }
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
      payload = {
        estado_turno_id: Number(form.estado_turno_id),
        fecha_hora: (form.fecha && form.horario) ? `${form.fecha}T${form.horario}` : null,
      };
      endpoint = `${API_BASE}/api/turnos/${editingTurno.id}`;
      method = "PUT";
    } else {
      payload = {
        paciente_id: Number(form.paciente_id),
        medico_id: Number(form.medico_id),
        fecha_hora: `${form.fecha}T${form.horario}`,
        duracion_min: Number(form.duracion_min),
        estado_turno_id: Number(form.estado_turno_id),
        motivo: form.motivo,
        observaciones: form.observaciones,
      };
      endpoint = `${API_BASE}/api/turnos`;
      method = "POST";
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setAlert({ ok: true, text: isEdit ? "Turno actualizado" : "Turno registrado" });
        if (onSuccess) onSuccess();
        if (onCancelEdit) onCancelEdit();
        setForm(EMPTY_FORM);
        loadTurnos();
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

      <div className="w-100" style={{ display: showForm ? "block" : "none" }}>
        <div className="card shadow border-0 rounded-4 p-4" style={{ width: "100%" }}>

          {alert && (
            <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"}`}>
              {alert.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {!isEdit && (
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className={`form-select ${touched.paciente_id && errors.paciente_id ? "is-invalid" : ""}`}
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

              {!isEdit && (
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className={`form-select ${touched.medico_id && errors.medico_id ? "is-invalid" : ""}`}
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

              <div className="col-md-6">
                <div className="form-floating">
                  <select
                className={`form-select ${touched.estado_turno_id && errors.estado_turno_id ? "is-invalid" : ""}`}
                name="estado_turno_id"
                value={form.estado_turno_id}
                onChange={handleChange}
                onBlur={() => markTouched("estado_turno_id")}
              >
                <option value="">Seleccionar...</option>
                {estados
                  .filter(e => (!isEdit ? e.nombre.toLowerCase() === "asignado" : true))
                  .map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
              </select>
                  <label>Estado</label>
                  <div className="invalid-feedback">{errors.estado_turno_id}</div>
                </div>
              </div>

              {(!isEdit || (isEdit && estados.find(e => e.id == form.estado_turno_id)?.nombre.toLowerCase() === "reprogramado")) && (
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      name="fecha"
                      disabled={!opcionesFecha.length}
                      className={`form-select ${touched.fecha && errors.fecha ? "is-invalid" : ""}`}
                      value={form.fecha}
                      onChange={handleChange}
                      onBlur={() => markTouched("fecha")}
                    >
                      <option value="">{opcionesFecha.length ? "Seleccione fecha..." : "Sin agenda cargada"}</option>
                      {opcionesFecha.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <label>Fecha</label>
                    <div className="invalid-feedback">{errors.fecha}</div>
                  </div>
                </div>
              )}

              {(!isEdit || (isEdit && estados.find(e => e.id == form.estado_turno_id)?.nombre.toLowerCase() === "reprogramado")) && (
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className={`form-select ${touched.horario && errors.horario ? "is-invalid" : ""}`}
                      name="horario"
                      value={form.horario}
                      onChange={handleChange}
                      onBlur={() => markTouched("horario")}
                    >
                      <option value="">Seleccionar...</option>
                      {horarios.map(h => (
                        <option key={h.hora} value={h.hora}>{h.hora}</option>
                      ))}
                    </select>
                    <label>Horario</label>
                    <div className="invalid-feedback">{errors.horario}</div>
                  </div>
                </div>
              )}

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
