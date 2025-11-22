import os
import mysql.connector
from mysql.connector import errorcode, Error
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

CFG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "turnero"),
    "password": os.getenv("DB_PASSWORD", "clave_segura"),
    "database": os.getenv("DB_NAME", "turnosMedicos"),
    "autocommit": False,
    "charset": "utf8",
}

def get_connection():
    conn = mysql.connector.connect(**CFG)
    conn.ping(reconnect=True, attempts=3, delay=1)
    return conn

def test_connection():
    try:
        with get_connection() as conn, conn.cursor() as cur:
            cur.execute("SELECT DATABASE(), VERSION()")
            print("Conectado a:", cur.fetchone())
    except Error as e:
        print("Error de conexion:", e)
        raise

#----------- PACIENTES ------------

def insertar_paciente(dni, nombre, apellido, mail, telefono, fecha_nacimiento):
    sql = """
    INSERT INTO pacientes (dni, nombre, apellido, mail, telefono, fecha_nacimiento)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (dni, nombre, apellido, mail, telefono, fecha_nacimiento)
    conn = None
    cur = None

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        new_id = cur.lastrowid
        conn.commit()
        return new_id

    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        if e.errno == errorcode.ER_DUP_ENTRY:
            # TODO: mensaje claro para el front
            raise ValueError(f"DNI ya existente: {dni}") from e
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def eliminar_paciente_por_id(paciente_id: int) -> int:  # <--- nombre alineado
    sql_turnos = "DELETE FROM turnos WHERE pacientes_id = %s"
    sql_paciente = "DELETE FROM pacientes WHERE id = %s"
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # 1. Eliminar turnos asociados
        cur.execute(sql_turnos, (paciente_id,))
        
        # 2. Eliminar paciente
        cur.execute(sql_paciente, (paciente_id,))
        
        afectados = cur.rowcount
        conn.commit()
        return afectados
    except mysql.connector.Error:
        if conn:
            conn.rollback()
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

def actualizar_paciente(paciente_id: int, dni, nombre, apellido, mail, telefono, fecha_nacimiento) -> int:
    sql = """
        UPDATE pacientes
        SET dni = %s,
            nombre = %s,
            apellido = %s,
            mail = %s,
            telefono = %s,
            fecha_nacimiento = %s
        WHERE id = %s
    """
    params = (dni, nombre, apellido, mail, telefono, fecha_nacimiento, paciente_id)
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.rowcount
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        if e.errno == errorcode.ER_DUP_ENTRY:
            raise ValueError(f"DNI ya existente: {dni}") from e
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

#----------- MEDICOS -------------

def insertar_medicos(nombre, apellido, matricula, mail, especialidad_id):
    sql = """ 
        INSERT INTO medicos (nombre, apellido, matricula, mail, especialidad_id)
        VALUES (%s, %s, %s, %s, %s)
    """
    params = (nombre, apellido, matricula, mail, especialidad_id)
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        new_id = cur.lastrowid
        conn.commit()
        return new_id
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise ValueError(f"Matricula ya existente: {matricula}") from e
            raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def eliminar_medico_por_id(medico_id: int) -> int:
    sql = "DELETE FROM medicos WHERE id = %s"
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql,(medico_id,))
        afecctados = cur.rowcount
        conn.commit()
        return afecctados
    
    #capaz tenga que ir un except aca

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def actualizar_medico(medico_id: int, nombre, apellido, matricula, mail, especialidad_id) -> int:
    sql = """
        UPDATE medicos
        SET nombre = %s,
            apellido = %s,
            matricula = %s,
            mail = %s,
            especialidad_id = %s
        WHERE id = %s
    """
    params = (nombre, apellido, matricula, mail, especialidad_id, medico_id)
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.rowcount
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        if e.errno == errorcode.ER_DUP_ENTRY:
            raise ValueError(f"Matricula ya existente: {matricula}") from e
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

#----------- ESPECIALIDADES --------------
def insertar_especialidad(nombre):
    sql = """ 
        INSERT INTO especialidades (nombre)
        VALUES (%s)"""
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, (nombre,))
        new_id = cur.lastrowid
        conn.commit()
        return new_id

    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        with get_connection() as conn, conn.cursor() as cur:
            cur.execute("SELECT DATABASE(), VERSION()")
            print("Conectado a:", cur.fetchone())
    except Error as e:
        print("Error de conexion:", e)
        raise

#----------- PACIENTES ------------

def insertar_paciente(dni, nombre, apellido, mail, telefono, fecha_nacimiento):
    sql = """
    INSERT INTO pacientes (dni, nombre, apellido, mail, telefono, fecha_nacimiento)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (dni, nombre, apellido, mail, telefono, fecha_nacimiento)
    conn = None
    cur = None

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        new_id = cur.lastrowid
        conn.commit()
        return new_id

    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        if e.errno == errorcode.ER_DUP_ENTRY:
            # TODO: mensaje claro para el front
            raise ValueError(f"DNI ya existente: {dni}") from e
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def eliminar_paciente_por_id(paciente_id: int) -> int:  # <--- nombre alineado
    sql_turnos = "DELETE FROM turnos WHERE pacientes_id = %s"
    sql_paciente = "DELETE FROM pacientes WHERE id = %s"
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # 1. Eliminar turnos asociados
        cur.execute(sql_turnos, (paciente_id,))
        
        # 2. Eliminar paciente
        cur.execute(sql_paciente, (paciente_id,))
        
        afectados = cur.rowcount
        conn.commit()
        return afectados
    except mysql.connector.Error:
        if conn:
            conn.rollback()
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

