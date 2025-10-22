from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import errorcode
from .db import get_connection, insertar_paciente, eliminar_paciente_por_id
from fastapi.responses import RedirectResponse

#                  ^^^^^^^^ import relativo y nombre de función alineado

app = FastAPI(title="API TURNOS MEDICOS")




# ---------- CORS ----------
app.add_middleware(                     # <--- usar add_middleware
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------RAIZ-------------
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


# ---------- Health ----------
@app.get("/api/health")
def health():
    return {"ok": True}

# ---------- LISTAR PACIENTES (GET) ----------
@app.get("/api/pacientes")
def listar_pacientes():
    sql = "SELECT id, dni, apellido, nombre FROM pacientes ORDER BY id DESC"
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()

# ---------- INSERTAR PACIENTE (POST) ----------
@app.post("/api/pacientes", status_code=201)
def crear_paciente(body: dict):
    if "dni" not in body or body["dni"] is None:
        raise HTTPException(status_code=400, detail="Falta el campo obligatorio: dni")
    try:
        new_id = insertar_paciente(
            body.get("dni"),
            body.get("nombre"),
            body.get("apellido"),
            body.get("mail"),             # ojo: clave 'mail'
            body.get("telefono"),
            body.get("fecha_nacimiento"), # 'YYYY-MM-DD' o None
        )
        return {"id": new_id}
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al crear paciente")

# ---------- BORRAR PACIENTE POR ID (DELETE) ----------
@app.delete("/api/pacientes/{paciente_id}", status_code=204)
def borrar_paciente(paciente_id: int):
    try:
        borradas = eliminar_paciente_por_id(paciente_id)
        if borradas == 0:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        return  # 204 No Content
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al borrar paciente")
