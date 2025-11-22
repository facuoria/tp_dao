import mysql.connector
from mysql.connector import errorcode

from app.core.database import get_connection


def list_agenda(medico_id=None):
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


def create_agenda(medico_id, dia_semana, hora_inicio, hora_fin, duracion_min):
    sql = """
        INSERT INTO agenda_medico
            (medicos_id, dia_semana, hora_inicio, hora_fin, duracion_min)
        VALUES
            (%s, %s, %s, %s, %s)
    """
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


def delete_agenda(agenda_id: int) -> int:
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
    except mysql.connector.Error:
        if conn:
            conn.rollback()
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def update_agenda(agenda_id: int, medico_id, dia_semana, hora_inicio, hora_fin, duracion_min) -> int:
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
