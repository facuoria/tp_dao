import { useState } from "react";
import MedicosForm from "../componentes/medicos/medicosForm.jsx";
import MedicosTabla from "../componentes/medicos/medicosTabla.jsx";

export default function MedicosPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [editingMedico, setEditingMedico] = useState(null);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestion de Medicos</h1>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-4">
          <MedicosForm
            onSuccess={() => setReloadKey((k) => k + 1)}
            editingMedico={editingMedico}
            onCancelEdit={() => setEditingMedico(null)}
          />
        </div>

        <div className="col-12 col-lg-8">
          <MedicosTabla reloadKey={reloadKey} onEdit={setEditingMedico} />
        </div>
      </div>
    </div>
  );
}
