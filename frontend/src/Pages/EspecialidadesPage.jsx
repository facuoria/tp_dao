import { useState } from "react";
import EspecialidadesForm from "../componentes/especialidades/especialidadesForms.jsx";
import EspecialidadesTabla from "../componentes/especialidades/especialidadesTabla.jsx";

export default function EspecialidadesPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestión de Especialidades</h1>

      <div className="d-flex flex-wrap gap-4 align-items-start justify-content-center">
        <div className="d-flex flex-column align-items-center" style={{ maxWidth: "480px" }}>
          <EspecialidadesForm onSuccess={() => setReloadKey((k) => k + 1)} />
        </div>

        <div className="flex-grow-1" style={{ minWidth: "380px", maxWidth: "900px" }}>
          <EspecialidadesTabla reloadKey={reloadKey} />
        </div>
      </div>
    </div>
  );
}
