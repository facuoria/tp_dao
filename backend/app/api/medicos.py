import mysql.connector
from fastapi import APIRouter, HTTPException

from app.crud.medico_crud import create_medico, delete_medico, list_medicos, update_medico
from app.schemas.medico_schema import MedicoCreate, MedicoUpdate
from app.utils.validators import require_int

router = APIRouter(prefix="/api/medicos", tags=["Medicos"])


@router.get("")
def listar_medicos(solo_con_agenda: bool = False):
    return list_medicos(solo_con_agenda=solo_con_agenda)


@router.post("", status_code=201)
def crear_medico_api(body: MedicoCreate):
    matricula = body.matricula
    if not matricula:
        raise HTTPException(status_code=400, detail="Falta la matricula")

    especialidad_id = require_int(
        body.especialidad_id,
        "especialidad_id",
        "Falta seleccionar especialidad",
        "El id de especialidad debe ser numerico",
    )

    try:
        new_id = create_medico(
            body.nombre,
            body.apellido,
            matricula,
            body.mail,
            especialidad_id,
        )
        return {"id": new_id}

    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))

    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al crear medico")


@router.delete("/{medico_id}", status_code=204)
def borrar_medico_api(medico_id: int):
    try:
        borradas = delete_medico(medico_id)
        if borradas == 0:
            raise HTTPException(status_code=404, detail="Medico no encontrado")
        return
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al borrar medico")


@router.put("/{medico_id}")
def actualizar_medico_api(medico_id: int, body: MedicoUpdate):
    if not body.matricula:
        raise HTTPException(status_code=400, detail="Falta la matricula")

    especialidad_id = require_int(
        body.especialidad_id,
        "especialidad_id",
        "Falta seleccionar especialidad",
        "El id de especialidad debe ser numerico",
    )

    try:
        actualizadas = update_medico(
            medico_id,
            body.nombre,
            body.apellido,
            body.matricula,
            body.mail,
            especialidad_id,
        )
        if actualizadas == 0:
            raise HTTPException(status_code=404, detail="Medico no encontrado")
        return {"id": medico_id}
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar medico: {e.msg}")
