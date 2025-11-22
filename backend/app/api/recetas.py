import mysql.connector
from fastapi import APIRouter, HTTPException

from app.crud.receta_crud import borrar_receta, crear_receta, list_recetas
from app.schemas.receta_schema import RecetaCreate
from app.utils.validators import require_int

router = APIRouter(prefix="/api/recetas", tags=["Recetas"])


@router.get("")
def listar_recetas(turnoId: int | None = None, pacienteId: int | None = None, medicoId: int | None = None):
    return list_recetas(turno_id=turnoId, paciente_id=pacienteId, medico_id=medicoId)


@router.post("", status_code=201)
def crear_receta_api(body: RecetaCreate):
    turno_id = require_int(body.turno_id, "turno_id", "turno_id es obligatorio", "turno_id debe ser numerico")
    medico_id = require_int(body.medico_id, "medico_id", "medico_id es obligatorio", "medico_id debe ser numerico")
    paciente_id = require_int(body.paciente_id, "paciente_id", "paciente_id es obligatorio", "paciente_id debe ser numerico")

    try:
        receta = crear_receta(turno_id, medico_id, paciente_id, body.indicaciones or "")
        return receta
    except ValueError as ve:
        message = str(ve)
        status = 404 if "no encontrado" in message.lower() else 400
        raise HTTPException(status_code=status, detail=message)
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al crear receta")


@router.delete("/{receta_id}", status_code=204)
def borrar_receta_api(receta_id: int):
    borradas = borrar_receta(receta_id)

    if borradas == 0:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    return
