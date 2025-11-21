import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../api.js";

const EMPTY_FORM = {
  turno_id: "",
  medico_id: "",
  paciente_id: "",
  indicaciones: "",
};

export default function RecetasForm({ onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [turnosAtendidos, setTurnosAtendidos] = useState([]);

  // =====================================================
  // Cargar turnos + pacientes + médicos (solo front)
  // =====================================================
  async function loadTurnos() {
    const [turnosRes, pacientesRes, medicosRes] = await Promise.all([
      fetch(`${API_BASE}/api/turnos`).then(r => r.json()),
      fetch(`${API_BASE}/api/pacientes`).then(r => r.json()),
      fetch(`${API_BASE}/api/medicos`).then(r => r.json()),
    ]);

    // Diccionario: dni → ID paciente
    const pacientesPorDNI = Object.fromEntries(
      pacientesRes.map(p => [String(p.dni), p.id])
    );

    // Diccionario: "nombre apellido" → ID médico
    const medicosPorNombre = Object.fromEntries(
      medicosRes.map(m => [
        `${m.nombre} ${m.apellido}`.toLowerCase(),
        m.id,
      ])
    );

    // Enriquecer turnos: agregar IDs correctos
    const enriched = turnosRes
      .filter(t => t.estado === "atendido") // SOLO atendidos
      .map(t => ({
        ...t,
        paciente_id: pacientesPorDNI[String(t.paciente_dni)],
        medico_id: medicosPorNombre[
          `${t.medico_nombre} ${t.medico_apellido}`.toLowerCase()
        ],
      }));

    setTurnosAtendidos(enriched);
  }

  useEffect(() => {
    loadTurnos();
  }, []);

  // =====================================================
  // Validaciones
  // =====================================================
  const isValidTurno = useMemo(
    () => form.turno_id !== "",
    [form.turno_id]
  );

  const isFormValid = useMemo(() => {
    return (
      isValidTurno &&
      form.indicaciones.trim().length >= 3 &&
      form.medico_id &&
      form.paciente_id &&
      !submitting
    );
  }, [isValidTurno, form.indicaciones, form.medico_id, form.paciente_id, submitting]);

  function validate() {
    const e = {};
    if (!isValidTurno) e.turno_id = "Seleccioná un turno válido.";
    if (form.indicaciones.trim().length < 3)
      e.indicaciones = "Las indicaciones deben tener al menos 3 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // =====================================================
  // Handlers
  // =====================================================
  function markTouched(field) {
    setTouched(t => ({ ...t, [field]: true }));
  }

  function handleTurnoSelect(e) {
    const turnoId = Number(e.target.value);
    const turno = turnosAtendidos.find(t => t.id === turnoId);

    setForm(prev => ({
      ...prev,
      turno_id: turnoId,
      medico_id: turno?.medico_id || "",
      paciente_id: turno?.paciente_id || "",
    }));

    setAlert(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setAlert(null);
  }

  // =====================================================
  // Submit
  // =====================================================
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setAlert(null);

    try {
      const turno = turnosAtendidos.find(t => t.id === Number(form.turno_id));
      if (!turno) throw new Error("Turno inexistente.");

      const body = {
        turno_id: turno.id,
        medico_id: turno.medico_id,
        paciente_id: turno.paciente_id,
        indicaciones: form.indicaciones,
      };

      const res = await fetch(`${API_BASE}/api/recetas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "No se pudo crear la receta.");
      }

      setAlert({ ok: true, text: "Receta creada correctamente." });

      setForm(EMPTY_FORM);
      setTouched({});
      setErrors({});
      onSuccess?.();
    } catch (err) {
      setAlert({ ok: false, text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // Render
  // =====================================================
  return (
    <div className="d-flex flex-column align-items-center gap-3 w-100">

      {/* Botón abrir/cerrar */}
      <div className="text-center w-100">
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cerrar formulario" : "Crear Receta"}
        </button>
      </div>

      {/* Formulario */}
      <div className={`slide-left w-100 ${showForm ? "show" : ""}`}>
        <div className="card p-4 shadow border-0 rounded-4">

          {/* Alertas */}
          {alert && (
            <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"} rounded-3`}>
              {alert.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* SELECT TURNOS */}
              <div className="col-12">
                <div className="form-floating">
                  <select
                    name="turno_id"
                    className="form-control"
                    value={form.turno_id}
                    onChange={handleTurnoSelect}
                    onBlur={() => markTouched("turno_id")}
                  >
                    <option value="">
                      Seleccione un turno atendido…
                    </option>

                    {turnosAtendidos.map(t => (
                      <option key={t.id} value={t.id}>
                        #{t.id} — {t.paciente_nombre} {t.paciente_apellido} —{" "}
                        {t.medico_nombre} {t.medico_apellido} — {t.inicio}
                      </option>
                    ))}
                  </select>
                  <label>Turno * (solo atendidos)</label>
                </div>

                {touched.turno_id && errors.turno_id && (
                  <div className="text-danger small mt-1">{errors.turno_id}</div>
                )}
              </div>

              {/* INFO AUTOMÁTICA */}
              {form.turno_id && (
                <div className="col-12">
                  <strong>Paciente:</strong>{" "}
                  {
                    turnosAtendidos.find(t => t.id === Number(form.turno_id))
                      ?.paciente_nombre
                  }{" "}
                  {
                    turnosAtendidos.find(t => t.id === Number(form.turno_id))
                      ?.paciente_apellido
                  }
                  {" — "}
                  <strong>Médico:</strong>{" "}
                  {
                    turnosAtendidos.find(t => t.id === Number(form.turno_id))
                      ?.medico_nombre
                  }{" "}
                  {
                    turnosAtendidos.find(t => t.id === Number(form.turno_id))
                      ?.medico_apellido
                  }
                </div>
              )}

              {/* CAMPOS OCULTOS */}
              <input type="hidden" name="medico_id" value={form.medico_id} />
              <input type="hidden" name="paciente_id" value={form.paciente_id} />

              {/* INDICACIONES */}
              <div className="col-12">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    name="indicaciones"
                    rows="3"
                    value={form.indicaciones}
                    onChange={handleChange}
                    onBlur={() => markTouched("indicaciones")}
                  />
                  <label>Indicaciones *</label>
                </div>
                {touched.indicaciones && errors.indicaciones && (
                  <div className="text-danger small mt-1">
                    {errors.indicaciones}
                  </div>
                )}
              </div>

              {/* BOTÓN GUARDAR */}
              <div className="col-12 mt-2">
                <button
                  className="btn btn-primary w-100"
                  disabled={!isFormValid || submitting}
                >
                  {submitting ? "Creando..." : "Crear receta"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
