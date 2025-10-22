from fastapi import APIRouter, HTTPException, Query
from app.core.db import fetch_all, fetch_one, execute
from app.dto.turno import TurnoCreate, TurnoUpdate, TurnoOut, TurnoEstado
from app.services.turnos import within_schedule, overlaps, estado_id_por_nombre, nombre_estado_por_id

router = APIRouter(prefix="/turnos", tags=["Turnos"])

@router.get("", response_model=list[TurnoOut])
def list_turnos(estado: str | None = Query(None)):
    params = []
    sql = """
    SELECT t.id, t.pacientes_id AS paciente_id, t.medicos_id AS medico_id, t.fecha_hora, t.duracion_min,
           et.nombre AS estado, t.motivo, t.observaciones
    FROM turnos t
    JOIN estado_turno et ON et.id = t.estado_turno_id
    """
    if estado:
        sql += " WHERE et.nombre=%s"
        params.append(estado)
    sql += " ORDER BY t.fecha_hora DESC"
    return fetch_all(sql, tuple(params))

@router.get("/{id}", response_model=TurnoOut)
def get_turno(id: int):
    row = fetch_one(
        """SELECT t.id, t.pacientes_id AS paciente_id, t.medicos_id AS medico_id, t.fecha_hora, t.duracion_min,
                  et.nombre AS estado, t.motivo, t.observaciones
           FROM turnos t JOIN estado_turno et ON et.id=t.estado_turno_id WHERE t.id=%s""",
        (id,)
    )
    if not row: raise HTTPException(404, "Not found")
    return row

@router.post("", response_model=TurnoOut, status_code=201)
def create_turno(body: TurnoCreate):
    if not within_schedule(body.medico_id, body.fecha_hora, body.duracion_min):
        raise HTTPException(400, "Fuera de agenda del médico")
    if overlaps(body.medico_id, body.fecha_hora, body.duracion_min):
        raise HTTPException(409, "Se superpone con otro turno")
    estado_id = estado_id_por_nombre("asignado")
    new_id = execute(
        "INSERT INTO turnos (pacientes_id, medicos_id, fecha_hora, duracion_min, estado_turno_id, motivo, observaciones) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (body.paciente_id, body.medico_id, body.fecha_hora, body.duracion_min, estado_id, body.motivo, body.observaciones)
    )
    return get_turno(new_id)

@router.put("/{id}", response_model=TurnoOut)
def update_turno(id: int, body: TurnoUpdate):
    if not fetch_one("SELECT id FROM turnos WHERE id=%s", (id,)):
        raise HTTPException(404, "Not found")
    if not within_schedule(body.medico_id, body.fecha_hora, body.duracion_min):
        raise HTTPException(400, "Fuera de agenda del médico")
    if overlaps(body.medico_id, body.fecha_hora, body.duracion_min, exclude_id=id):
        raise HTTPException(409, "Se superpone con otro turno")
    execute(
        "UPDATE turnos SET pacientes_id=%s, medicos_id=%s, fecha_hora=%s, duracion_min=%s, motivo=%s, observaciones=%s WHERE id=%s",
        (body.paciente_id, body.medico_id, body.fecha_hora, body.duracion_min, body.motivo, body.observaciones, id)
    )
    return get_turno(id)

@router.patch("/{id}/estado", response_model=TurnoOut)
def cambiar_estado(id: int, body: TurnoEstado):
    if not fetch_one("SELECT id FROM turnos WHERE id=%s", (id,)):
        raise HTTPException(404, "Not found")
    estado_id = estado_id_por_nombre(body.estado)
    if not estado_id:
        raise HTTPException(400, "Estado inválido")
    execute("UPDATE turnos SET estado_turno_id=%s WHERE id=%s", (estado_id, id))
    return get_turno(id)
