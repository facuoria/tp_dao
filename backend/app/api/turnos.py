import mysql.connector
from fastapi import APIRouter, HTTPException

from app.core.email import email_service
from app.crud.medico_crud import get_medico_by_id
from app.crud.paciente_crud import get_paciente_by_id
from app.crud.turno_crud import actualizar_turno, crear_turno, eliminar_turno, list_estados, list_turnos
from app.schemas.turno_schema import TurnoCreate, TurnoUpdate
from app.utils.helpers import parse_datetime_value
from app.utils.validators import require_int

router = APIRouter(prefix="/api", tags=["Turnos"])


@router.get("/turnos")
def listar_turnos_api():
    return list_turnos()


@router.post("/turnos", status_code=201)
async def crear_turno_api(body: TurnoCreate):
    paciente_id = require_int(body.paciente_id, "paciente_id", "El paciente es obligatorio", "El paciente debe ser numerico")
    medico_id = require_int(body.medico_id, "medico_id", "El medico es obligatorio", "El medico debe ser numerico")
    estado_id = require_int(body.estado_turno_id, "estado_turno_id", "El estado del turno es obligatorio", "El estado debe ser numerico")
    duracion_min = require_int(body.duracion_min, "duracion_min", "La duracion es obligatoria", "La duracion debe ser numerica")

    if not body.fecha_hora:
        raise HTTPException(status_code=400, detail="La fecha y hora son obligatorias")

    try:
        fecha_dt = parse_datetime_value(body.fecha_hora)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    try:
        new_id = crear_turno(
            paciente_id,
            medico_id,
            fecha_dt,
            duracion_min,
            estado_id,
            body.motivo or "",
            body.observaciones or "",
        )
        # Enviar email de confirmacion
        try:
            paciente = get_paciente_by_id(paciente_id)
            medico = get_medico_by_id(medico_id)
            
            if paciente and medico and paciente.get("mail"):
                await email_service.send_appointment_confirmation_email(
                    email_to=paciente["mail"],
                    paciente_nombre=paciente["nombre"],
                    medico_nombre=medico["nombre"],
                    medico_apellido=medico["apellido"],
                    medico_matricula=medico["matricula"],
                    fecha=fecha_dt.strftime("%d/%m/%Y"),
                    hora=fecha_dt.strftime("%H:%M")
                )
        except Exception as e:
            print(f"Error enviando email: {e}")

        return {"id": new_id}

    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))

    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail="Error de base de datos") from e


@router.delete("/turnos/{turno_id}", status_code=204)
def borrar_turno_api(turno_id: int):
    borradas = eliminar_turno(turno_id)

    if borradas == 0:
        raise HTTPException(
            status_code=400,
            detail="El turno no existe o no está en estado 'cancelado_medico' o 'cancelado_paciente'.",
        )

    return


@router.put("/turnos/{turno_id}")
def actualizar_turno_api(turno_id: int, body: TurnoUpdate):
    nuevo_estado = require_int(
        body.estado_turno_id,
        "estado_turno_id",
        "El estado es obligatorio",
        "El estado debe ser numerico",
    )
    nueva_fecha = body.fecha_hora

    if nuevo_estado == 4 and not nueva_fecha:
        raise HTTPException(status_code=400, detail="La nueva fecha es obligatoria para reprogramar.")

    fecha_normalizada = None
    if nueva_fecha:
        try:
            fecha_normalizada = parse_datetime_value(nueva_fecha).strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha/hora invalido.")

    actualizadas = actualizar_turno(turno_id, nuevo_estado, fecha_normalizada)
    if actualizadas == 0:
        raise HTTPException(status_code=404, detail="Turno no encontrado")

    return {"detail": "Turno actualizado correctamente"}


@router.get("/estados")
def listar_estados_api():
    return list_estados()
