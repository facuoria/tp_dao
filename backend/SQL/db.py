import os
import mysql.connector
from mysql.connector import errorcode, Error
from dotenv import load_dotenv


load_dotenv()

CFG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "jbj953Vale"),
    "database": os.getenv("MYSQL_DB", "turnosMedicos"),
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
        print("Error de conexión:", e)
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
            # 👇 mensaje claro para el front
            raise ValueError(f"DNI ya existente: {dni}") from e
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def eliminar_paciente_por_id(paciente_id: int) -> int:  # <--- nombre alineado
    sql = "DELETE FROM pacientes WHERE id = %s"
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, (paciente_id,))   # tupla de 1 elemento
        afectados = cur.rowcount
        conn.commit()
        return afectados
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        if e.errno == errorcode.ER_ROW_IS_REFERENCED_2:
            raise ValueError("No se puede borrar: el paciente tiene turnos/recetas/historial asociados.") from e
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

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
    
    # Puede ser necesario un except
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
