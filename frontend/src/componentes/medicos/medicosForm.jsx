import { useEffect, useState } from "react";

export default function MedicoForm({ onSuccess }) {
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

  // animación
  const [showForm, setShowForm] = useState(false);

  // ---------------- VALIDACIONES ----------------
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

  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAlert(null);
  };

  const markTouched = (f) =>
    setTouched((prev) => ({ ...prev, [f]: true }));

  // ---------- CARGAR ESPECIALIDADES ----------
  useEffect(() => {
    fetch("http://localhost:8000/api/especialidades")
      .then((r) => r.json())
      .then(setEspecialidades)
      .catch(() => {});
  }, []);

  // -------------- SUBMIT -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/api/medicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 201) {
        setAlert({ ok: true, text: "Médico registrado" });
        setForm(EMPTY_FORM);
        setTouched({});
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        setAlert({
          ok: false,
          text: data.detail || "Error al registrar médico",
        });
      }
    } catch {
      setAlert({ ok: false, text: "Error de conexión" });
    }

    setSubmitting(false);
  };

  return (
    <div className="container py-4">

      {/* BOTÓN CENTRADO */}
      <div className="text-center mb-4">
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cerrar formulario" : "Registrar Médico"}
        </button>
      </div>

      {/* FORMULARIO */}
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

          <form onSubmit={handleSubmit} className="row g-3">

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
                    const clean = e.target.value.replace(/[^a-zA-Z áéíóúÁÉÍÓÚñÑ]/g, "");
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
                    const clean = e.target.value.replace(/[^a-zA-Z áéíóúÁÉÍÓÚñÑ]/g, "");
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
                {submitting ? "Guardando..." : "Guardar Médico"}
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
