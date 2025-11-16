from fastapi import APIRouter, HTTPException
from app.core.db import fetch_all, fetch_one, execute
from app.dto.especialidad import EspecialidadCreate, EspecialidadOut

router = APIRouter(prefix="/especialidades", tags=["Especialidades"])

@router.get("", response_model=list[EspecialidadOut])
def list_especialidades():
    return fetch_all("SELECT id, nombre FROM especialidades ORDER BY nombre")

@router.post("", response_model=EspecialidadOut, status_code=201)
def create_especialidad(body: EspecialidadCreate):
    dup = fetch_one("SELECT COUNT(*) AS c FROM especialidades WHERE nombre=%s", (body.nombre,))["c"]
    if dup: raise HTTPException(409, "Nombre duplicado")
    new_id = execute("INSERT INTO especialidades (nombre) VALUES (%s)", (body.nombre,))
    return {"id": new_id, "nombre": body.nombre}
