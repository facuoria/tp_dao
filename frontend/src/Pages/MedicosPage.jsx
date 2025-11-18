import { useState } from "react";
import MedicosForm from "../componentes/medicos/medicosForm.jsx";
import MedicosTabla from "../componentes/medicos/medicosTabla.jsx";

export default function MedicosPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Gestión de Médicos</h1>

      {/* FORM: cuando guarda → recarga tabla */}
      <MedicosForm onSuccess={() => setReloadKey(k => k + 1)} />

      {/* TABLA */}
      <MedicosTabla reloadKey={reloadKey} />
    </div>
  );
}
