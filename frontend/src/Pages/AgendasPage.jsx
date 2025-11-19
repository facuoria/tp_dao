import { useState } from "react";
import AgendasForm from "../componentes/agendas/agendasForms";
import AgendasTabla from "../componentes/agendas/agendasTabla";

export default function AgendasPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="container py-4">
      <AgendasForm onSuccess={() => setReloadKey((k) => k + 1)} />
      <AgendasTabla reloadKey={reloadKey} />
    </div>
  );
}
