from fastapi import APIRouter, HTTPException, Query
from app.core.db import fetch_all, fetch_one, execute
from app.dto.medico import MedicoCreate, MedicoUpdate, MedicoOut

router = APIRouter(prefix="/medicos", tags=["Medicos"])

@router.get("", response_model=list[MedicoOut])
def list_medicos(search: str = Query("")):
    if search:
        s = f"%{search}%"
        sql = """
        SELECT m.id, m.nombre, m.apellido, m.matricula, m.mail, m.especialidad_id
        FROM medicos m
        JOIN especialidades e ON e.id = m.especialidad_id
        WHERE m.nombre LIKE %s OR m.apellido LIKE %s OR e.nombre LIKE %s
        ORDER BY m.id
        """
        return fetch_all(sql, (s, s, s))
    return fetch_all("SELECT id, nombre, apellido, matricula, mail, especialidad_id FROM medicos ORDER BY id")

@router.get("/{id}", response_model=MedicoOut)
def get_medico(id: int):
    row = fetch_one("SELECT id, nombre, apellido, matricula, mail, especialidad_id FROM medicos WHERE id=%s", (id,))
    if not row: raise HTTPException(404, "Not found")
    return row

@router.post("", response_model=MedicoOut, status_code=201)
def create_medico(body: MedicoCreate):
    new_id = execute(
        "INSERT INTO medicos (nombre, apellido, matricula, mail, especialidad_id) VALUES (%s,%s,%s,%s,%s)",
        (body.nombre, body.apellido, body.matricula, body.mail, body.especialidad_id)
    )
    return get_medico(new_id)

@router.put("/{id}", response_model=MedicoOut)
def update_medico(id: int, body: MedicoUpdate):
    if not fetch_one("SELECT id FROM medicos WHERE id=%s", (id,)):
        raise HTTPException(404, "Not found")
    execute(
        "UPDATE medicos SET nombre=%s, apellido=%s, matricula=%s, mail=%s, especialidad_id=%s WHERE id=%s",
        (body.nombre, body.apellido, body.matricula, body.mail, body.especialidad_id, id)
    )
    return get_medico(id)

@router.delete("/{id}", status_code=204)
def delete_medico(id: int):
    if not fetch_one("SELECT id FROM medicos WHERE id=%s", (id,)):
        raise HTTPException(404, "Not found")
    execute("DELETE FROM medicos WHERE id=%s", (id,))

@router.get("/{id}/agenda")
def get_agenda(id: int):
    sql = """
    SELECT id, medicos_id AS medico_id, dia_semana,
           DATE_FORMAT(hora_inicio, '%H:%i') AS hora_inicio,
           DATE_FORMAT(hora_fin, '%H:%i') AS hora_fin,
           duracion_min
    FROM agenda_medico WHERE medicos_id=%s ORDER BY dia_semana, hora_inicio
    """
    return fetch_all(sql, (id,))
