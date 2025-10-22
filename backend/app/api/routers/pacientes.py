from fastapi import APIRouter, Query, HTTPException
from app.core.db import fetch_all, fetch_one, execute
from app.dto.paciente import PacienteCreate, PacienteUpdate, PacienteOut

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])

@router.get("")
def list_pacientes(search: str = Query(""), page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100)):
    off = (page - 1) * size
    if search:
        s = f"%{search}%"
        total = fetch_one(
            "SELECT COUNT(*) AS c FROM pacientes WHERE dni LIKE %s OR nombre LIKE %s OR apellido LIKE %s",
            (s, s, s)
        )["c"]
        rows = fetch_all(
            "SELECT id, CAST(dni AS CHAR) AS dni, nombre, apellido, mail, telefono, fecha_nacimiento, created_at "
            "FROM pacientes WHERE dni LIKE %s OR nombre LIKE %s OR apellido LIKE %s "
            "ORDER BY id LIMIT %s OFFSET %s",
            (s, s, s, size, off)
        )
    else:
        total = fetch_one("SELECT COUNT(*) AS c FROM pacientes")["c"]
        rows = fetch_all(
            "SELECT id, CAST(dni AS CHAR) AS dni, nombre, apellido, mail, telefono, fecha_nacimiento, created_at "
            "FROM pacientes ORDER BY id LIMIT %s OFFSET %s",
            (size, off)
        )
    return {"data": rows, "total": int(total)}

@router.get("/{id}", response_model=PacienteOut)
def get_paciente(id: int):
    row = fetch_one(
        "SELECT id, CAST(dni AS CHAR) AS dni, nombre, apellido, mail, telefono, fecha_nacimiento, created_at "
        "FROM pacientes WHERE id=%s",
        (id,)
    )
    if not row: raise HTTPException(404, "Not found")
    return row

@router.post("", response_model=PacienteOut, status_code=201)
def create_paciente(body: PacienteCreate):
    # dni único
    dup = fetch_one("SELECT COUNT(*) AS c FROM pacientes WHERE dni=%s", (body.dni,))["c"]
    if dup: raise HTTPException(409, "DNI duplicado")
    new_id = execute(
        "INSERT INTO pacientes (dni, nombre, apellido, mail, telefono, fecha_nacimiento) VALUES (%s,%s,%s,%s,%s,%s)",
        (body.dni, body.nombre, body.apellido, body.mail, body.telefono, body.fecha_nacimiento)
    )
    return get_paciente(new_id)

@router.put("/{id}", response_model=PacienteOut)
def update_paciente(id: int, body: PacienteUpdate):
    if not fetch_one("SELECT id FROM pacientes WHERE id=%s", (id,)):
        raise HTTPException(404, "Not found")
    execute(
        "UPDATE pacientes SET dni=%s, nombre=%s, apellido=%s, mail=%s, telefono=%s, fecha_nacimiento=%s WHERE id=%s",
        (body.dni, body.nombre, body.apellido, body.mail, body.telefono, body.fecha_nacimiento, id)
    )
    return get_paciente(id)

@router.delete("/{id}", status_code=204)
def delete_paciente(id: int):
    if not fetch_one("SELECT id FROM pacientes WHERE id=%s", (id,)):
        raise HTTPException(404, "Not found")
    execute("DELETE FROM pacientes WHERE id=%s", (id,))
