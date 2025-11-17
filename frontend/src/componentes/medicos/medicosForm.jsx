import { useEffect, useState } from "react";
import MedicoTable from "./medicosTabla.jsx";

export default function MedicoForm() {
  const EMPTY_FORM = {
    nombre: "",
    apellido: "",
    matricula: "",
    mail: "",
    especialidad: "",
    especialidad_id: ""
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Animaciones del form
  const [showForm, setShowForm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Dropdown de especialidades
  const [especialidades, setEspecialidades] = useState([]);

  // ======================= VALIDACION ========================
  const validate = () => {
    const newErr = {};
    if (!form.nombre.trim()) newErr.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) newErr.apellido = "El apellido es obligatorio";

    if (!/^\d+$/.test(form.matricula))
      newErr.matricula = "Solo números";

    if (!form.especialidad_id)
      newErr.especialidad_id = "Elegí una especialidad";

    return newErr;
  };

  useEffect(() => {
    setErrors(validate());
  }, [form]);

  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const markTouched = (f) =>
    setTouched({ ...touched, [f]: true });

  // ======================= CARGAR ESPECIALIDADES ========================
  useEffect(() => {
    fetch("http://localhost:8000/api/especialidades")
      .then((r) => r.json())
      .then(setEspecialidades);
  }, []);

  // ======================= SUBMIT ========================
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
      } else {
        const data = await res.json();
        setAlert({ ok: false, text: data.detail || "Error" });
      }
    } catch {
      setAlert({ ok: false, text: "Error de conexión" });
    }

    setSubmitting(false);
  };

  // ===================== ANIMACION DEL FORM =====================
  const toggleForm = () => {
    if (showForm) {
      setIsClosing(true);

      setTimeout(() => {
        setIsClosing(false);
        setShowForm(false);
      }, 400);
    } else {
      setShowForm(true);
    }
  };

  // =============================================================
  // ======================= RETURN COMPLETO =====================
  // =============================================================
  return (
    <div className="d-flex flex-column flex-md-row justify-content-center align-items-start gap-5 mt-4">

      {/* BOTÓN + FORM */}
      <div className="text-center" style={{ position: "relative", top: "50px" }}>

        <button
          className="btn btn-primary btn-lg px-4"
          onClick={toggleForm}
        >
          {showForm ? "Cerrar formulario" : "Registrar Médico"}
        </button>

        {/* FORM ANIMADO */}
        <div className={`slide-left mt-4 ${showForm ? "show" : ""} ${isClosing ? "closing" : ""}`}>

          <div className="card shadow border-0 rounded-4" style={{ width: "380px" }}>
            <div className="card-header text-center bg-white border-0">
              <h2 className="h5 fw-bold">Registrar Médico</h2>
              <p className="text-muted small">Complete los datos del médico.</p>
            </div>

            <div className="card-body">

              {alert && (
                <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"}`}>
                  {alert.text}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="d-flex flex-column gap-3">

                {/* Nombre */}
                <div className="form-floating">
                  <input
                    name="nombre"
                    id="nombre"
                    className={`form-control ${touched.nombre && errors.nombre ? "is-invalid" : ""}`}
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                      handleChange({ target: { name: "nombre", value: onlyLetters } });
                    }}
                    onBlur={() => markTouched("nombre")}
                  />
                  <label>Nombre</label>
                  <div className="invalid-feedback">{errors.nombre}</div>
                </div>

                {/* Apellido */}
                <div className="form-floating">
                  <input
                    name="apellido"
                    className={`form-control ${touched.apellido && errors.apellido ? "is-invalid" : ""}`}
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                      handleChange({ target: { name: "apellido", value: onlyLetters } });
                    }}
                    onBlur={() => markTouched("apellido")}
                  />
                  <label>Apellido</label>
                  <div className="invalid-feedback">{errors.apellido}</div>
                </div>

                {/* Matrícula */}
                <div className="form-floating">
                  <input
                    name="matricula"
                    className={`form-control ${touched.matricula && errors.matricula ? "is-invalid" : ""}`}
                    placeholder="1234"
                    value={form.matricula}
                    onChange={(e) => {
                      const nums = e.target.value.replace(/\D/g, "");
                      handleChange({ target: { name: "matricula", value: nums } });
                    }}
                    onBlur={() => markTouched("matricula")}
                  />
                  <label>Matrícula</label>
                  <div className="invalid-feedback">{errors.matricula}</div>
                </div>

                {/* Email */}
                <div className="form-floating">
                  <input
                    type="email"
                    name="mail"
                    className="form-control"
                    placeholder="correo@ejemplo.com"
                    value={form.mail}
                    onChange={handleChange}
                  />
                  <label>Email</label>
                </div>

                {/* Especialidad */}
                <div className="form-floating">
                  <select
                    name="especialidad_id"
                    className={`form-select ${touched.especialidad_id && errors.especialidad_id ? "is-invalid" : ""}`}
                    value={form.especialidad_id}
                    onChange={handleChange}
                    onBlur={() => markTouched("especialidad_id")}
                  >
                    <option value="">Seleccionar...</option>
                    {especialidades.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                  <label>Especialidad</label>
                  <div className="invalid-feedback">{errors.especialidad_id}</div>
                </div>

                <button
                  className="btn btn-primary w-100"
                  disabled={!isFormValid || submitting}
                >
                  {submitting ? "Guardando..." : "Guardar Médico"}
                </button>

              </form>

            </div>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div style={{ position: "relative", top: "50px" }}>
        <MedicoTable />
      </div>

    </div>
  );
}
