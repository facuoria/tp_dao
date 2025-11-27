from app.core.email import email_service
from app.core.events import event_bus
from app.crud.medico_crud import get_medico_by_id
from app.crud.paciente_crud import get_paciente_by_id


async def _on_paciente_creado(payload: dict | None) -> None:
    if not payload:
        return
    mail = payload.get("mail")
    nombre = payload.get("nombre") or ""
    if mail:
        await email_service.send_welcome_email(mail, nombre)


async def _on_turno_creado(payload: dict | None) -> None:
    if not payload:
        return
    paciente_id = payload.get("paciente_id")
    medico_id = payload.get("medico_id")
    fecha = payload.get("fecha")
    hora = payload.get("hora")

    if paciente_id is None or medico_id is None or fecha is None or hora is None:
        return

    paciente = get_paciente_by_id(paciente_id)
    medico = get_medico_by_id(medico_id)

    if paciente and medico and paciente.get("mail"):
        await email_service.send_appointment_confirmation_email(
            email_to=paciente["mail"],
            paciente_nombre=paciente["nombre"],
            medico_nombre=medico["nombre"],
            medico_apellido=medico["apellido"],
            medico_matricula=medico["matricula"],
            fecha=fecha,
            hora=hora,
        )


# Registro de observadores
event_bus.subscribe("paciente_creado", _on_paciente_creado)
event_bus.subscribe("turno_creado", _on_turno_creado)
