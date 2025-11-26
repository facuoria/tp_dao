import mysql.connector
from mysql.connector import errorcode

from app.core.database import get_connection


def list_pacientes():
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


def get_paciente_by_id(paciente_id: int):
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
    WHERE id = %s
    """
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql, (paciente_id,))
        return cur.fetchone()


def create_paciente(dni, nombre, apellido, mail, telefono, fecha_nacimiento):
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
            raise ValueError(f"DNI ya existente: {dni}") from e
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def delete_paciente(paciente_id: int) -> int:
    sql_turnos = "DELETE FROM turnos WHERE pacientes_id = %s"
    sql_paciente = "DELETE FROM pacientes WHERE id = %s"
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute(sql_turnos, (paciente_id,))
        cur.execute(sql_paciente, (paciente_id,))

        afectados = cur.rowcount
        conn.commit()
        return afectados
    except mysql.connector.Error:
        if conn:
            conn.rollback()
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def update_paciente(paciente_id: int, dni, nombre, apellido, mail, telefono, fecha_nacimiento) -> int:
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
