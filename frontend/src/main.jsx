import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Paciente from './componentes/pacientes/pacientesForms.jsx';
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Paciente />
  </StrictMode>,
)
