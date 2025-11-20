import { useState } from "react";
import TurnosForm from "../componentes/turnos/turnosForm.jsx";
import TurnosTabla from "../componentes/turnos/turnosTabla.jsx";

export default function TurnosPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [editingTurno, setEditingTurno] = useState(null);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestión de Turnos</h1>

      <div className="d-flex flex-wrap gap-4 align-items-start justify-content-center">
        {/* === COLUMNA IZQUIERDA: FORMULARIOS === */}
        <div className="forms-column" style={{ maxWidth: "520px" }}>
          <TurnosForm
            onSuccess={() => setReloadKey(k => k + 1)}
            editingTurno={editingTurno}
            onCancelEdit={() => setEditingTurno(null)}
          />
        </div>

        {/* === COLUMNA DERECHA: TABLA === */}
        <div className="table-column" style={{ flexGrow: 1, minWidth: "420px", maxWidth: "960px" }}>
          <TurnosTabla reloadKey={reloadKey} onEdit={setEditingTurno} />
        </div>
      </div>
    </div>
  );
}
