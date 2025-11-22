import mysql.connector
from fastapi import APIRouter, HTTPException

from app.crud.especialidad_crud import create_especialidad, delete_especialidad, list_especialidades
from app.schemas.especialidad_schema import EspecialidadCreate
from app.utils.validators import require_value

router = APIRouter(prefix="/api/especialidades", tags=["Especialidades"])


@router.get("")
def listar_especialidades_api():
    return list_especialidades()


@router.post("", status_code=201)
def crear_especialidades_api(body: EspecialidadCreate):
    nombre = require_value(body.nombre, "nombre", "El nombre de la especialidad es obligatorio")

    try:
        new_id = create_especialidad(nombre)
        return {"id": new_id}

    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))

    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al crear especialidad")


@router.delete("/{especialidad_id}", status_code=204)
def borrar_especialidad_api(especialidad_id: int):
    try:
        borradas = delete_especialidad(especialidad_id)
        if borradas == 0:
            raise HTTPException(status_code=404, detail="Especialidad no encontrada")
        return
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al borrar especialidad")
