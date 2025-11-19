import { useState, useMemo } from "react";
import { API_BASE } from "../../api.js";

const EMPTY_FORM = { nombre: "" };

export default function EspecialidadesForm({ onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const isFormValid = useMemo(() => {
    return form.nombre.trim().length >= 3 && !submitting;
  }, [form.nombre, submitting]);

  function validate() {
    const e = {};
    const nombre = form.nombre.trim();

    if (!nombre) {
      e.nombre = "El nombre es obligatorio.";
    } else if (nombre.length < 3) {
      e.nombre = "Debe tener al menos 3 caracteres.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const markTouched = (f) => setTouched((prev) => ({ ...prev, [f]: true }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setAlert(null);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setAlert(null);

    try {
      const res = await fetch(`${API_BASE}/api/especialidades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.nombre.trim() }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.detail || "Error al guardar.");
      }

      const data = await res.json().catch(() => ({}));

      setAlert({ ok: true, text: `Especialidad creada (ID ${data.id})` });

      setForm(EMPTY_FORM);
      setTouched({});
      setErrors({});

      if (onSuccess) onSuccess();
    } catch (err) {
      setAlert({ ok: false, text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const invalidNombre = touched.nombre && errors.nombre;

  return (
    <div className="d-flex flex-column align-items-center gap-3" style={{ width: "100%", maxWidth: "480px" }}>
      <div className="text-center w-100">
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cerrar formulario" : "Registrar Especialidad"}
        </button>
      </div>

      <div className={`slide-left w-100 ${showForm ? "show" : ""}`}>
        <div className="card shadow-lg border-0 rounded-4 p-4" style={{ width: "100%" }}>
          {alert && (
            <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"}`}>
              {alert.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">

            <div className="form-floating">
              <input
                name="nombre"
                id="nombre"
                className={`form-control rounded-3 ${
                  invalidNombre ? "is-invalid" : ""
                }`}
                placeholder="Traumatologia"
                value={form.nombre}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(
                    /[^a-zA-Z áéíóúÁÉÍÓÚñÑ'\s]/g,
                    ""
                  );
                  handleChange({ target: { name: "nombre", value: onlyLetters } });
                }}
                onBlur={() => markTouched("nombre")}
              />
              <label htmlFor="nombre">Nombre *</label>

              {invalidNombre && (
                <div className="invalid-feedback">{errors.nombre}</div>
              )}
            </div>

            <div className="d-flex gap-2 mt-2">
              <button
                type="submit"
                className="btn btn-primary rounded-3 flex-grow-1"
                disabled={!isFormValid || submitting}
              >
                {submitting ? "Guardando..." : "Guardar"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary rounded-3"
                disabled={submitting}
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
  );
}
