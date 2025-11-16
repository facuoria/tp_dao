import { useMemo, useState } from "react";
import { API_BASE } from "../../api.js";
import PacienteTable from "./pacientesTabla.jsx";

const EMPTY_FORM = {
  dni: "",
  nombre: "",
  apellido: "",
  mail: "",
  telefono: "",
  fecha_nacimiento: "",
};

export default function PacienteForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // ----------------------------
  // VALIDACIONES
  // ----------------------------
  const isValidDni = useMemo(
    () => form.dni.trim() !== "" && !isNaN(Number(form.dni)),
    [form.dni]
  );

  const isFormValid = useMemo(() => {
    return (
      isValidDni &&
      form.nombre.trim().length >= 2 &&
      form.apellido.trim().length >= 2 &&
      !submitting
    );
  }, [isValidDni, form.nombre, form.apellido, submitting]);

  function validate() {
    const e = {};
    if (!isValidDni) e.dni = "Ingresá un DNI numérico válido.";
    if (form.nombre.trim().length < 2)
      e.nombre = "El nombre debe tener al menos 2 caracteres.";
    if (form.apellido.trim().length < 2)
      e.apellido = "El apellido debe tener al menos 2 caracteres.";
    if (form.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail))
      e.mail = "Ingresá un correo válido.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ----------------------------
  // HANDLERS
  // ----------------------------
  function markTouched(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setAlert(null);
  }

  // ----------------------------
  // ENVÍO (VALIDACIÓN DE DNI SOLO ACA)
  // ----------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setAlert(null);

    try {
      const res = await fetch(`${API_BASE}/api/pacientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dni: Number(form.dni),
          fecha_nacimiento: form.fecha_nacimiento || null,
        }),
      });

      if (!res.ok) {
        let msg = "No se pudo guardar el paciente.";
        try {
          const json = await res.json();
          msg = json.detail || json.message || msg; // mensaje del backend (DNI duplicado)
        } catch (_) {}
        throw new Error(msg);
      }

      const payload = await res.json().catch(() => ({}));
      const id = payload.id ?? "";

      setAlert({
        ok: true,
        text: `Paciente creado correctamente${id ? ` (ID ${id})` : ""}.`,
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
            : "Ocurrió un error al guardar el paciente.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const dniInvalid = touched.dni && errors.dni;
  const nombreInvalid = touched.nombre && errors.nombre;
  const apellidoInvalid = touched.apellido && errors.apellido;
  const mailInvalid = touched.mail && errors.mail;

  // ----------------------------
  // RENDER
  // ----------------------------
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-start py-4 w-50"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        margin: "0 auto",
      }}
    >
      <div className="container" style={{ maxWidth: 2000 }}>
        {/* FORMULARIO */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-0 pt-4 pb-0">
            <h1 className="h5 mb-1">Registrar paciente</h1>
            <p className="text-muted small mb-3">
              Completá los datos y presioná <strong>"Guardar paciente"</strong>{" "}
              para insertarlo en la base de datos.
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

            <form onSubmit={handleSubmit} noValidate>
              {/* DNI */}
              <div className="form-floating mb-3">
                <input
                  id="dni"
                  name="dni"
                  className={`form-control ${
                    dniInvalid
                      ? "is-invalid"
                      : touched.dni && !errors.dni
                      ? "is-valid"
                      : ""
                  }`}
                  placeholder="12345678"
                  inputMode="numeric"
                  value={form.dni}
                  onChange={handleChange}
                  onBlur={() => markTouched("dni")}
                />
                <label htmlFor="dni">DNI *</label>
                {dniInvalid && (
                  <div className="invalid-feedback">{errors.dni}</div>
                )}
              </div>

              {/* Nombre */}
              <div className="form-floating mb-3">
                <input
                  id="nombre"
                  name="nombre"
                  className={`form-control ${
                    nombreInvalid
                      ? "is-invalid"
                      : touched.nombre && !errors.nombre
                      ? "is-valid"
                      : ""
                  }`}
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={() => markTouched("nombre")}
                />
                <label htmlFor="nombre">Nombre</label>
                {nombreInvalid && (
                  <div className="invalid-feedback">{errors.nombre}</div>
                )}
              </div>

              {/* Apellido */}
              <div className="form-floating mb-3">
                <input
                  id="apellido"
                  name="apellido"
                  className={`form-control ${
                    apellidoInvalid
                      ? "is-invalid"
                      : touched.apellido && !errors.apellido
                      ? "is-valid"
                      : ""
                  }`}
                  placeholder="Apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  onBlur={() => markTouched("apellido")}
                />
                <label htmlFor="apellido">Apellido</label>
                {apellidoInvalid && (
                  <div className="invalid-feedback">{errors.apellido}</div>
                )}
              </div>

              {/* Mail */}
              <div className="form-floating mb-3">
                <input
                  id="mail"
                  type="email"
                  name="mail"
                  className={`form-control ${
                    mailInvalid
                      ? "is-invalid"
                      : touched.mail && !errors.mail
                      ? "is-valid"
                      : ""
                  }`}
                  placeholder="correo@ejemplo.com"
                  value={form.mail}
                  onChange={handleChange}
                  onBlur={() => markTouched("mail")}
                />
                <label htmlFor="mail">Correo electrónico</label>
                {mailInvalid && (
                  <div className="invalid-feedback">{errors.mail}</div>
                )}
              </div>

              {/* Teléfono */}
              <div className="form-floating mb-3">
                <input
                  id="telefono"
                  name="telefono"
                  className="form-control"
                  placeholder="+54 351 ..."
                  value={form.telefono}
                  onChange={handleChange}
                />
                <label htmlFor="telefono">Teléfono</label>
              </div>

              {/* Fecha */}
              <div className="form-floating mb-3">
                <input
                  id="fecha_nacimiento"
                  type="date"
                  name="fecha_nacimiento"
                  className="form-control"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                />
                <label htmlFor="fecha_nacimiento">
                  Fecha de nacimiento
                </label>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  type="submit"
                  className="btn btn-dark flex-grow-1"
                  disabled={!isFormValid}
                >
                  {submitting ? "Guardando..." : "Guardar paciente"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
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

              <p className="form-text text-muted mt-2">
                Los campos marcados con * son obligatorios.
              </p>
            </form>
          </div>
        </div>

        {/* TABLA DE PACIENTES */}
        <PacienteTable reloadKey={reloadKey} />
      </div>
    </div>
  );
}