def actualizar_paciente(paciente_id: int, dni, nombre, apellido, mail, telefono, fecha_nacimiento) -> int:
    sql = """
        UPDATE pacientes
        SET dni = %s,
            nombre = %s,
            apellido = %s,
            mail = %s,
            telefono = %s,
            fecha_nacimiento = %s
        WHERE id = %s
    """
    params = (dni, nombre, apellido, mail, telefono, fecha_nacimiento, paciente_id)
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.rowcount
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        if e.errno == errorcode.ER_DUP_ENTRY:
            raise ValueError(f"DNI ya existente: {dni}") from e
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

#----------- MEDICOS -------------

def insertar_medicos(nombre, apellido, matricula, mail, especialidad_id):
    sql = """ 
        INSERT INTO medicos (nombre, apellido, matricula, mail, especialidad_id)
        VALUES (%s, %s, %s, %s, %s)
    """
    params = (nombre, apellido, matricula, mail, especialidad_id)
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        new_id = cur.lastrowid
        conn.commit()
        return new_id
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise ValueError(f"Matricula ya existente: {matricula}") from e
            raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def eliminar_medico_por_id(medico_id: int) -> int:
    sql = "DELETE FROM medicos WHERE id = %s"
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql,(medico_id,))
        afecctados = cur.rowcount
        conn.commit()
        return afecctados
    
    #capaz tenga que ir un except aca

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def actualizar_medico(medico_id: int, nombre, apellido, matricula, mail, especialidad_id) -> int:
    sql = """
        UPDATE medicos
        SET nombre = %s,
            apellido = %s,
            matricula = %s,
            mail = %s,
            especialidad_id = %s
        WHERE id = %s
    """
    params = (nombre, apellido, matricula, mail, especialidad_id, medico_id)
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.rowcount
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        if e.errno == errorcode.ER_DUP_ENTRY:
            raise ValueError(f"Matricula ya existente: {matricula}") from e
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

#----------- ESPECIALIDADES --------------
def insertar_especialidad(nombre):
    sql = """ 
        INSERT INTO especialidades (nombre)
        VALUES (%s)"""
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, (nombre,))
        new_id = cur.lastrowid
        conn.commit()
        return new_id

    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise ValueError(f"Especialidad ya cargada: {nombre}") from e
            raise

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def eliminar_especialidad_por_id(especialidad_id: int) -> int:
    sql = """DELETE
             FROM especialidades
             WHERE id = %s"""
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur  =conn.cursor()
        cur.execute(sql,(especialidad_id,))
        afectados = cur.rowcount
        conn.commit()
        return afectados
    
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

#-------------------- TURNOS -----------------------

