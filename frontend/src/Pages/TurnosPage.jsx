import { useState } from "react";
import TurnosForm from "../componentes/turnos/turnosForm.jsx";
import TurnosTabla from "../componentes/turnos/turnosTabla.jsx";

export default function TurnosPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [editingTurno, setEditingTurno] = useState(null);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestión de Turnos</h1>

      <div 
        className="turnos-layout"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "40px",
        }}
      >

        {/* === COLUMNA IZQUIERDA: FORMULARIOS === */}
        <div className="forms-column" style={{ width: "420px", minWidth: "420px" }}>
          <TurnosForm
            onSuccess={() => setReloadKey(k => k + 1)}
            editingTurno={editingTurno}
            onCancelEdit={() => setEditingTurno(null)}
          />
        </div>

        {/* === COLUMNA DERECHA: TABLA === */}
        <div className="table-column" style={{ flexGrow: 1 }}>
          <TurnosTabla reloadKey={reloadKey} onEdit={setEditingTurno} />
        </div>

      </div>
    </div>
  );
}
