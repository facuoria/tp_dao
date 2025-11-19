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

  // ---------------- VALIDACIONES ----------------
  const validate = () => {
    const e = {};
    if (!form.paciente_id) e.paciente_id = "Elegí paciente";
    if (!form.medico_id) e.medico_id = "Elegí médico";
    if (!form.fecha) e.fecha = "La fecha es obligatoria";
    if (!form.horario) e.horario = "Elegí horario";
    if (!form.estado_turno_id) e.estado_turno_id = "Elegí estado";
    return e;
  };

  useEffect(() => {
    setErrors(validate());
  }, [form]);

  // ---------------- CARGO LISTAS ----------------
  useEffect(() => {
    fetch(`${API_BASE}/api/pacientes`).then(r => r.json()).then(setPacientes);
    fetch(`${API_BASE}/api/medicos`).then(r => r.json()).then(setMedicos);
    fetch(`${API_BASE}/api/estados`).then(r => r.json()).then(setEstados);
  }, []);

  // ---------------- HORARIOS ----------------
  const generarHorarios = (duracion) => {
    const arr = [];
    const inicio = 10 * 60;
    const fin = 20 * 60;
    duracion = Number(duracion);

    for (let m = inicio; m <= fin; m += duracion) {
      const h = String(Math.floor(m / 60)).padStart(2, "0");
      const min = String(m % 60).padStart(2, "0");
      arr.push(`${h}:${min}`);
    }
    return arr;
  };

  useEffect(() => {
    if (form.fecha && form.duracion_min) {
      setHorarios(generarHorarios(form.duracion_min));
    }
  }, [form.fecha, form.duracion_min]);

  // ---------------- EDICIÓN ----------------
  useEffect(() => {
    if (editingTurno) {
      setForm({
        paciente_id: editingTurno.paciente_id,
        medico_id: editingTurno.medico_id,
        fecha: editingTurno.inicio.split("T")[0],
        horario: editingTurno.inicio.split("T")[1].slice(0,5),
        duracion_min: editingTurno.duracion,
        estado_turno_id: editingTurno.estado_id,
        motivo: editingTurno.motivo,
        observaciones: editingTurno.observaciones
      });
      setShowForm(true);
      setTouched({});
      setErrors({});
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingTurno]);

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

    const payload = {
      paciente_id: Number(form.paciente_id),
      medico_id: Number(form.medico_id),
      fecha_hora: `${form.fecha}T${form.horario}`,
      duracion_min: Number(form.duracion_min),
      estado_turno_id: Number(form.estado_turno_id),
      motivo: form.motivo,
      observaciones: form.observaciones
    };

    const endpoint = isEdit
      ? `${API_BASE}/api/turnos/${editingTurno.id}`
      : `${API_BASE}/api/turnos`;

    const method = isEdit ? "PUT" : "POST";

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
    <div className="d-flex flex-column align-items-center w-100" style={{ maxWidth: "520px" }}>
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
        <div className="card shadow border-0 rounded-4 p-4">

          {alert && (
            <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"}`}>
              {alert.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* PACIENTE */}
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className={`form-select ${
                      touched.paciente_id && errors.paciente_id ? "is-invalid" : ""
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

              {/* MÉDICO */}
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className={`form-select ${
                      touched.medico_id && errors.medico_id ? "is-invalid" : ""
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

              {/* FECHA */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="date"
                    name="fecha"
                    className={`form-control ${
                      touched.fecha && errors.fecha ? "is-invalid" : ""
                    }`}
                    value={form.fecha}
                    onChange={handleChange}
                    onBlur={() => markTouched("fecha")}
                  />
                  <label>Fecha</label>
                  <div className="invalid-feedback">{errors.fecha}</div>
                </div>
              </div>

              {/* HORARIO */}
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className={`form-select ${
                      touched.horario && errors.horario ? "is-invalid" : ""
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

              {/* ESTADO */}
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className={`form-select ${
                      touched.estado_turno_id && errors.estado_turno_id ? "is-invalid" : ""
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

              {/* MOTIVO */}
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

              {/* OBSERVACIONES */}
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
