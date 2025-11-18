from fastapi import APIRouter
from app.core.db import fetch_all, fetch_one, execute
from app.dto.receta import RecetaCreate, RecetaOut

router = APIRouter(prefix="/recetas", tags=["Recetas"])

@router.get("", response_model=list[RecetaOut])
def list_recetas():
    sql = """
    SELECT id, turnos_id AS turno_id, medicos_id AS medico_id, pacientes_id AS paciente_id,
           fecha_emision, indicaciones
    FROM recetas ORDER BY id DESC
    """
    return fetch_all(sql)

@router.post("", response_model=RecetaOut, status_code=201)
def create_receta(body: RecetaCreate):
    new_id = execute(
        "INSERT INTO recetas (turnos_id, medicos_id, pacientes_id, fecha_emision, indicaciones) VALUES (%s,%s,%s,%s,%s)",
        (body.turno_id, body.medico_id, body.paciente_id, body.fecha_emision, body.indicaciones)
    )
    return fetch_one(
        "SELECT id, turnos_id AS turno_id, medicos_id AS medico_id, pacientes_id AS paciente_id, fecha_emision, indicaciones FROM recetas WHERE id=%s",
        (new_id,)
    )
