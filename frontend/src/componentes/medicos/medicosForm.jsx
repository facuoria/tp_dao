import { useEffect, useState } from "react";
import { API_BASE } from "../../api.js";

export default function MedicoForm({ onSuccess, editingMedico, onCancelEdit }) {
  const EMPTY_FORM = {
    nombre: "",
    apellido: "",
    matricula: "",
    mail: "",
    especialidad_id: ""
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [showForm, setShowForm] = useState(true);

  const isEdit = Boolean(editingMedico?.id);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) e.apellido = "El apellido es obligatorio";
    if (!/^\d+$/.test(form.matricula)) e.matricula = "La matrícula debe ser numérica";
    if (!form.especialidad_id) e.especialidad_id = "Elegí una especialidad";
    return e;
  };

  useEffect(() => {
    setErrors(validate());
  }, [form]);

  useEffect(() => {
    fetch(`${API_BASE}/api/especialidades`)
      .then((r) => r.json())
      .then(setEspecialidades)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editingMedico) {
      setForm({
        nombre: editingMedico.nombre ?? "",
        apellido: editingMedico.apellido ?? "",
        matricula: editingMedico.matricula ? String(editingMedico.matricula) : "",
        mail: editingMedico.mail ?? "",
        especialidad_id: editingMedico.especialidad_id ?? editingMedico.especialidades_id ?? editingMedico.especialidades ?? ""
      });
      setTouched({});
      setErrors({});
      setAlert(null);
      setShowForm(true);
    } else {
      setForm(EMPTY_FORM);
      setTouched({});
      setErrors({});
    }
  }, [editingMedico]);

  const isFormValid = Object.keys(errors).length === 0 && !submitting;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAlert(null);
  };

  const markTouched = (f) =>
    setTouched((prev) => ({ ...prev, [f]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);

    try {
      const endpoint = isEdit
        ? `${API_BASE}/api/medicos/${editingMedico.id}`
        : `${API_BASE}/api/medicos`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 201 || res.status === 200) {
        setAlert({ ok: true, text: isEdit ? "Médico actualizado" : "Médico registrado" });
        setForm(EMPTY_FORM);
        setTouched({});
        if (onSuccess) onSuccess();
        if (onCancelEdit) onCancelEdit();
      } else {
        const data = await res.json().catch(() => ({}));
        setAlert({
          ok: false,
          text: data.detail || "Error al registrar/actualizar médico",
        });
      }
    } catch {
      setAlert({ ok: false, text: "Error de conexión" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center gap-3" style={{ width: "100%", maxWidth: "520px" }}>
      <div className="text-center w-100">
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cerrar formulario" : isEdit ? "Editar Médico" : "Registrar Médico"}
        </button>
        {isEdit && (
          <div className="text-muted small mt-1">
            Editando: {editingMedico?.nombre} {editingMedico?.apellido}
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
              {/* Nombre */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    name="nombre"
                    className={`form-control ${
                      touched.nombre && errors.nombre ? "is-invalid" : ""
                    }`}
                    value={form.nombre}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^a-zA-Z áéíóúÁÉÍÓÚñÑ']/g, "");
                      handleChange({ target: { name: "nombre", value: clean } });
                    }}
                    onBlur={() => markTouched("nombre")}
                  />
                  <label>Nombre</label>
                  <div className="invalid-feedback">{errors.nombre}</div>
                </div>
              </div>

              {/* Apellido */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    name="apellido"
                    className={`form-control ${
                      touched.apellido && errors.apellido ? "is-invalid" : ""
                    }`}
                    value={form.apellido}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^a-zA-Z áéíóúÁÉÍÓÚñÑ']/g, "");
                      handleChange({ target: { name: "apellido", value: clean } });
                    }}
                    onBlur={() => markTouched("apellido")}
                  />
                  <label>Apellido</label>
                  <div className="invalid-feedback">{errors.apellido}</div>
                </div>
              </div>

              {/* Matrícula */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    name="matricula"
                    className={`form-control ${
                      touched.matricula && errors.matricula ? "is-invalid" : ""
                    }`}
                    value={form.matricula}
                    onChange={(e) => {
                      const nums = e.target.value.replace(/\D+/g, "");
                      handleChange({ target: { name: "matricula", value: nums } });
                    }}
                    onBlur={() => markTouched("matricula")}
                  />
                  <label>Matrícula</label>
                  <div className="invalid-feedback">{errors.matricula}</div>
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
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
              </div>

              {/* Especialidad */}
              <div className="col-12">
                <div className="form-floating">
                  <select
                    name="especialidad_id"
                    className={`form-select ${
                      touched.especialidad_id && errors.especialidad_id
                        ? "is-invalid"
                        : ""
                    }`}
                    value={form.especialidad_id}
                    onChange={handleChange}
                    onBlur={() => markTouched("especialidad_id")}
                  >
                    <option value="">Seleccionar...</option>
                    {especialidades.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                  <label>Especialidad</label>
                  <div className="invalid-feedback">{errors.especialidad_id}</div>
                </div>
              </div>

              {/* BOTONES */}
              <div className="col-12 d-flex gap-2 mt-3">
                <button
                  className="btn btn-primary flex-grow-1"
                  disabled={!isFormValid || submitting}
                >
                  {submitting ? "Guardando..." : isEdit ? "Actualizar Médico" : "Guardar Médico"}
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
