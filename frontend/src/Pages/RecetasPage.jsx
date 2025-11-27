import { useState } from "react";
import RecetasForm from "../componentes/recetas/RecetasForm.jsx";
import RecetasTabla from "../componentes/recetas/RecetasTabla.jsx";

export default function RecetasPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestion de Recetas</h1>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-4">
          <RecetasForm onSuccess={() => setReloadKey(k => k + 1)} />
        </div>

        <div className="col-12 col-lg-8">
          <RecetasTabla reloadKey={reloadKey} />
        </div>
      </div>
    </div>
  );
}
