import { useState } from "react";
import { API_BASE } from "../../api.js";
import EspecialidadTable from "./especialidadesTabla.jsx";

const EMPTY_FORM = { nombre: "" };

export default function EspecialidadForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // ---------------- VALIDACIÓN ----------------
  const nombreInvalid =
    touched.nombre && (!form.nombre || form.nombre.trim().length < 2);

  const validate = () => {
    const e = {};
    if (!form.nombre || form.nombre.trim().length < 2)
      e.nombre = "El nombre debe tener al menos 2 caracteres.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAlert(null);
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/especialidades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.nombre }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al crear especialidad");
      }

      setAlert({ ok: true, text: "Especialidad creada correctamente" });
      setForm(EMPTY_FORM);
      setTouched({});
      setErrors({});
      setReloadKey((k) => k + 1);
    } catch (err) {
      setAlert({ ok: false, text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <div className="container py-4">
    
    {/* BOTÓN */}
    <div className="text-center mb-4">
      <button
        className="btn btn-primary btn-lg rounded-3 px-4"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cerrar formulario" : "Registrar Especialidad"}
      </button>
    </div>

    {/* CONTENEDOR FLEXIBLE */}
    <div className="d-flex justify-content-center position-relative">

      {/* FORMULARIO DESLIZANDO DESDE LA IZQUIERDA */}
      <div
        className={`slide-side ${showForm ? "show" : ""}`}
        style={{ width: "350px", marginRight: "20px" }}
      >
        {/* CARD DEL FORM */}
        <div className="card shadow-lg border-0 rounded-4 mb-4">
          <div className="card-header bg-white border-0 text-center pt-4 pb-2">
            <h1 className="h4 fw-bold">Registrar Especialidad</h1>
            <p className="text-muted small mb-0">
              Ingresá el nombre de la especialidad médica.
            </p>
          </div>

          <div className="card-body px-4 pb-4">
            {/* ALERTA */}
            {alert && (
              <div
                className={`alert ${
                  alert.ok ? "alert-success" : "alert-danger"
                } alert-dismissible fade show`}
              >
                {alert.text}
                <button className="btn-close" onClick={() => setAlert(null)} />
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-floating mb-3">
                <input
                  name="nombre"
                  id="nombre"
                  className={`form-control rounded-3 ${
                    nombreInvalid ? "is-invalid" : touched.nombre ? "is-valid" : ""
                  }`}
                  placeholder="Cardiología"
                  value={form.nombre}
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(
                      /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+/g,
                      ""
                    );
                    handleChange({ target: { name: "nombre", value: onlyLetters } });
                  }}
                  onBlur={() => setTouched({ ...touched, nombre: true })}
                />
                <label htmlFor="nombre">Nombre *</label>
                {nombreInvalid && (
                  <div className="invalid-feedback">{errors.nombre}</div>
                )}
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary rounded-3 flex-grow-1"
                >
                  {submitting ? "Guardando..." : "Guardar"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-3"
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setTouched({});
                    setErrors({});
                    setAlert(null);
                  }}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* TABLA — se mueve cuando el form está visible */}
      <div
        className={`table-wrapper ${showForm ? "shift-right" : "shift-center"}`}
        style={{ width: "600px", position: "absolute", right: "25%" }}
      >
        <EspecialidadTable reloadKey={reloadKey} />
      </div>

    </div>
  </div>
);
}
