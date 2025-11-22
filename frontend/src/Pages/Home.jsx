import HospitalStats from "../componentes/reportes/HospitalStats";

export default function Home() {
  return (
    <main>
      <section
        style={{
          minHeight: "70vh",
          width: "100%",
          backgroundImage: 'url("/img/Clinica-medica.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        ></div>

        <div style={{ position: "relative", color: "white", textAlign: "center" }}>
          <p className="text-uppercase fw-semibold small mb-2">Gestion integral</p>
          <h1 className="fw-bold display-5">Bienvenido al Turnero Medico</h1>
          <p className="fs-4" style={{ maxWidth: "600px", margin: "1rem auto 0" }}>
            Gestiona pacientes, medicos, especialidades, agenda y reportes desde un solo lugar.
          </p>
        </div>
      </section>

      <HospitalStats />
    </main>
  );
}
