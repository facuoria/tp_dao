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
    insertar_agenda,
    eliminar_agenda_por_id,
    actualizar_agenda_por_id
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
# ---------- LISTAR MEDICOS ----------
@app.get("/api/medicos")
def listar_medicos(solo_con_agenda: bool = False):
    if solo_con_agenda:
        sql = """ 
            SELECT DISTINCT m.id,
                   m.nombre,
                   m.apellido,
                   m.matricula,
                   m.especialidad_id,
                   e.nombre AS especialidades
            FROM medicos m
            JOIN especialidades e ON m.especialidad_id = e.id
            JOIN agenda_medico a ON m.id = a.medicos_id
            ORDER BY m.id DESC
        """
    else:
        sql = """ 
            SELECT m.id,
                   m.nombre,
                   m.apellido,
                   m.matricula,
                   m.especialidad_id,
                   e.nombre AS especialidades
            FROM medicos m
            JOIN especialidades e ON m.especialidad_id = e.id
            ORDER BY m.id DESC
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
    
# ===================== VISUALIZAR AGENDA ==========================

@app.get("/api/agenda")
def listar_agenda(medico_id: int = None):
    if medico_id:
        sql = """
            SELECT 
                a.id,
                a.medicos_id AS medico_id,
                m.nombre AS medico_nombre,
                m.apellido AS medico_apellido,
                a.dia_semana,
                DATE_FORMAT(a.hora_inicio, '%H:%i') AS hora_inicio,
                DATE_FORMAT(a.hora_fin, '%H:%i') AS hora_fin,
                a.duracion_min
            FROM agenda_medico a
            JOIN medicos m ON a.medicos_id = m.id
            WHERE a.medicos_id = %s
            ORDER BY a.dia_semana, a.hora_inicio
        """
        params = (medico_id,)
    else:
        sql = """
            SELECT 
                a.id,
                a.medicos_id AS medico_id,
                m.nombre AS medico_nombre,
                m.apellido AS medico_apellido,
                a.dia_semana,
                DATE_FORMAT(a.hora_inicio, '%H:%i') AS hora_inicio,
                DATE_FORMAT(a.hora_fin, '%H:%i') AS hora_fin,
                a.duracion_min
            FROM agenda_medico a
            JOIN medicos m ON a.medicos_id = m.id
            ORDER BY m.apellido, a.dia_semana, a.hora_inicio
        """
        params = ()

    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql, params)
        return cur.fetchall()
#------------------------- INSERTAR AGENDA -------------------------

@app.post("/api/agenda", status_code=201)
def crear_agenda(body: dict):
    try:
        new_id = insertar_agenda(
            body.get("medico_id"),
            body.get("dia_semana"),
            body.get("hora_inicio"),
            body.get("hora_fin"),
            body.get("duracion_min")
        )
        return {"id": new_id}
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al crear agenda")
#------------------------- BORRAR AGENDA -------------------------
@app.delete("/api/agenda/{agenda_id}", status_code=204)
def borrar_agenda(agenda_id: int):
    try:
        borradas = eliminar_agenda_por_id(agenda_id)
        if borradas == 0:
            raise HTTPException(status_code=404, detail="Agenda no encontrada")
        return  # 204 No Content
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al borrar agenda")

#------------------------- ACTUALIZAR AGENDA -------------------------
@app.put("/api/agenda/{agenda_id}", status_code = 204)
def actualizar_agenda(agenda_id: int, body: dict):
    try:
        actualizadas = actualizar_agenda_por_id(
            agenda_id,
            body.get("medico_id"),
            body.get("dia_semana"),
            body.get("hora_inicio"),
            body.get("hora_fin"),
            body.get("duracion_min")
        )
        if actualizadas == 0:
            raise HTTPException(status_code=404, detail="Agenda no encontrada")
        return  # 204 No Content
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al actualizar agenda")


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

#---------------- MODIFICAR TURNO -----------------
@app.put("/api/turnos/{turno_id}")
def actualizar_turno(turno_id: int, body: dict):

    nuevo_estado = body.get("estado_turno_id")
    nueva_fecha = body.get("fecha_hora", None)

    if not nuevo_estado:
        raise HTTPException(status_code=400, detail="El estado es obligatorio.")

    # Si cambia a reprogramado (4), debe venir fecha_hora
    if nuevo_estado == 4 and not nueva_fecha:
        raise HTTPException(status_code=400, detail="La nueva fecha es obligatoria para reprogramar.")

    # Parsear fecha si viene
    if nueva_fecha:
        try:
            if "T" in nueva_fecha:
                nueva_fecha = datetime.fromisoformat(nueva_fecha)
            else:
                nueva_fecha = datetime.strptime(nueva_fecha, "%Y-%m-%d %H:%M")
            nueva_fecha = nueva_fecha.strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha/hora inválido.")

    # Actualizar turno
    conn = get_connection()
    cur = conn.cursor()

    sql = "UPDATE turnos SET estado_turno_id = %s{} WHERE id = %s"

    if nueva_fecha:
        sql = sql.format(", fecha_hora = %s")
        params = (nuevo_estado, nueva_fecha, turno_id)
    else:
        sql = sql.format("")
        params = (nuevo_estado, turno_id)

    cur.execute(sql, params)
    conn.commit()

    return {"detail": "Turno actualizado correctamente"}


# ===================== LISTAR RECETAS ==========================

@app.get("/api/recetas")
def listar_recetas(
    turno_id: int | None = None,
    paciente_id: int | None = None,
    medico_id: int | None = None
):
    sql = """
        SELECT 
            r.id,
            r.turnos_id AS turno_id,
            r.medicos_id AS medico_id,
            r.pacientes_id AS paciente_id,
            r.fecha_emision,
            r.indicaciones
        FROM recetas r
        WHERE 1=1
    """
    params = []

    if turno_id:
        sql += " AND r.turnos_id = %s"
        params.append(turno_id)

    if paciente_id:
        sql += " AND r.pacientes_id = %s"
        params.append(paciente_id)

    if medico_id:
        sql += " AND r.medicos_id = %s"
        params.append(medico_id)

    sql += " ORDER BY r.id DESC"

    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql, params)
        return cur.fetchall()


# ===================== CREAR RECETA ==========================

@app.post("/api/recetas", status_code=201)
def crear_receta(body: dict):

    turno_id = body.get("turno_id")
    medico_id = body.get("medico_id")
    paciente_id = body.get("paciente_id")
    indicaciones = body.get("indicaciones", "")

    # ---- Validar campos obligatorios ----
    if not turno_id:
        raise HTTPException(400, "El turno es obligatorio")
    if not medico_id:
        raise HTTPException(400, "El médico es obligatorio")
    if not paciente_id:
        raise HTTPException(400, "El paciente es obligatorio")

    # ---- 1. Validar que el turno exista ----
    sql_turno = """
        SELECT id, pacientes_id, medicos_id
        FROM turnos
        WHERE id = %s
    """

    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql_turno, (turno_id,))
        turno = cur.fetchone()

    if not turno:
        raise HTTPException(404, "Turno no encontrado")

    # ---- 2. Validar que el turno pertenece al médico correcto ----
    if turno["medicos_id"] != medico_id:
        raise HTTPException(400, "El turno no pertenece a este médico")

    # ---- 3. Validar que el turno pertenece al paciente correcto ----
    if turno["pacientes_id"] != paciente_id:
        raise HTTPException(400, "El turno no pertenece a este paciente")

    # ---- 4. Insertar receta ----
    sql_insert = """
        INSERT INTO recetas (turnos_id, medicos_id, pacientes_id, fecha_emision, indicaciones)
        VALUES (%s, %s, %s, CURDATE(), %s)
    """

    with get_connection() as conn, conn.cursor() as cur:
        cur.execute(sql_insert, (turno_id, medico_id, paciente_id, indicaciones))
        conn.commit()
        new_id = cur.lastrowid

    # ---- 5. Obtener receta creada ----
    sql_get = """
        SELECT 
            id,
            turnos_id AS turno_id,
            medicos_id AS medico_id,
            pacientes_id AS paciente_id,
            fecha_emision,
            indicaciones
        FROM recetas
        WHERE id = %s
    """

    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql_get, (new_id,))
        return cur.fetchone()
