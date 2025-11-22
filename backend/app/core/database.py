import mysql.connector
from mysql.connector import Error, errorcode

from .config import settings

CFG = {
    "host": settings.db_host,
    "port": settings.db_port,
    "user": settings.db_user,
    "password": settings.db_password,
    "database": settings.db_name,
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
