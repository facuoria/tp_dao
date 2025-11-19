from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import errorcode
from datetime import datetime
from SQL.db import (
    get_connection,
    insertar_paciente,
    eliminar_paciente_por_id,
    actualizar_paciente,
    insertar_medicos,
    eliminar_medico_por_id,
    actualizar_medico,
    insertar_especialidad,
    eliminar_especialidad_por_id,
    insertar_turno,
    eliminar_turno_por_id,
)
from fastapi.responses import RedirectResponse

app = FastAPI(title="API TURNOS MEDICOS")




# ---------- CORS ----------
app.add_middleware(                     
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

# ---------- ACTUALIZAR PACIENTE (PUT) ----------
@app.put("/api/pacientes/{paciente_id}")
def actualizar_paciente_api(paciente_id: int, body: dict):
    raw_dni = body.get("dni")
    if raw_dni is None or str(raw_dni).strip() == "":
        raise HTTPException(status_code=400, detail="Falta el campo obligatorio: dni")

    try:
        dni = int(raw_dni)
    except ValueError:
        raise HTTPException(status_code=400, detail="El DNI debe ser numérico")

    raw_fecha = body.get("fecha_nacimiento")
    fecha_nacimiento = raw_fecha if raw_fecha else None

    try:
        cantidad = actualizar_paciente(
            paciente_id,
            dni,
            body.get("nombre"),
            body.get("apellido"),
            body.get("mail"),
            body.get("telefono"),
            fecha_nacimiento,
        )
        if cantidad == 0:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        return {"id": paciente_id}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except mysql.connector.Error as e:
        print("MySQL error:", e.errno, e.msg)
        raise HTTPException(status_code=500, detail="Error al actualizar paciente")

# ---------- LISTAR MEDICOS ----------
@app.get("/api/medicos")
def listar_medicos():
    sql = """ 

        SELECT m.id,
               m.nombre,
               m.apellido,
               m.matricula,
               m.especialidad_id,
               e.nombre AS especialidades
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

    matricula = body.get("matricula")
    if not matricula:
        raise HTTPException(status_code=400, detail="Falta la matrícula")

    nombre = body.get("nombre")
    apellido = body.get("apellido")
    mail = body.get("mail")
    especialidad_id = body.get("especialidad_id")   # <-- EL CORRECTO

    if not especialidad_id:
        raise HTTPException(status_code=400, detail="Falta seleccionar especialidad")

    try:
        new_id = insertar_medicos(
            nombre,
            apellido,
            matricula,
            mail,             # este "especialidad" sobra, podés eliminarlo de la función
            especialidad_id
        )
        return {"id": new_id}

    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))

    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al crear médico")

    
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

# ----------- ACTUALIZAR MEDICO -------------
@app.put("/api/medicos/{medico_id}")
def actualizar_medico_api(medico_id: int, body: dict):
    matricula = body.get("matricula")
    if not matricula:
        raise HTTPException(status_code=400, detail="Falta la matrícula")

    nombre = body.get("nombre")
    apellido = body.get("apellido")
    mail = body.get("mail")
    especialidad_id = body.get("especialidad_id")

    if not especialidad_id:
        raise HTTPException(status_code=400, detail="Falta seleccionar especialidad")

    try:
        actualizadas = actualizar_medico(
            medico_id,
            nombre,
            apellido,
            matricula,
            mail,
            especialidad_id
        )
        if actualizadas == 0:
            raise HTTPException(status_code=404, detail="Medico no encontrado")
        return {"id": medico_id}
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error as e:
        print("MySQL error:", e.errno, e.msg)
        raise HTTPException(status_code=500, detail="Error al actualizar medico")
    
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
    
#------------ VISUALIZAR ESTADOS --------------------
@app.get("/api/estados")
def listar_estados():
    sql = """
        SELECT id, nombre
        FROM estado_turno
        ORDER BY id ASC
    """
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()

    
#------------------------ VISUALIZAR TURNOS --------------------------
@app.get("/api/turnos")
def listar_turnos():
    sql = """
    SELECT 
        t.id,
        e.nombre AS estado,

        p.dni AS paciente_dni,
        p.nombre AS paciente_nombre,
        p.apellido AS paciente_apellido,

        m.nombre AS medico_nombre,
        m.apellido AS medico_apellido,
        m.matricula AS medico_matricula,

        t.fecha_hora AS inicio,
        t.duracion_min AS duracion,
        t.motivo,
        t.observaciones

    FROM turnos t
    JOIN pacientes p      ON t.pacientes_id = p.id
    JOIN medicos m        ON t.medicos_id = m.id
    JOIN estado_turno e   ON t.estado_turno_id = e.id

    ORDER BY t.fecha_hora DESC
    """
    
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()


#------------------INSERTAR TURNO------------------
@app.post("/api/turnos", status_code=201)
def crear_turno(body: dict):

    # --------- Campos del body ---------
    paciente_id = body.get("paciente_id")
    medico_id = body.get("medico_id")
    raw_fecha_hora = body.get("fecha_hora")
    raw_duracion = body.get("duracion_min")
    estado_id = body.get("estado_turno_id")
    motivo = body.get("motivo", "")
    observaciones = body.get("observaciones", "")

    # --------- Validaciones básicas ---------
    if not paciente_id:
        raise HTTPException(status_code=400, detail="El paciente es obligatorio")
    if not medico_id:
        raise HTTPException(status_code=400, detail="El médico es obligatorio")
    if not raw_fecha_hora:
        raise HTTPException(status_code=400, detail="La fecha y hora son obligatorias")
    if raw_duracion in (None, ""):
        raise HTTPException(status_code=400, detail="La duración es obligatoria")
    if not estado_id:
        raise HTTPException(status_code=400, detail="El estado del turno es obligatorio")

    # Cast a enteros
    try:
        paciente_id = int(paciente_id)
        medico_id = int(medico_id)
        duracion_min = int(raw_duracion)
        estado_id = int(estado_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="IDs y duración deben ser numéricos.")

    # Parseo de fecha/hora
    try:
        # caso input datetime-local → "2025-03-12T12:21"
        if "T" in raw_fecha_hora:
            fecha_dt = datetime.fromisoformat(raw_fecha_hora)
        else:
            # por si venía "12/03/2025 12:21"
            fecha_dt = datetime.strptime(raw_fecha_hora, "%d/%m/%Y %H:%M")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Formato de fecha y hora inválido. Usá AAAA-MM-DDTHH:MM."
        )

    # Lo que se manda a la DB
    fecha_hora = fecha_dt.strftime("%Y-%m-%d %H:%M:%S")

    # --------- Llamar a la función con manejo de errores ---------
    try:
        new_id = insertar_turno(
            paciente_id,
            medico_id,
            fecha_hora,
            duracion_min,
            estado_id,
            motivo,
            observaciones
        )
        return {"id": new_id}

    except ValueError as ve:
        # errores lógicos de negocio (médico/paciente ya ocupado)
        raise HTTPException(status_code=409, detail=str(ve))

    except mysql.connector.Error as e:
        # Si es error de FK
        if e.errno == errorcode.ER_NO_REFERENCED_ROW_2:
            raise HTTPException(
                status_code=400,
                detail="Paciente, médico o estado inexistente."
            )
        raise HTTPException(status_code=500, detail="Error de base de datos")

#------------------BORRAR TURNO--------------------
@app.delete("/api/turnos/{turno_id}", status_code=204)
def borrar_turno(turno_id: int):
    borradas = eliminar_turno_por_id(turno_id)

    if borradas == 0:
        raise HTTPException(
            status_code=400,
            detail="El turno no existe o no está en estado 'Cancelado'."
        )

    return
