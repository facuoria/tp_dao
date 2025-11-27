import { useState } from "react";
import EspecialidadesForm from "../componentes/especialidades/especialidadesForms.jsx";
import EspecialidadesTabla from "../componentes/especialidades/especialidadesTabla.jsx";

export default function EspecialidadesPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestion de Especialidades</h1>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-4">
          <EspecialidadesForm onSuccess={() => setReloadKey((k) => k + 1)} />
        </div>

        <div className="col-12 col-lg-8">
          <EspecialidadesTabla reloadKey={reloadKey} />
        </div>
      </div>
    </div>
  );
}
