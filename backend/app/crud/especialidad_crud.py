import mysql.connector
from mysql.connector import errorcode

from app.core.database import get_connection


def list_especialidades():
    sql = """SELECT id, nombre
             FROM especialidades
             ORDER BY id ASC
          """
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()


def create_especialidad(nombre):
    sql = """ 
        INSERT INTO especialidades (nombre)
        VALUES (%s)
    """
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


def delete_especialidad(especialidad_id: int) -> int:
    sql = """DELETE
             FROM especialidades
             WHERE id = %s"""
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute(sql, (especialidad_id,))
        afectados = cur.rowcount
        conn.commit()
        return afectados
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
