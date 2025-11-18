export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: 'url("/img/Clinica-medica.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Overlay oscuro para resaltar el texto */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      ></div>

      {/* Contenido encima del overlay */}
      <div style={{ position: "relative", color: "white", textAlign: "center" }}>
        <h1 className="fw-bold">Bienvenido al Turnero Médico</h1>
        <p className="fs-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
          Gestioná pacientes, médicos, especialidades y recetas desde un solo
          lugar.
        </p>
      </div>
    </div>
  );
}
