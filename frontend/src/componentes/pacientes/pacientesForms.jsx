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
  const [showForm, setShowForm] = useState(false);

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
  const today = new Date().toISOString().split("T")[0];
  // ----------------------------
  // RENDER
  // ----------------------------
  return (
  <div className="container py-5">
    <div className="row justify-content-center">
      <div className="col-12 col-md-10 col-lg-8 col-xl-7">

        {/* BOTÓN PARA MOSTRAR/OCULTAR FORM */}
        <div className="text-center mb-4">
          <button
            className="btn btn-primary btn-lg px-4 py-2 rounded-3 shadow-sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cerrar formulario" : "Registrar Paciente"}
          </button>
        </div>

        {/* FORMULARIO CON ANIMACIÓN */}
        <div className={`slide-down ${showForm ? "show" : ""}`}>
          <div className="card border-0 shadow-lg rounded-4 mb-4">
            <div className="card-header bg-white border-0 text-center pt-4 pb-2">
              <h1 className="h4 mb-1 fw-bold">Registrar paciente</h1>
              <p className="text-muted small mb-0">
                Completá los datos y presioná <strong>"Guardar paciente"</strong>.
              </p>
            </div>

            <div className="card-body px-4 pb-4">
              {alert && (
                <div
                  className={`alert ${
                    alert.ok ? "alert-success" : "alert-danger"
                  } alert-dismissible fade show`}
                >
                  {alert.text}
                  <button
                    className="btn-close"
                    onClick={() => setAlert(null)}
                  />
                </div>
              )}

              {/* FORMULARIO (solo 1 form, no anidar) */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">

                  {/* DNI */}
                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        id="dni"
                        name="dni"
                        type="text"
                        className={`form-control rounded-3 ${
                          dniInvalid
                            ? "is-invalid"
                            : touched.dni && !errors.dni
                            ? "is-valid"
                            : ""
                        }`}
                        placeholder="12345678"
                        inputMode="numeric"
                        value={form.dni}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D+/g, "");
                          handleChange({ target: { name: "dni", value: onlyNums } });
                        }}
                      />
                      <label htmlFor="dni">DNI *</label>
                      {dniInvalid && (
                        <div className="invalid-feedback">{errors.dni}</div>
                      )}
                    </div>
                  </div>

                  {/* NOMBRE */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        id="nombre"
                        name="nombre"
                        className={`form-control rounded-3 ${
                          nombreInvalid
                            ? "is-invalid"
                            : touched.nombre && !errors.nombre
                            ? "is-valid"
                            : ""
                        }`}
                        placeholder="Nombre"
                        value={form.nombre}
                        onChange={(e) => {
                          const onlyLetters =
                            e.target.value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+/g, "");
                          handleChange({
                            target: { name: "nombre", value: onlyLetters },
                          });
                        }}
                      />
                      <label htmlFor="nombre">Nombre</label>
                      {nombreInvalid && (
                        <div className="invalid-feedback">{errors.nombre}</div>
                      )}
                    </div>
                  </div>

                  {/* APELLIDO */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        id="apellido"
                        name="apellido"
                        className={`form-control rounded-3 ${
                          apellidoInvalid
                            ? "is-invalid"
                            : touched.apellido && !errors.apellido
                            ? "is-valid"
                            : ""
                        }`}
                        placeholder="Apellido"
                        value={form.apellido}
                        onChange={(e) => {
                          const onlyLetters =
                            e.target.value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+/g, "");
                          handleChange({
                            target: { name: "apellido", value: onlyLetters },
                          });
                        }}
                      />
                      <label htmlFor="apellido">Apellido</label>
                      {apellidoInvalid && (
                        <div className="invalid-feedback">{errors.apellido}</div>
                      )}
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        id="mail"
                        type="email"
                        name="mail"
                        className={`form-control rounded-3 ${
                          mailInvalid
                            ? "is-invalid"
                            : touched.mail && !errors.mail
                            ? "is-valid"
                            : ""
                        }`}
                        placeholder="correo@ejemplo.com"
                        value={form.mail}
                        onChange={handleChange}
                      />
                      <label htmlFor="mail">Correo electrónico</label>
                      {mailInvalid && (
                        <div className="invalid-feedback">{errors.mail}</div>
                      )}
                    </div>
                  </div>

                  {/* TELEFONO */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        id="telefono"
                        name="telefono"
                        type="text"
                        className="form-control rounded-3"
                        placeholder="3515288730"
                        value={form.telefono}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D+/g, "");
                          handleChange({
                            target: { name: "telefono", value: onlyNums },
                          });
                        }}
                      />
                      <label htmlFor="telefono">Teléfono</label>
                    </div>
                  </div>

                  {/* FECHA */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        id="fecha_nacimiento"
                        type="date"
                        name="fecha_nacimiento"
                        className="form-control rounded-3"
                        value={form.fecha_nacimiento}
                        max={today}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v && v > today) return;
                          handleChange(e);
                        }}
                      />
                      <label htmlFor="fecha_nacimiento">
                        Fecha de nacimiento
                      </label>
                    </div>
                  </div>

                  {/* BOTONES */}
                  <div className="col-12 d-flex flex-column flex-sm-row gap-2 mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg rounded-3 flex-grow-1"
                      disabled={!isFormValid}
                    >
                      {submitting ? "Guardando..." : "Guardar paciente"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg rounded-3"
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

                </div>
              </form>
            </div>
          </div>
        </div>

        {/* TABLA (siempre visible) */}
        <PacienteTable reloadKey={reloadKey} />

      </div>
    </div>
  </div>
);
}
