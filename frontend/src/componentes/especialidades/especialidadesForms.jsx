import { useState, useMemo } from "react";
import { API_BASE } from "../../api.js";
import EspecialidadTable from "./especialidadesTabla.jsx";

const EMPTY_FORM = {
  nombre: "",
};

export default function EspecialidadForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  // --------- VALIDACIÓN ----------
  const isFormValid = useMemo(() => {
    return form.nombre.trim().length >= 3 && !submitting;
  }, [form.nombre, submitting]);

  function validate() {
    const e = {};
    const nombre = form.nombre.trim();

    if (!nombre) {
      e.nombre = "El nombre es obligatorio.";
    } else if (nombre.length < 3) {
      e.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleChange(eLike) {
    const { name, value } = eLike.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setAlert(null);
  }

  // ---------- SUBMIT ----------
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
        let msg = "No se pudo guardar la especialidad.";
        try {
          const json = await res.json();
          msg = json.detail || json.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const payload = await res.json().catch(() => ({}));
      const id = payload.id ?? "";

      setAlert({
        ok: true,
        text: `Especialidad creada correctamente${id ? ` (ID ${id})` : ""}.`,
      });

      setForm(EMPTY_FORM);
      setTouched({});
      setErrors({});
      setReloadKey((k) => k + 1); // recargar tabla
    } catch (err) {
      setAlert({
        ok: false,
        text:
          err instanceof Error
            ? err.message
            : "Error al guardar la especialidad.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const nombreInvalid = touched.nombre && errors.nombre;

  // ---------- RENDER ----------
  return (
    <div className="d-flex justify-content-center align-items-start gap-5 mt-4">
      {/* BOTÓN + FORM DESLIZABLE */}
      <div className="text-center">
        <button
          type="button"
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Cerrar formulario" : "Registrar Especialidad"}
        </button>

        {/* FORM QUE APARECE DESDE LA IZQUIERDA */}
        <div className={`slide-left mt-4 ${showForm ? "show" : ""}`}>
          <div
            className="card shadow border-0 rounded-4"
            style={{ width: "380px" }}
          >
            <div className="card-header text-center bg-white border-0">
              <h2 className="h5 fw-bold mb-1">Registrar Especialidad</h2>
              <p className="text-muted small mb-0">
                Ingresá el nombre de la especialidad médica.
              </p>
            </div>

            <div className="card-body">
              {alert && (
                <div
                  className={`alert ${
                    alert.ok ? "alert-success" : "alert-danger"
                  } alert-dismissible fade show`}
                  role="alert"
                >
                  {alert.text}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setAlert(null)}
                  />
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="d-flex flex-column gap-3"
              >
                <div className="form-floating">
                  <input
                    name="nombre"
                    id="nombre"
                    className={`form-control rounded-3 ${
                      nombreInvalid
                        ? "is-invalid"
                        : touched.nombre && !errors.nombre
                        ? "is-valid"
                        : ""
                    }`}
                    placeholder="Cardiología"
                    value={form.nombre}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(
                        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                        ""
                      );
                      handleChange({
                        target: { name: "nombre", value: onlyLetters },
                      });
                    }}
                    onBlur={() => markTouched("nombre")}
                  />
                  <label htmlFor="nombre">Nombre *</label>
                  {nombreInvalid && (
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
      </div>

      {/* TABLA A LA DERECHA (SE MUEVE CON LA MISMA ANIMACIÓN QUE MÉDICOS) */}
      <div
        className={`table-wrapper ${
          showForm ? "shift-right" : "shift-center"
        }`}
        style={{ width: "600px" }}
      >
        <EspecialidadTable reloadKey={reloadKey} />
      </div>
    </div>
  );
}
