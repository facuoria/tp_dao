import mysql.connector
from fastapi import APIRouter, HTTPException

from app.crud.agenda_crud import create_agenda, delete_agenda, list_agenda, update_agenda
from app.schemas.agenda_schema import AgendaCreate, AgendaUpdate
from app.utils.validators import require_int

router = APIRouter(prefix="/api/agenda", tags=["Agenda"])


@router.get("")
def listar_agenda_api(medico_id: int | None = None):
    return list_agenda(medico_id=medico_id)


@router.post("", status_code=201)
def crear_agenda_api(body: AgendaCreate):
    medico_id = require_int(body.medico_id, "medico_id", "El medico es obligatorio", "El id del medico debe ser numerico")
    dia_semana = require_int(body.dia_semana, "dia_semana", "El dia de la semana es obligatorio", "El dia de la semana debe ser numerico")
    duracion_min = require_int(body.duracion_min, "duracion_min", "La duracion es obligatoria", "La duracion debe ser numerica")

    try:
        new_id = create_agenda(
            medico_id,
            dia_semana,
            body.hora_inicio,
            body.hora_fin,
            duracion_min,
        )
        return {"id": new_id}
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al crear agenda")


@router.delete("/{agenda_id}", status_code=204)
def borrar_agenda_api(agenda_id: int):
    try:
        borradas = delete_agenda(agenda_id)
        if borradas == 0:
            raise HTTPException(status_code=404, detail="Agenda no encontrada")
        return
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al borrar agenda")


@router.put("/{agenda_id}", status_code=204)
def actualizar_agenda_api(agenda_id: int, body: AgendaUpdate):
    medico_id = require_int(body.medico_id, "medico_id", "El medico es obligatorio", "El id del medico debe ser numerico")
    dia_semana = require_int(body.dia_semana, "dia_semana", "El dia de la semana es obligatorio", "El dia de la semana debe ser numerico")
    duracion_min = require_int(body.duracion_min, "duracion_min", "La duracion es obligatoria", "La duracion debe ser numerica")

    try:
        actualizadas = update_agenda(
            agenda_id,
            medico_id,
            dia_semana,
            body.hora_inicio,
            body.hora_fin,
            duracion_min,
        )
        if actualizadas == 0:
            raise HTTPException(status_code=404, detail="Agenda no encontrada")
        return
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al actualizar agenda")
