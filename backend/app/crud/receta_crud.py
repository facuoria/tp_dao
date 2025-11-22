import mysql.connector

from app.core.database import get_connection


def list_recetas(turno_id=None, paciente_id=None, medico_id=None):
    sql = """
        SELECT 
            id,
            turnos_id AS turno_id,
            medicos_id AS medico_id,
            pacientes_id AS paciente_id,
            fecha_emision,
            indicaciones
        FROM recetas
        WHERE 1=1
    """
    params = []

    if turno_id is not None:
        sql += " AND turnos_id = %s"
        params.append(turno_id)

    if paciente_id is not None:
        sql += " AND pacientes_id = %s"
        params.append(paciente_id)

    if medico_id is not None:
        sql += " AND medicos_id = %s"
        params.append(medico_id)

    sql += " ORDER BY fecha_emision DESC, id DESC"

    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql, tuple(params))
        return cur.fetchall()


def crear_receta(turno_id, medico_id, paciente_id, indicaciones):
    sql_turno = """
        SELECT 
            t.pacientes_id, 
            t.medicos_id, 
            et.nombre AS estado
        FROM turnos t
        JOIN estado_turno et ON et.id = t.estado_turno_id
        WHERE t.id = %s
    """

    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute(sql_turno, (turno_id,))
        turno = cur.fetchone()

        if not turno:
            raise ValueError("Turno no encontrado")

        if turno["pacientes_id"] != paciente_id:
            raise ValueError("El turno no pertenece a este paciente")

        if turno["medicos_id"] != medico_id:
            raise ValueError("El turno no pertenece a este medico")

        if turno["estado"].lower() != "atendido":
            raise ValueError("Solo se pueden emitir recetas de turnos atendidos")

        sql = """
            INSERT INTO recetas 
                (turnos_id, medicos_id, pacientes_id, fecha_emision, indicaciones)
            VALUES 
                (%s, %s, %s, CURDATE(), %s)
        """

        cur.execute(sql, (turno_id, medico_id, paciente_id, indicaciones))
        conn.commit()

        new_id = cur.lastrowid

        cur.execute("""
            SELECT 
                id, 
                turnos_id AS turno_id, 
                medicos_id AS medico_id, 
                pacientes_id AS paciente_id,
                fecha_emision, 
                indicaciones
            FROM recetas
            WHERE id = %s
        """, (new_id,))

        return cur.fetchone()


def borrar_receta(receta_id: int) -> int:
    sql = "DELETE FROM recetas WHERE id = %s"

    with get_connection() as conn, conn.cursor() as cur:
        cur.execute(sql, (receta_id,))
        conn.commit()
        return cur.rowcount
