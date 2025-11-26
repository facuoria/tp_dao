import mysql.connector
from mysql.connector import errorcode

from app.core.database import get_connection


def list_medicos(solo_con_agenda: bool = False):
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


def get_medico_by_id(medico_id: int):
    sql = """ 
        SELECT m.id,
               m.nombre,
               m.apellido,
               m.matricula,
               m.especialidad_id,
               e.nombre AS especialidades
        FROM medicos m
        JOIN especialidades e ON m.especialidad_id = e.id
        WHERE m.id = %s
    """
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql, (medico_id,))
        return cur.fetchone()


def create_medico(nombre, apellido, matricula, mail, especialidad_id):
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


def delete_medico(medico_id: int) -> int:
    sql = "DELETE FROM medicos WHERE id = %s"
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, (medico_id,))
        afectados = cur.rowcount
        conn.commit()
        return afectados
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def update_medico(medico_id: int, nombre, apellido, matricula, mail, especialidad_id) -> int:
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
