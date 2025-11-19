import PacientesForms from "../componentes/pacientes/pacientesForms.jsx";
import PacientesTabla from "../componentes/pacientes/pacientesTabla.jsx";
import { useState } from "react";

export default function PacientesPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Gestión de Pacientes</h1>

      {/* FORMULARIO */}
      <PacientesForms onSuccess={() => setReloadKey(k => k + 1)} />

      {/* TABLA */}
      <PacientesTabla reloadKey={reloadKey} />
    </div>
  );
}
