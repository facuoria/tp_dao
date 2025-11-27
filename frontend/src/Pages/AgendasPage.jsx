import { useState } from "react";
import AgendasForm from "../componentes/agendas/agendasForms";
import AgendasTabla from "../componentes/agendas/agendasTabla";

export default function AgendasPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestion de Agendas</h1>
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-4">
          <AgendasForm onSuccess={() => setReloadKey((k) => k + 1)} />
        </div>
        <div className="col-12 col-lg-8">
          <AgendasTabla reloadKey={reloadKey} />
        </div>
      </div>
    </div>
  );
}
