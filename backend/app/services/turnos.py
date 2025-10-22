from datetime import timedelta
from mysql.connector.cursor import MySQLCursorDict
from app.core.db import fetch_all, fetch_one

CANCELADOS = {"cancelado_medico", "cancelado_paciente"}

def estado_id_por_nombre(nombre: str) -> int | None:
    row = fetch_one("SELECT id FROM estado_turno WHERE nombre=%s", (nombre,))
    return row["id"] if row else None

def nombre_estado_por_id(estado_id: int) -> str | None:
    row = fetch_one("SELECT nombre FROM estado_turno WHERE id=%s", (estado_id,))
    return row["nombre"] if row else None

def within_schedule(medico_id: int, fecha_hora, duracion_min: int) -> bool:
    dia = fecha_hora.weekday()  # lunes=0
    rows = fetch_all(
        "SELECT hora_inicio, hora_fin FROM agenda_medico WHERE medicos_id=%s AND dia_semana=%s",
        (medico_id, dia),
    )
    fin_nuevo = fecha_hora + timedelta(minutes=duracion_min)
    for r in rows:
        hi = r["hora_inicio"]; hf = r["Hora_fin"] if "Hora_fin" in r else r["hora_fin"]
        start = fecha_hora.replace(hour=hi.hour, minute=hi.minute, second=0, microsecond=0)
        end   = fecha_hora.replace(hour=hf.hour, minute=hf.minute, second=0, microsecond=0)
        if fecha_hora >= start and fin_nuevo <= end:
            return True
    return False

def overlaps(medico_id: int, fecha_hora, duracion_min: int, exclude_id: int | None = None) -> bool:
    sql = """
    SELECT t.id, t.fecha_hora, t.duracion_min, et.nombre AS estado
    FROM turnos t
    JOIN estado_turno et ON et.id = t.estado_turno_id
    WHERE t.medicos_id=%s
    """
    params = [medico_id]
    if exclude_id:
        sql += " AND t.id <> %s"
        params.append(exclude_id)
    rows = fetch_all(sql, tuple(params))

    start_new = fecha_hora
    end_new   = fecha_hora + timedelta(minutes=duracion_min)

    for t in rows:
        if t["estado"] in CANCELADOS:
            continue
        start = t["fecha_hora"]
        end   = t["fecha_hora"] + timedelta(minutes=t["duracion_min"])
        if start_new < end and end_new > start:
            return True
    return False
