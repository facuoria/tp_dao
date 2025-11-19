import { useEffect, useState } from "react";
import TurnosTable from "./turnosTabla.jsx";

export default function TurnoForm() {
  // -------- FORM REGISTRO --------

  const EMPTY_FORM = {
    paciente_id: "",
    medico_id: "",
    fecha: "",
    duracion_min: "30",
    horario: "",
    estado_turno_id: "",
    motivo: "",
    observaciones: "",
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [alert, setAlert] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // -------- FORM EDICIÓN --------
  const [editingTurno, setEditingTurno] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingClosing, setEditingClosing] = useState(false);
  const [editEstado, setEditEstado] = useState("");
  const [editHorario, setEditHorario] = useState("");
  const [editHorariosDisponibles, setEditHorariosDisponibles] = useState([]);

  // -------- FLAG REFRESH TABLA --------
  const [refreshFlag, setRefreshFlag] = useState(0);

  // -------- CARGAR LISTAS --------

  useEffect(() => {
    fetch("http://localhost:8000/api/pacientes").then(r => r.json()).then(setPacientes);
    fetch("http://localhost:8000/api/medicos").then(r => r.json()).then(setMedicos);
    fetch("http://localhost:8000/api/estados").then(r => r.json()).then(setEstados);
  }, []);

  // -------- GENERAR HORARIOS --------

  const generarHorarios = (duracion) => {
    const lista = [];
    const start = 10 * 60;
    const end = 20 * 60;

    duracion = Number(duracion);
    if (!duracion || duracion <= 0) return [];

    for (let min = start; min <= end; min += duracion) {
      const h = String(Math.floor(min / 60)).padStart(2, "0");
      const m = String(min % 60).padStart(2, "0");
      lista.push(`${h}:${m}`);
    }
    return lista;
  };

  useEffect(() => {
    if (form.fecha && form.duracion_min) {
      setHorarios(generarHorarios(form.duracion_min));
      setForm({ ...form, horario: "" });
    }
  }, [form.fecha, form.duracion_min]);

  // -------- FORMATEAR FECHA --------

  const formatoFechaHumano = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // -------- HANDLERS REGISTRO --------

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -------- SUBMIT REGISTRO --------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    if (!form.horario) {
      setAlert({ ok: false, text: "Debes seleccionar un horario" });
      setSubmitting(false);
      return;
    }

    const fechaCompleta = `${form.fecha}T${form.horario}`;

    const body = {
      paciente_id: Number(form.paciente_id),
      medico_id: Number(form.medico_id),
      fecha_hora: fechaCompleta,
      duracion_min: Number(form.duracion_min),
      estado_turno_id: Number(form.estado_turno_id),
      motivo: form.motivo,
      observaciones: form.observaciones,
    };

    try {
      const res = await fetch("http://localhost:8000/api/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail);
      }

      setAlert({ ok: true, text: "Turno registrado con éxito" });
      setForm(EMPTY_FORM);

      // 🔄 actualizar tabla
      setRefreshFlag(prev => prev + 1);
    } catch (err) {
      setAlert({ ok: false, text: err.message });
    }

    setSubmitting(false);
  };

  // -------- ABRIR EDICIÓN --------

  const handleEdit = (turno) => {
    setShowForm(false); // cerrar formulario de registro

    setEditingTurno(turno);
    setEditEstado("");
    setEditHorario("");

    setEditHorariosDisponibles(generarHorarios(turno.duracion));

    setShowEditForm(true);
  };

  // -------- CANCELAR ANIMADO --------

  const cancelarEdicion = () => {
    setEditingClosing(true);

    setTimeout(() => {
      setEditingClosing(false);
      setShowEditForm(false);
      setEditingTurno(null);
      setEditEstado("");
      setEditHorario("");
    }, 450);
  };

  // -------- SUBMIT EDICIÓN --------

  const submitEdicion = async () => {
    if (!editEstado) {
      alert("Selecciona un estado");
      return;
    }

    const payload = {
      estado_turno_id: Number(editEstado),
    };

    // REPROGRAMADO (id = 5)
    if (Number(editEstado) === 5) {
      if (!editHorario) {
        alert("Selecciona un horario nuevo");
        return;
      }
      const fechaOrg = editingTurno.inicio.split("T")[0];
      payload.fecha_hora = `${fechaOrg}T${editHorario}`;
    }

    await fetch(`http://localhost:8000/api/turnos/${editingTurno.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 🔄 refrescar tabla
    setRefreshFlag(prev => prev + 1);

    cancelarEdicion();
  };

  // -------- RENDER --------

  return (
    <div className="d-flex justify-content-center align-items-start gap-5 mt-4">

      {/* -------- FORM REGISTRO -------- */}
      <div className="text-center">

        {/* ocultar el botón si estamos editando */}
        {!showEditForm && (
          <button
            className="btn btn-primary btn-lg px-4"
            onClick={() => {
              setShowForm(!showForm);
              setShowEditForm(false); // cerrar edicion si está abierta
            }}
          >
            {showForm ? "Cerrar formulario" : "Registrar Turno"}
          </button>
        )}

        <div className={`slide-left mt-4 ${showForm ? "show" : ""}`}>
          <div className="card shadow border-0 rounded-4" style={{ width: "420px" }}>
            <div className="card-header text-center bg-white border-0">
              <h2 className="h5 fw-bold">Registrar Turno</h2>
              <p className="text-muted small">Complete los datos del turno.</p>
            </div>

            <div className="card-body">

              {alert && (
                <div className={`alert ${alert.ok ? "alert-success" : "alert-danger"}`}>
                  {alert.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">

                {/* PACIENTE */}
                <div className="form-floating">
                  <select
                    className="form-select"
                    name="paciente_id"
                    value={form.paciente_id}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.dni} - {p.nombre} {p.apellido}
                      </option>
                    ))}
                  </select>
                  <label>Paciente</label>
                </div>

                {/* MÉDICO */}
                <div className="form-floating">
                  <select
                    className="form-select"
                    name="medico_id"
                    value={form.medico_id}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {medicos.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} {m.apellido} - Mat: {m.matricula}
                      </option>
                    ))}
                  </select>
                  <label>Médico</label>
                </div>

                {/* FECHA */}
                <div className="form-floating">
                  <input
                    type="date"
                    className="form-control"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                  />
                  <label>Fecha</label>
                </div>

                {form.fecha && (
                  <small className="text-muted ms-1">
                    {formatoFechaHumano(form.fecha)}
                  </small>
                )}

                {/* DURACIÓN */}
                <div className="form-floating">
                  <input
                    type="number"
                    className="form-control"
                    name="duracion_min"
                    min="5"
                    step="5"
                    value={form.duracion_min}
                    onChange={handleChange}
                  />
                  <label>Duración (min)</label>
                </div>

                {/* HORARIO */}
                <div className="form-floating">
                  <select
                    className="form-select"
                    name="horario"
                    value={form.horario}
                    onChange={handleChange}
                    disabled={!form.fecha}
                  >
                    <option value="">Seleccionar horario...</option>
                    {horarios.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <label>Horario disponible</label>
                </div>

                {/* ESTADO */}
                <div className="form-floating">
                  <select
                    className="form-select"
                    name="estado_turno_id"
                    value={form.estado_turno_id}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {estados.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                  <label>Estado del turno</label>
                </div>

                {/* MOTIVO */}
                <div className="form-floating">
                  <input
                    className="form-control"
                    name="motivo"
                    value={form.motivo}
                    onChange={handleChange}
                    placeholder="Motivo"
                  />
                  <label>Motivo</label>
                </div>

                {/* OBSERVACIONES */}
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    name="observaciones"
                    style={{ height: "80px" }}
                    value={form.observaciones}
                    onChange={handleChange}
                  ></textarea>
                  <label>Observaciones</label>
                </div>

                <button className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar Turno"}
                </button>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* -------- FORM EDICIÓN -------- */}
      <div className={`slide-left mt-4 ${showEditForm ? "show" : ""} ${editingClosing ? "closing" : ""}`}>
        {showEditForm && (
          <div className="card shadow border-0 rounded-4" style={{ width: "420px" }}>
            <div className="card-header text-center bg-white border-0">
              <h2 className="h5 fw-bold">Editar Turno</h2>
              {editingTurno && (
                <p className="text-muted small mb-0">
                  Turno #{editingTurno.id} – {editingTurno.paciente_nombre} {editingTurno.paciente_apellido}
                </p>
              )}
            </div>

            <div className="card-body d-flex flex-column gap-3">

              {/* ESTADO */}
              <div className="form-floating">
                <select
                  className="form-select"
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {estados.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
                <label>Nuevo Estado</label>
              </div>

              {/* REPROGRAMADO (id 5) */}
              {Number(editEstado) === 5 && (
                <div className="form-floating">
                  <select
                    className="form-select"
                    value={editHorario}
                    onChange={(e) => setEditHorario(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {editHorariosDisponibles.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <label>Nuevo horario</label>
                </div>
              )}

              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-secondary w-50" onClick={cancelarEdicion}>
                  Cancelar
                </button>
                <button className="btn btn-primary w-50" onClick={submitEdicion}>
                  Guardar
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* -------- TABLA -------- */}
      <TurnosTable onEdit={handleEdit} refresh={refreshFlag} />

    </div>
  );
}
