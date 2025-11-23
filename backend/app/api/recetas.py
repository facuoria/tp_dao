import mysql.connector
from fastapi import APIRouter, HTTPException

from app.crud.receta_crud import borrar_receta, crear_receta, list_recetas
from app.schemas.receta_schema import RecetaCreate
from app.utils.validators import require_int
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

router = APIRouter(prefix="/api/recetas", tags=["Recetas"])


@router.get("")
def listar_recetas(turnoId: int | None = None, pacienteId: int | None = None, medicoId: int | None = None):
    return list_recetas(turno_id=turnoId, paciente_id=pacienteId, medico_id=medicoId)


@router.post("", status_code=201)
def crear_receta_api(body: RecetaCreate):
    turno_id = require_int(body.turno_id, "turno_id", "turno_id es obligatorio", "turno_id debe ser numerico")
    medico_id = require_int(body.medico_id, "medico_id", "medico_id es obligatorio", "medico_id debe ser numerico")
    paciente_id = require_int(body.paciente_id, "paciente_id", "paciente_id es obligatorio", "paciente_id debe ser numerico")

    try:
        receta = crear_receta(turno_id, medico_id, paciente_id, body.indicaciones or "")
        return receta
    except ValueError as ve:
        message = str(ve)
        status = 404 if "no encontrado" in message.lower() else 400
        raise HTTPException(status_code=status, detail=message)
    except mysql.connector.Error:
        raise HTTPException(status_code=500, detail="Error al crear receta")


@router.delete("/{receta_id}", status_code=204)
def borrar_receta_api(receta_id: int):
    borradas = borrar_receta(receta_id)

    if borradas == 0:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    return

@router.get("/{receta_id}/pdf")
def descargar_receta_pdf(receta_id: int):
    # 1) Obtener receta desde la BD
    receta = list_recetas(turno_id=None, paciente_id=None, medico_id=None)
    receta = next((r for r in receta if r["id"] == receta_id), None)

    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    # 2) Buscar datos del paciente y médico
    # (Podemos hacer una query independiente o sumar JOIN en el CRUD según prefieras)
    # Por ahora lo hacemos simple:

    from app.core.database import get_connection
    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        cur.execute("SELECT nombre, apellido FROM pacientes WHERE id=%s", (receta["paciente_id"],))
        paciente = cur.fetchone()

        cur.execute("SELECT nombre, apellido FROM medicos WHERE id=%s", (receta["medico_id"],))
        medico = cur.fetchone()

    # 3) Generar PDF en memoria
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    y = 750

    p.setFont("Helvetica-Bold", 18)
    p.drawString(50, y, "Receta Médica Electrónica")
    y -= 40

    p.setFont("Helvetica", 12)
    p.drawString(50, y, f"Fecha: {receta['fecha_emision']}")
    y -= 25

    p.drawString(50, y, f"Paciente: {paciente['nombre']} {paciente['apellido']}")
    y -= 25

    p.drawString(50, y, f"Médico: {medico['nombre']} {medico['apellido']}")
    y -= 25

    p.drawString(50, y, f"Indicaciones:")
    y -= 20

    p.setFont("Helvetica", 12)
    text = p.beginText(50, y)

    for linea in receta["indicaciones"].split("\n"):
        text.textLine(linea)

    p.drawText(text)

    p.showPage()
    p.save()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=receta_{receta_id}.pdf"
        }
    )