def insertar_turno(paciente_id, medico_id, fecha_hora, duracion_min,
                   estado_turno_id, motivo, observaciones):
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()

        # 0) Validar contra Agenda del Medico
        if isinstance(fecha_hora, str):
            dt_inicio = datetime.fromisoformat(fecha_hora)
        else:
            dt_inicio = fecha_hora

        dia_semana = dt_inicio.weekday() # 0=Lunes, 6=Domingo
        hora_inicio_turno = dt_inicio.time()

        sql_agenda = """
            SELECT id, hora_inicio, hora_fin, duracion_min
            FROM agenda_medico
            WHERE medicos_id = %s
              AND dia_semana = %s
              AND hora_inicio <= %s
              AND hora_fin > %s
        """
        cur.execute(sql_agenda, (medico_id, dia_semana, hora_inicio_turno, hora_inicio_turno))
        agenda = cur.fetchone()

        if not agenda:
            raise ValueError("El médico no atiende en ese día y horario (según su agenda).")

        agenda_duracion = agenda[3]
        agenda_fin = agenda[2] 

        # Calcular fin del turno
        dt_fin_turno = dt_inicio + timedelta(minutes=agenda_duracion)
        
        # Construimos el datetime fin de la agenda para ese dia
        if isinstance(agenda_fin, timedelta):
            dt_agenda_fin = datetime.combine(dt_inicio.date(), datetime.min.time()) + agenda_fin
        else:
            dt_agenda_fin = datetime.combine(dt_inicio.date(), agenda_fin)

        if dt_fin_turno > dt_agenda_fin:
             raise ValueError(f"El turno excede el horario de atención (cierra a las {agenda_fin}).")

        duracion_real = agenda_duracion

        # 1) Verificar si el medico ya tiene turno en ese horario
        sql_medico = """
            SELECT id FROM turnos
            WHERE medicos_id = %s
              AND fecha_hora = %s
        """
        cur.execute(sql_medico, (medico_id, dt_inicio))
        if cur.fetchone():
            raise ValueError("El medico ya tiene un turno asignado en ese horario.")

        # 2) Verificar si el paciente ya tiene turno en ese horario
        sql_paciente = """
            SELECT id FROM turnos
            WHERE pacientes_id = %s
              AND fecha_hora = %s
        """
        cur.execute(sql_paciente, (paciente_id, dt_inicio))
        if cur.fetchone():
            raise ValueError("El paciente ya tiene un turno asignado en ese horario.")

        # 3) Insertar el turno
        sql_insert = """
            INSERT INTO turnos 
                (pacientes_id, medicos_id, fecha_hora, duracion_min, 
                 estado_turno_id, motivo, observaciones)
            VALUES 
                (%s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            paciente_id,
            medico_id,
            dt_inicio,
            duracion_real,
            estado_turno_id,
            motivo,
            observaciones
        )

        cur.execute(sql_insert, params)
        conn.commit()
        return cur.lastrowid

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def eliminar_turno_por_id(turno_id: int) -> int:
    sql = """
        DELETE FROM turnos
        WHERE id = %s AND estado_turno_id = 3
    """
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, (turno_id,))
        afectados = cur.rowcount
        conn.commit()
        return afectados

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

#------------------------- AGENDA -------------------------
def insertar_agenda(medico_id, dia_semana, hora_inicio, hora_fin, duracion_min):
    sql = """
        INSERT INTO agenda_medico
            (medicos_id, dia_semana, hora_inicio, hora_fin, duracion_min)
        VALUES
            (%s, %s, %s, %s, %s)"""
    params = (medico_id, dia_semana, hora_inicio, hora_fin, duracion_min)
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.lastrowid
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise ValueError("Agenda ya cargada") from e
            raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def eliminar_agenda_por_id(agenda_id: int) -> int:
    sql = """
        DELETE FROM agenda_medico
        WHERE id = %s
        """
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, (agenda_id,))
        afectados = cur.rowcount
        conn.commit()
        return afectados
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
            raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def actualizar_agenda_por_id(agenda_id: int, medico_id, dia_semana, hora_inicio, hora_fin, duracion_min) -> int:
    sql = """
        UPDATE agenda_medico
        SET medicos_id = %s,
            dia_semana = %s,
            hora_inicio = %s,
            hora_fin = %s,
            duracion_min = %s
        WHERE id = %s
    """
    params = (medico_id, dia_semana, hora_inicio, hora_fin, duracion_min, agenda_id)
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.rowcount
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise ValueError("Agenda ya cargada") from e
            raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()