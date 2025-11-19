import { useState } from "react";
import MedicosForm from "../componentes/medicos/medicosForm.jsx";
import MedicosTabla from "../componentes/medicos/medicosTabla.jsx";

export default function MedicosPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [editingMedico, setEditingMedico] = useState(null);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestión de Médicos</h1>

      <div className="d-flex flex-wrap gap-4 align-items-start justify-content-center">
        <div className="d-flex flex-column align-items-center" style={{ maxWidth: "520px" }}>
          <MedicosForm
            onSuccess={() => setReloadKey((k) => k + 1)}
            editingMedico={editingMedico}
            onCancelEdit={() => setEditingMedico(null)}
          />
        </div>

        <div className="flex-grow-1" style={{ minWidth: "420px", maxWidth: "960px" }}>
          <MedicosTabla reloadKey={reloadKey} onEdit={setEditingMedico} />
        </div>
      </div>
    </div>
  );
}
