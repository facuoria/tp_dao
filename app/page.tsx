export default function HomePage() {
  return (
    <section className="grid gap-4">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-2">Bienvenido</h1>
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          Esta app usa <b>MSW</b> como API falsa para que puedas desarrollar el frontend
          sin backend. Navegá por las secciones para ver listados y formularios.
        </p>
      </div>
    </section>
  );
}
