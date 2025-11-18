import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Especialidades from "./componentes/especialidades/especialidadesForms.jsx";
import Pacientes from "./componentes/pacientes/pacientesForms.jsx";
import Medicos from "./componentes/medicos/medicosForm.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Especialidades />
  </StrictMode>
);
