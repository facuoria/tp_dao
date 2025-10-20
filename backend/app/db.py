import os
import mysql.connector
from mysql.connector import errorcode, Error
from dotenv import load_dotenv

load_dotenv()

CFG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "rolpa"),
    "database": os.getenv("MYSQL_DB", "turnosMedicos"),
    "autocommit": False,      # control explícito de commit/rollback
    "charset": "utf8",        # tu schema está en utf8
}

def get_connection():
    conn = mysql.connector.connect(**CFG)
    # opcional: verificar y reintentar si se corta
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


def insertar_paciente(dni, nombre, apellido, mail, telefono, fecha_nacimiento):         #parametros necesarios para insertar un paciente  FECHA DE NACIMIENTO FORMATO: YYYY-MM-DD
    sql = """
    INSERT INTO pacientes (dni, nombre, apellido, mail, telefono, fecha_nacimiento)   
    VALUES (%s, %s, %s, %s, %s, %s)
    """                                                                                 # Consulta SQL para realizar la insercion 

    params = (dni, nombre, apellido, mail, telefono, fecha_nacimiento)
    conn = None
    cur = None
    try:
        conn = get_connection()                                                         # Establezco la conexion con la bd
        cur = conn.cursor()                                                             # Esta variable la utilizo para hacer la query
        cur.execute(sql, params)                                                        # Realizo la insercion a la base de datos
        new_id = cur.lastrowid                                                          # Devuelve el ID creado en la BD
        conn.commit()                                                                   # Confirma (hace permanentes) los cambios de tu transacción actual en MySQL.
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

def listar_pacientes():
    sql = "SELECT id, dni, apellido, nombre FROM pacientes ORDER BY id DESC"
    conn = None
    cur = None
    try:
         conn = get_connection()
         cur = conn.cursor()
         cur.execute(sql)
         return cur.fetchall()
    finally:
        if cur: cur.close()
        if conn: conn.close()

def eliminar_pacientes_por_DNI(dni: int):
    sql = "DELETE FROM pacientes WHERE dni = %s"
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, (dni,))                                                                                        # MUUUUY IMPORTANTE LA COMA DEL FINAL YA QUE ESTAMOS TRABAJANDO CON TUPLAS
        afectados = cur.rowcount
        conn.commit()
        return afectados
    except mysql.connector.Error as e:                                                                                  # capturo errores propios del conector MySQL
        if e.errno == errorcode.ER_ROW_IS_REFERENCED_2:                                                                 # error 1451: hay FKs que referencian esta fila
            raise ValueError("No se puede borrar: el paciente tiene turnos/recetas/historial asociados.") from e
        raise                                                                                                           # re-lanzo cualquier otro error inesperado



