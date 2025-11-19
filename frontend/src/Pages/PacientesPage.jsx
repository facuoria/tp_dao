import { useState } from "react";
import PacientesForms from "../componentes/pacientes/pacientesForms.jsx";
import PacientesTabla from "../componentes/pacientes/pacientesTabla.jsx";

export default function PacientesPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [editingPaciente, setEditingPaciente] = useState(null);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestión de Pacientes</h1>

      <div className="d-flex flex-wrap gap-4 align-items-start justify-content-center">
        <div className="d-flex flex-column align-items-center" style={{ maxWidth: "520px" }}>
          <PacientesForms
            onSuccess={() => setReloadKey((k) => k + 1)}
            editingPaciente={editingPaciente}
            onCancelEdit={() => setEditingPaciente(null)}
          />
        </div>

        <div className="flex-grow-1" style={{ minWidth: "420px", maxWidth: "960px" }}>
          <PacientesTabla reloadKey={reloadKey} onEdit={setEditingPaciente} />
        </div>
      </div>
    </div>
  );
}
