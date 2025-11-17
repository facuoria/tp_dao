from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import errorcode
from SQL.db import (
    get_connection,
    insertar_paciente,
    eliminar_paciente_por_id,
    insertar_medicos,
    eliminar_medico_por_id,
    insertar_especialidad,
    eliminar_especialidad_por_id,
)
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
    sql = """
    SELECT 
        id, 
        dni, 
        nombre, 
        apellido, 
        mail,
        telefono,
        fecha_nacimiento
    FROM pacientes 
    ORDER BY id DESC
    """
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()

# ---------- INSERTAR PACIENTE (POST) ----------
@app.post("/api/pacientes", status_code=201)
def crear_paciente(body: dict):
    # --- validar y normalizar DNI ---
    raw_dni = body.get("dni")
    if raw_dni is None or str(raw_dni).strip() == "":
        raise HTTPException(status_code=400, detail="Falta el campo obligatorio: dni")

    try:
        dni = int(raw_dni)
    except ValueError:
        raise HTTPException(status_code=400, detail="El DNI debe ser numérico")

    # --- normalizar fecha de nacimiento ---
    raw_fecha = body.get("fecha_nacimiento")
    # si viene "" o None, guardamos NULL en la BD
    fecha_nacimiento = raw_fecha if raw_fecha else None

    try:
        new_id = insertar_paciente(
            dni,
            body.get("nombre"),
            body.get("apellido"),
            body.get("mail"),
            body.get("telefono"),
            fecha_nacimiento,  # Puede ser 'YYYY-MM-DD' o None
        )
        return {"id": new_id}

    # Error que dispara insertar_paciente cuando el DNI ya existe
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    # Cualquier error inesperado de MySQL
    except mysql.connector.Error as e:
        # 👇 mientras debugueamos, mostramos el mensaje real
        print("MySQL error:", e.errno, e.msg)
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear paciente: {e.msg}"
        )

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

# ---------- LISTAR MEDICOS ----------
@app.get("/api/medicos")
def listar_medicos():
    sql = """ 

        SELECT m.id, m.nombre, m.apellido, m.matricula, e.nombre AS especialidades
        FROM medicos m
        JOIN especialidades e ON m.especialidad_id = e.id
        ORDER BY id DESC
        """
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()
    
# ---------- INSERTAR MEDICO ----------
@app.post("/api/medicos", status_code=201)
def crear_medico(body: dict):
    # Validacion minima de la matricula
    matricula = body.get("matricula")
    if matricula is None:
        raise HTTPException(status_code=400, detail="Falta el campo obligatorio: matricula")
    try:
        new_id = insertar_medicos(
            body.get("nombre"),
            body.get("apellido"),
            body.get("matricula"), 
            body.get("mail"),
            body.get("especialidad"),
            body.get("fecha_nacimiento")
        )
        return {"id": new_id}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail="Error al crear paciente")
    
# ----------- BORRAR MEDICO POR ID -------------
@app.delete("/api/medicos/{medico_id}", status_code=204)
def borrar_paciente(medico_id: int):
    try:
        borradas = eliminar_medico_por_id(medico_id)
        if borradas == 0:
            raise HTTPException(status_code=404, detail="Medico no encontrado")
        return  # 204 No Content
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al borrar medico")
    
#------------ VISUALIZAR ESPECIALIDAD ---------------
@app.get("/api/especialidades")
def listar_especialidades():
    sql = """SELECT id, nombre
             FROM especialidades"""
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()

#------------ INSERTAR ESPECIALIDAD -----------------
@app.post("/api/especialidades", status_code=201)
def crear_especialidades(body: dict):
    nombre = body.get("nombre")
    if not nombre or not nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre de la especialidad es obligatorio")
    
    try:
        new_id = insertar_especialidad(
            body.get("nombre")
        )
        return {"id": new_id}
    
    except ValueError as ve:
        # nombre duplicado → conflicto
        raise HTTPException(status_code=409, detail=str(ve))
    
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al crear especialidad")
    
 #------------ BORRAR ESPECIALIDAD ------------------   
    
@app.delete("/api/especialidades/{especialidad_id}", status_code=204)
def borrar_paciente(especialidad_id: int):
    try:
        borradas = eliminar_especialidad_por_id(especialidad_id)
        if borradas == 0:
            raise HTTPException(status_code=404, detail="Especialidad no encontrada")
        return  # 204 No Content
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al borrar especialidad")
