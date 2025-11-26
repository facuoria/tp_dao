from datetime import datetime, timedelta

import mysql.connector
from mysql.connector import errorcode

from app.core.database import get_connection


def list_turnos():
    sql = """
    SELECT 
        t.id,
        t.medicos_id AS medico_id,
        m.especialidad_id AS especialidad_id,
        esp.nombre AS especialidad_nombre,
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
    JOIN especialidades esp ON m.especialidad_id = esp.id
    JOIN estado_turno e   ON t.estado_turno_id = e.id

    ORDER BY t.fecha_hora DESC
    """
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()


def crear_turno(paciente_id, medico_id, fecha_hora, duracion_min, estado_turno_id, motivo, observaciones):
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()

        dt_inicio = fecha_hora if isinstance(fecha_hora, datetime) else datetime.fromisoformat(str(fecha_hora))

        dia_semana = dt_inicio.weekday()
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
            raise ValueError("El medico no atiende en ese dia y horario (segun su agenda).")

        agenda_duracion = agenda[3]
        agenda_fin = agenda[2]

        dt_fin_turno = dt_inicio + timedelta(minutes=agenda_duracion)

        if isinstance(agenda_fin, timedelta):
            dt_agenda_fin = datetime.combine(dt_inicio.date(), datetime.min.time()) + agenda_fin
        else:
            dt_agenda_fin = datetime.combine(dt_inicio.date(), agenda_fin)

        if dt_fin_turno > dt_agenda_fin:
            raise ValueError(f"El turno excede el horario de atencion (cierra a las {agenda_fin}).")

        sql_medico = """
            SELECT id FROM turnos
            WHERE medicos_id = %s
              AND fecha_hora = %s
        """
        cur.execute(sql_medico, (medico_id, dt_inicio))
        if cur.fetchone():
            raise ValueError("El medico ya tiene un turno asignado en ese horario.")

        sql_paciente = """
            SELECT id FROM turnos
            WHERE pacientes_id = %s
              AND fecha_hora = %s
        """
        cur.execute(sql_paciente, (paciente_id, dt_inicio))
        if cur.fetchone():
            raise ValueError("El paciente ya tiene un turno asignado en ese horario.")

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
            duracion_min,
            estado_turno_id,
            motivo,
            observaciones
        )

        cur.execute(sql_insert, params)
        conn.commit()
        return cur.lastrowid

    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        if e.errno == errorcode.ER_NO_REFERENCED_ROW_2:
            raise ValueError("Paciente, medico o estado inexistente.") from e
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def eliminar_turno(turno_id: int) -> int:
    # Permitimos borrar turnos cuyo estado sea 'cancelado_paciente' (id 3)
    # o 'cancelado_medico' (id 2). Esto evita borrar turnos en otros estados.
    sql = """
        DELETE FROM turnos
        WHERE id = %s AND estado_turno_id IN (2, 3)
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


def actualizar_turno(turno_id: int, nuevo_estado, nueva_fecha=None) -> int:
    conn = None
    cur = None
    try:
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
        return cur.rowcount
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def list_estados():
    sql = """
        SELECT id, nombre
        FROM estado_turno
        ORDER BY id ASC
    """
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()
