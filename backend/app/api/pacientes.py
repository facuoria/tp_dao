import mysql.connector
from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.crud.paciente_crud import create_paciente, delete_paciente, list_pacientes, update_paciente
from app.schemas.paciente_schema import PacienteCreate, PacienteUpdate
from app.utils.validators import require_int
from app.core.email import email_service

router = APIRouter(prefix="/api/pacientes", tags=["Pacientes"])


@router.get("")
def listar_pacientes():
    return list_pacientes()


@router.post("", status_code=201)
def crear_paciente_api(body: PacienteCreate, background_tasks: BackgroundTasks):
    dni = require_int(body.dni, "dni", "Falta el campo obligatorio: dni", "El DNI debe ser numerico")
    fecha_nacimiento = body.fecha_nacimiento if body.fecha_nacimiento else None

    try:
        new_id = create_paciente(
            dni,
            body.nombre,
            body.apellido,
            body.mail,
            body.telefono,
            fecha_nacimiento,
        )
        background_tasks.add_task(email_service.send_welcome_email, body.mail, body.nombre)
        return {"id": new_id}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Error al crear paciente: {e.msg}")


@router.delete("/{paciente_id}", status_code=204)
def borrar_paciente_api(paciente_id: int):
    try:
        borradas = delete_paciente(paciente_id)
        if borradas == 0:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        return
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al borrar paciente")


@router.put("/{paciente_id}")
def actualizar_paciente_api(paciente_id: int, body: PacienteUpdate):
    dni = require_int(body.dni, "dni", "Falta el campo obligatorio: dni", "El DNI debe ser numerico")
    fecha_nacimiento = body.fecha_nacimiento if body.fecha_nacimiento else None

    try:
        cantidad = update_paciente(
            paciente_id,
            dni,
            body.nombre,
            body.apellido,
            body.mail,
            body.telefono,
            fecha_nacimiento,
        )
        if cantidad == 0:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        return {"id": paciente_id}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar paciente: {e.msg}")
