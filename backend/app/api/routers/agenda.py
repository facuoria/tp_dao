from fastapi import APIRouter, HTTPException
from app.core.db import fetch_one, execute
from app.dto import AgendaCreate, AgendaUpdate, AgendaOut

router = APIRouter(prefix="/agenda", tags=["Agenda"])

def _ensure_slot_exists(id: int) -> dict:
    row = fetch_one(
      """SELECT id, medicos_id AS medico_id, dia_semana,
                DATE_FORMAT(hora_inicio, '%H:%i') AS hora_inicio,
                DATE_FORMAT(hora_fin, '%H:%i') AS hora_fin,
                duracion_min
         FROM agenda_medico WHERE id=%s""",
      (id,)
    )
    if not row:
        raise HTTPException(404, "Not found")
    return row

def _validate_duplicate(medico_id: int, dia_semana: int, hora_inicio: str, exclude_id: int | None = None):
    sql = """SELECT id FROM agenda_medico
             WHERE medicos_id=%s AND dia_semana=%s AND hora_inicio=%s"""
    params: list = [medico_id, dia_semana, hora_inicio]
    if exclude_id:
        sql += " AND id<>%s"
        params.append(exclude_id)
    dup = fetch_one(sql, tuple(params))
    if dup:
        raise HTTPException(409, "Ya existe una franja en ese horario")

@router.get("/{id}", response_model=AgendaOut)
def get_agenda_item(id: int):
    row = _ensure_slot_exists(id)
    return row

@router.put("/{id}", response_model=AgendaOut)
def update_agenda_item(id: int, body: AgendaUpdate):
    current = _ensure_slot_exists(id)
    _validate_duplicate(current["medico_id"], body.dia_semana, body.hora_inicio, exclude_id=id)
    execute(
        "UPDATE agenda_medico SET dia_semana=%s, hora_inicio=%s, hora_fin=%s, duracion_min=%s WHERE id=%s",
        (body.dia_semana, body.hora_inicio, body.hora_fin, body.duracion_min, id)
    )
    return _ensure_slot_exists(id)

@router.delete("/{id}", status_code=204)
def delete_agenda_item(id: int):
    _ensure_slot_exists(id)
    execute("DELETE FROM agenda_medico WHERE id=%s", (id,))
