import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../api.js";

const EMPTY_FORM = {
  dni: "",
  nombre: "",
  apellido: "",
  mail: "",
  telefono: "",
  fecha_nacimiento: "",
};

export default function PacienteForm({ onSuccess, editingPaciente, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const isEdit = Boolean(editingPaciente?.id);

  useEffect(() => {
    if (editingPaciente) {
      setForm({
        dni: String(editingPaciente.dni ?? ""),
        nombre: editingPaciente.nombre ?? "",
        apellido: editingPaciente.apellido ?? "",
        mail: editingPaciente.mail ?? "",
        telefono: editingPaciente.telefono ?? "",
        fecha_nacimiento: editingPaciente.fecha_nacimiento
          ? editingPaciente.fecha_nacimiento.slice(0, 10)
          : "",
      });
      setTouched({});
      setErrors({});
      setShowForm(true);
      setAlert(null);
    } else {
      setForm(EMPTY_FORM);
      setTouched({});
      setErrors({});
    }
  }, [editingPaciente]);

  // ----------------------------
  // VALIDACIONES
  // ----------------------------
  const isValidDni = useMemo(
    () => /^\d{7,10}$/.test(form.dni.trim()),
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
  // ENVÍO DEL FORM
  // ----------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setAlert(null);

    try {
      const endpoint = isEdit
        ? `${API_BASE}/api/pacientes/${editingPaciente.id}`
        : `${API_BASE}/api/pacientes`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
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
          msg = json.detail || json.message || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      setAlert({
        ok: true,
        text: isEdit ? "Paciente actualizado correctamente." : "Paciente creado correctamente.",
      });

      setForm(EMPTY_FORM);
      setTouched({});
      setErrors({});

      if (onSuccess) onSuccess();
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      setAlert({
        ok: false,
        text: err.message ?? "Ocurrió un error al guardar el paciente.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="d-flex flex-column align-items-center gap-3" style={{ width: "100%", maxWidth: "520px" }}>
      <div className="text-center w-100">
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cerrar formulario" : isEdit ? "Editar Paciente" : "Registrar Paciente"}
        </button>
        {isEdit && (
          <div className="text-muted small mt-1">Editando: {editingPaciente?.nombre} {editingPaciente?.apellido}</div>
        )}
      </div>

      <div className="w-100" style={{ display: showForm ? "block" : "none" }}>
        <div className="card shadow border-0 rounded-4 p-4" style={{ width: "100%" }}>
          {/* ALERTAS */}
          {alert && (
            <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"} rounded-3`}>
              {alert.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* DNI */}
              <div className="col-12">
                <div className="form-floating">
                  <input
                    className="form-control"
                    name="dni"
                    value={form.dni}
                    onChange={(e) => {
                      const nums = e.target.value.replace(/\D+/g, "");
                      handleChange({ target: { name: "dni", value: nums } });
                    }}
                    onBlur={() => markTouched("dni")}
                  />
                  <label>DNI *</label>
                </div>
                {touched.dni && errors.dni && (
                  <div className="text-danger small mt-1">{errors.dni}</div>
                )}
              </div>

              {/* NOMBRE */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    className="form-control"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    onBlur={() => markTouched("nombre")}
                  />
                  <label>Nombre *</label>
                </div>
                {touched.nombre && errors.nombre && (
                  <div className="text-danger small mt-1">{errors.nombre}</div>
                )}
              </div>

              {/* APELLIDO */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    className="form-control"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    onBlur={() => markTouched("apellido")}
                  />
                  <label>Apellido *</label>
                </div>
                {touched.apellido && errors.apellido && (
                  <div className="text-danger small mt-1">{errors.apellido}</div>
                )}
              </div>

              {/* EMAIL */}
              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="email"
                    name="mail"
                    className="form-control"
                    value={form.mail}
                    onChange={handleChange}
                  />
                  <label>Email</label>
                </div>
                {errors.mail && (
                  <div className="text-danger small mt-1">{errors.mail}</div>
                )}
              </div>

              {/* TELEFONO */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    name="telefono"
                    className="form-control"
                    value={form.telefono}
                    onChange={handleChange}
                  />
                  <label>Teléfono</label>
                </div>
              </div>

              {/* FECHA */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    className="form-control"
                    value={form.fecha_nacimiento}
                    max={today}
                    onChange={handleChange}
                  />
                  <label>Fecha nacimiento</label>
                </div>
              </div>

              {/* BOTONES */}
              <div className="col-12 d-flex gap-2 mt-3">
                <button className="btn btn-primary flex-grow-1" disabled={!isFormValid || submitting}>
                  {submitting ? "Guardando..." : isEdit ? "Actualizar paciente" : "Guardar paciente"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setTouched({});
                    setErrors({});
                    onCancelEdit && onCancelEdit();
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


