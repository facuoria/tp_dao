import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import PacienteForm from "./componentes/pacientes/pacientesForms.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PacienteForm />
  </StrictMode>
);
