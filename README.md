✔️ Prerrequisitos

MySQL 8 (local, Workbench, o Docker)

Python 3.8+ (recomendado 3.10/3.11)

Node 18+ y npm

(Opcional) MySQL Workbench para importar el esquema con GUI

⚡️ Guía Rápida (si ya tenés todo instalado)
# 1) Base de datos
mysql -u root -p < backend/sql/schema.sql

# 2) Backend
cd backend
python -m venv .venv
# Win (PowerShell): .\.venv\Scripts\Activate.ps1
# Mac/Linux:       source .venv/bin/activate
pip install -r requirements.txt
# crear .env desde la plantilla
# Win: copy .env.example .env    |   Mac/Linux: cp .env.example .env
# editar backend/.env con tus credenciales
uvicorn app.main:app --reload --port 8000

# 3) Frontend
cd ../frontend
npm install
# crear .env.local con:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_USE_MSW=0
npm run dev


Frontend: http://localhost:3000

API/Swagger: http://localhost:8000/docs

Si algo no te sale, seguí la guía detallada de abajo.

1) Base de datos MySQL
Opción A — con MySQL Workbench (GUI)

Abrí Workbench y conectate.

File → Open SQL Script… → abrí backend/sql/schema.sql.

Ejecutá (ícono del rayo).
Se crea la base turnosMedicos con tablas e inserts de estados.

(Opcional) Usuario dedicado:

CREATE USER IF NOT EXISTS 'turnero'@'localhost' IDENTIFIED BY 'clave_segura';
GRANT ALL PRIVILEGES ON turnosMedicos.* TO 'turnero'@'localhost';
FLUSH PRIVILEGES;

Opción B — por consola

Windows (CMD/PowerShell):

mysql -u root -p < backend\sql\schema.sql


macOS / Linux:

mysql -u root -p < backend/sql/schema.sql

Opción C — con Docker (si no tenés MySQL)
docker run --name mysql8 -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -d mysql:8 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

docker exec -i mysql8 mysql -uroot -psecret < backend/sql/schema.sql

# Usuario opcional (acceso desde cualquier host):
docker exec -it mysql8 mysql -uroot -psecret -e "\
CREATE USER IF NOT EXISTS 'turnero'@'%' IDENTIFIED BY 'clave_segura'; \
GRANT ALL PRIVILEGES ON turnosMedicos.* TO 'turnero'@'%'; FLUSH PRIVILEGES;"

2) Backend (FastAPI + SQL puro)

Crear .env (a partir de la plantilla):

cd backend
# Windows:
copy .env.example .env
# macOS / Linux:
# cp .env.example .env


Editá backend/.env:

APP_NAME=Turnero API
API_PREFIX=/api

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=turnosMedicos
DB_USER=turnero          # o root si no creaste usuario
DB_PASSWORD=clave_segura

FRONTEND_ORIGINS=http://localhost:3000


Virtualenv + dependencias:

Windows (PowerShell):

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -U pip setuptools wheel
pip install -r requirements.txt


macOS / Linux:

python3 -m venv .venv
source .venv/bin/activate
pip install -U pip setuptools wheel
pip install -r requirements.txt


Levantar la API:

uvicorn app.main:app --reload --port 8000


Verificá en http://localhost:8000/docs
.

💡 Si VS Code te marca en rojo pydantic, elegí el intérprete del venv (te sale un cartelito “We noticed a new environment…” → Yes).

3) Frontend (Next.js)

Crear frontend/.env.local:

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MSW=0


NEXT_PUBLIC_API_URL = URL del backend.

NEXT_PUBLIC_USE_MSW=0 = usa backend real (si ponés 1, usa la Fake API MSW).

Instalar y correr:

cd frontend
npm install
npm run dev


Abrí http://localhost:3000
.

Verificación rápida

Abrí DevTools → Network (F12).

Al navegar/buscar, las requests deben ir a:

http://localhost:8000/api/...


En la terminal del backend verás logs tipo GET /api/pacientes 200.

Si ves http://localhost:3000/api/..., el front aún no usa el backend real.
Revisá .env.local, reiniciá npm run dev y asegurate de usar el helper que arma la URL base (ya viene en frontend/lib/api/client.ts).

4) Datos de prueba (opcional)
USE turnosMedicos;

INSERT INTO especialidades (nombre) VALUES ('Clínica Médica');
INSERT INTO medicos (nombre, apellido, especialidad_id) VALUES ('Ana','Gómez',1);
INSERT INTO agenda_medico (medicos_id,dia_semana,hora_inicio,hora_fin,duracion_min)
VALUES (1,0,'08:00','12:00',30);  -- Lunes 08-12

INSERT INTO pacientes (dni, nombre, apellido, mail)
VALUES ('32123456','Juan','Pérez','juan@example.com');


Ahora podés crear turnos (lunes por la mañana para evitar rechazos por agenda).

5) Cambiar entre Backend real y Fake API (MSW)

Backend real (persistencia en MySQL):

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MSW=0


Fake API (MSW) (para maqueta rápida, sin BD):

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_USE_MSW=1


Reiniciá el front.
(Si un Service Worker viejo molesta, en DevTools → Application → Service Workers → Unregister.)

6) Problemas comunes

Veo datos en la web pero no en MySQL
El front usa MSW. Poné NEXT_PUBLIC_USE_MSW=0 y reiniciá.

CORS en el navegador
FRONTEND_ORIGINS=http://localhost:3000 en backend/.env. Reiniciá el back.

Access denied al conectar la API a MySQL
Revisa usuario/clave en .env. Si no tenés usuario, usá root o corré:

GRANT ALL PRIVILEGES ON turnosMedicos.* TO 'turnero'@'localhost';
FLUSH PRIVILEGES;


pydantic o imports en rojo
Seleccioná el intérprete backend/.venv en VS Code y corré pip install -r requirements.txt.

Puerto en uso
Cambiá el back: uvicorn app.main:app --reload --port 8001
y el front: NEXT_PUBLIC_API_URL=http://localhost:8001.

7) Comandos útiles

Backend

# activar venv
# Win: .\.venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

# instalar dependencias
pip install -r requirements.txt

# correr API
uvicorn app.main:app --reload --port 8000


Frontend

npm install
npm run dev

8) Notas

Backend: FastAPI, SQL directo con mysql-connector-python (sin ORM), DTOs con Pydantic, reglas de negocio (agenda y solapamiento de turnos).

Frontend: Next.js (App Router) + TailwindCSS; las llamadas usan NEXT_PUBLIC_API_URL para apuntar al backend.

Base de datos: MySQL 8, esquema listo en backend/sql/schema.sql.