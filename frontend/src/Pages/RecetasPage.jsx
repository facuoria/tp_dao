import { useState } from "react";
import RecetasForm from "../componentes/recetas/RecetasForm.jsx";
import RecetasTabla from "../componentes/recetas/RecetasTabla.jsx";

export default function RecetasPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestión de Recetas</h1>

      <div className="d-flex flex-wrap gap-4 align-items-start justify-content-center">
        
        {/* === FORMULARIO A LA IZQUIERDA === */}
        <div className="forms-column" style={{ maxWidth: "520px" }}>
          <RecetasForm
            onSuccess={() => setReloadKey(k => k + 1)}
          />
        </div>

        {/* === TABLA A LA DERECHA === */}
        <div
          className="table-column"
          style={{ flexGrow: 1, minWidth: "420px", maxWidth: "960px" }}
        >
          <RecetasTabla reloadKey={reloadKey} />
        </div>

      </div>
    </div>
  );
}
