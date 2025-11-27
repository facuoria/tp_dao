import { useEffect, useState } from "react";
import { API_BASE } from "../../api";

export default function AgendasForm({ onSuccess }) {
  const EMPTY_FORM = {
    medico_id: "",
    dia_semana: "",
    hora_inicio: "",
    hora_fin: "",
    duracion_min: "",
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [medicos, setMedicos] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [agendaLoading, setAgendaLoading] = useState(false);

  const toMinutes = (t) => {
    const [hh = "0", mm = "0"] = String(t || "").split(":");
    return Number(hh) * 60 + Number(mm);
  };

  // ---- validar ----
  const validate = () => {
    const e = {};

    if (!form.medico_id) e.medico_id = "Debe seleccionar un médico";
    if (form.dia_semana === "") e.dia_semana = "Seleccione un día";
    if (!form.hora_inicio) e.hora_inicio = "Seleccione hora de inicio";
    if (!form.hora_fin) e.hora_fin = "Seleccione hora de fin";

    if (form.hora_inicio && form.hora_fin) {
      if (form.hora_fin <= form.hora_inicio)
        e.hora_fin = "La hora fin debe ser mayor que inicio";
    }

    if (!form.duracion_min || form.duracion_min <= 0)
      e.duracion_min = "Duración inválida";

    if (
      form.medico_id &&
      form.dia_semana !== "" &&
      form.hora_inicio &&
      form.hora_fin &&
      agenda.length
    ) {
      const start = toMinutes(form.hora_inicio);
      const end = toMinutes(form.hora_fin);
      const conflict = agenda
        .filter((a) => a.dia_semana === Number(form.dia_semana))
        .find(
          (a) => start < toMinutes(a.hora_fin) && end > toMinutes(a.hora_inicio)
        );
      if (conflict) {
        e.hora_inicio = `El m\u00e9dico ya tiene una franja de ${conflict.hora_inicio} a ${conflict.hora_fin}`;
      }
    }

    return e;
  };

  useEffect(() => {
    setErrors(validate());
  }, [form, agenda]);

  const isValid = Object.keys(errors).length === 0;

  const markTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAlert(null);
  };

  // ---- cargar médicos ----
  useEffect(() => {
    fetch(`${API_BASE}/api/medicos`)
      .then((r) => r.json())
      .then(setMedicos)
      .catch(() => {});
  }, []);

  // ---- cargar agenda del médico seleccionado ----
  useEffect(() => {
    if (!form.medico_id) {
      setAgenda([]);
      return;
    }
    setAgendaLoading(true);
    fetch(`${API_BASE}/api/agenda?medico_id=${form.medico_id}`)
      .then((r) => r.json())
      .then((rows) => setAgenda(rows || []))
      .catch(() => setAgenda([]))
      .finally(() => setAgendaLoading(false));
  }, [form.medico_id]);

  // ---- submit ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/agenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 200 || res.status === 201) {
        setAlert({ ok: true, text: "Agenda registrada" });
        setForm(EMPTY_FORM);
        setTouched({});
        setAgenda([]);
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        setAlert({ ok: false, text: data.detail || "Error" });
      }
    } catch {
      setAlert({ ok: false, text: "Error de conexión" });
    }

    setSubmitting(false);
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cerrar formulario" : "Crear Agenda"}
        </button>
      </div>

      {showForm && (
        <div
          className="card shadow-lg border-0 rounded-4 p-4 mx-auto"
          style={{ maxWidth: "700px" }}
        >
          {alert && (
            <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"}`}>
              {alert.text}
            </div>
          )}

          <form className="row g-3" onSubmit={handleSubmit}>
            {/* Médico */}
            <div className="col-12">
              <div className="form-floating">
                <select
                  name="medico_id"
                  className={`form-select ${
                    touched.medico_id && errors.medico_id ? "is-invalid" : ""
                  }`}
                  value={form.medico_id}
                  onChange={handleChange}
                  onBlur={() => markTouched("medico_id")}
                >
                  <option value="">Seleccionar...</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} {m.apellido}
                    </option>
                  ))}
                </select>
                <label>Médico {agendaLoading && "(cargando agenda...)"}</label>

                <div className="invalid-feedback">{errors.medico_id}</div>
              </div>
            </div>

            {/* Día de la semana */}
            <div className="col-md-6">
              <div className="form-floating">
                <select
                  name="dia_semana"
                  className={`form-select ${
                    touched.dia_semana && errors.dia_semana ? "is-invalid" : ""
                  }`}
                  value={form.dia_semana}
                  onChange={handleChange}
                  onBlur={() => markTouched("dia_semana")}
                >
                  <option value="">Día...</option>
                  <option value="0">Lunes</option>
                  <option value="1">Martes</option>
                  <option value="2">Miércoles</option>
                  <option value="3">Jueves</option>
                  <option value="4">Viernes</option>
                  <option value="5">Sábado</option>
                  <option value="6">Domingo</option>
                </select>
                <label>Día de la semana</label>
                <div className="invalid-feedback">{errors.dia_semana}</div>
              </div>
            </div>

            {/* Hora Inicio */}
            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="time"
                  name="hora_inicio"
                  className={`form-control ${
                    touched.hora_inicio && errors.hora_inicio ? "is-invalid" : ""
                  }`}
                  value={form.hora_inicio}
                  onChange={handleChange}
                  onBlur={() => markTouched("hora_inicio")}
                />
                <label>Hora inicio</label>
                <div className="invalid-feedback">{errors.hora_inicio}</div>
              </div>
            </div>

            {/* Hora Fin */}
            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="time"
                  name="hora_fin"
                  className={`form-control ${
                    touched.hora_fin && errors.hora_fin ? "is-invalid" : ""
                  }`}
                  value={form.hora_fin}
                  onChange={handleChange}
                  onBlur={() => markTouched("hora_fin")}
                />
                <label>Hora fin</label>
                <div className="invalid-feedback">{errors.hora_fin}</div>
              </div>
            </div>

            {/* Duración */}
            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="number"
                  name="duracion_min"
                  className={`form-control ${
                    touched.duracion_min && errors.duracion_min ? "is-invalid" : ""
                  }`}
                  value={form.duracion_min}
                  onChange={handleChange}
                  onBlur={() => markTouched("duracion_min")}
                />
                <label>Duración (min)</label>
                <div className="invalid-feedback">{errors.duracion_min}</div>
              </div>
            </div>

            <div className="col-12 d-flex gap-2 mt-3">
              <button className="btn btn-primary flex-grow-1" disabled={!isValid || submitting}>
                {submitting ? "Guardando..." : "Guardar Agenda"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setForm(EMPTY_FORM)}
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
