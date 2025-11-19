import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./componentes/navbar/Navbar"; // si esto existe
import Home from "./Pages/Home";
import PacientesPage from "./Pages/PacientesPage";
import MedicosPage from "./Pages/MedicosPage";
import EspecialidadesPage from "./Pages/EspecialidadesPage";
import RecetasPage from "./Pages/RecetasPage";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/medicos" element={<MedicosPage />} />
        <Route path="/especialidades" element={<EspecialidadesPage />} />
        <Route path="/recetas" element={<RecetasPage />} />
      </Routes>
    </Router>
  );
}

export default App;
