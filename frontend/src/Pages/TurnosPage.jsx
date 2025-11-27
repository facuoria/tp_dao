import { useState } from "react";
import TurnosForm from "../componentes/turnos/turnosForm.jsx";
import TurnosTabla from "../componentes/turnos/turnosTabla.jsx";

export default function TurnosPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [editingTurno, setEditingTurno] = useState(null);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestion de Turnos</h1>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-4">
          <TurnosForm
            onSuccess={() => setReloadKey(k => k + 1)}
            editingTurno={editingTurno}
            onCancelEdit={() => setEditingTurno(null)}
          />
        </div>

        <div className="col-12 col-lg-8">
          <TurnosTabla reloadKey={reloadKey} onEdit={setEditingTurno} />
        </div>
      </div>
    </div>
  );
}
