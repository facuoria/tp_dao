from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api import agendas, especialidades, medicos, pacientes, recetas, turnos

app = FastAPI(title="API TURNOS MEDICOS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/api/health")
def health():
    return {"ok": True}


app.include_router(pacientes.router)
app.include_router(medicos.router)
app.include_router(especialidades.router)
app.include_router(agendas.router)
app.include_router(turnos.router)
app.include_router(recetas.router)
