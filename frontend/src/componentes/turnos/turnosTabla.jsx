import { useEffect, useState } from "react";

export default function TurnosTable({ onEdit, refresh }) {
  const [turnos, setTurnos] = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    cargarTurnos();
    cargarEstados();
  }, [refresh]);

  const cargarTurnos = async () => {
    const r = await fetch("http://localhost:8000/api/turnos");
    const data = await r.json();
    setTurnos(data);
  };

  const cargarEstados = async () => {
    const r = await fetch("http://localhost:8000/api/estados");
    const data = await r.json();
    setEstados(data);
  };

  const borrarTurno = async (id) => {
    const seguro = window.confirm("¿Seguro que deseas eliminar este turno?");
    if (!seguro) return;

    await fetch(`http://localhost:8000/api/turnos/${id}`, { method: "DELETE" });
    cargarTurnos();
  };

  return (
    <div className="table-responsive mt-4">
      <table className="table table-striped table-hover shadow-sm">
        <thead className="table-primary">
          <tr>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Inicio</th>
            <th>Duración</th>
            <th>Estado</th>
            <th>Motivo</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {turnos.map((t) => {
            const estaCancelado = t.estado === "Cancelado";

            return (
              <tr key={t.id}>
                <td>{t.paciente_nombre} {t.paciente_apellido}</td>
                <td>
                  {t.medico_nombre} {t.medico_apellido} (M {t.medico_matricula})
                </td>
                <td>{t.inicio.replace("T", " ")}</td>
                <td>{t.duracion} min</td>
                <td>{t.estado}</td>
                <td>{t.motivo}</td>

                <td>
                  {/* EDITAR */}
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => onEdit(t)}
                  >
                    Editar
                  </button>

                  {/* BORRAR → solo habilitado si está Cancelado */}
                  <button
                    className={`btn btn-sm ${
                      estaCancelado ? "btn-danger" : "btn-outline-danger"
                    }`}
                    disabled={!estaCancelado}
                    onClick={() => {
                      if (estaCancelado) borrarTurno(t.id);
                    }}
                    title={
                      estaCancelado
                        ? "Eliminar turno cancelado"
                        : "Solo se pueden borrar turnos en estado Cancelado"
                    }
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>

      </table>
    </div>
  );
}
