from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
import mysql.connector
from app.core.database import get_connection

router = APIRouter(prefix="/api/reportes", tags=["Reportes"])

@router.get("/{tipo}/pdf")
def generar_reporte_pdf(
    tipo: str,
    desde: str = Query(None),
    hasta: str = Query(None),
    medico_id: int = Query(None),
    especialidad_id: int = Query(None)
):
    """
    tipo puede ser:
      - asistencias
      - inasistencias
      - turnos-medico
      - turnos-especialidad
      - pacientes-atendidos
    """

    with get_connection() as conn, conn.cursor(dictionary=True) as cur:
        
        if tipo == "asistencias-inasistencias":
            sql = """
                SELECT 
                    t.id,
                    t.fecha_hora, 
                    e.nombre AS estado,
                    p.nombre AS paciente_nombre,
                    p.apellido AS paciente_apellido,
                    m.nombre AS medico_nombre,
                    m.apellido AS medico_apellido
                FROM turnos t
                JOIN pacientes p ON t.pacientes_id = p.id
                JOIN medicos m   ON t.medicos_id = m.id
                JOIN estado_turno e ON t.estado_turno_id = e.id
                WHERE t.fecha_hora BETWEEN %s AND %s
            """
            cur.execute(sql, (f"{desde} 00:00:00", f"{hasta} 23:59:59"))
            data = cur.fetchall()

        elif tipo == "turnos-medico":
            if not medico_id:
                raise HTTPException(400, "Falta medico_id")
            
            sql = """
                SELECT t.id, t.fecha_hora, t.estado, t.motivo,
                       p.nombre AS paciente_nombre, p.apellido AS paciente_apellido
                FROM turnos t
                JOIN pacientes p ON t.pacientes_id = p.id
                WHERE t.medicos_id = %s
                  AND t.fecha_hora BETWEEN %s AND %s
            """
            cur.execute(sql, (medico_id, f"{desde} 00:00:00", f"{hasta} 23:59:59"))
            data = cur.fetchall()

        elif tipo == "pacientes-atendidos":
            sql = """
                SELECT t.id, t.fecha_hora,
                       p.nombre AS paciente_nombre, p.apellido AS paciente_apellido
                FROM turnos t
                JOIN pacientes p ON t.pacientes_id = p.id
                WHERE t.estado = 'Atendido'
                  AND t.fecha_hora BETWEEN %s AND %s
            """
            cur.execute(sql, (f"{desde} 00:00:00", f"{hasta} 23:59:59"))
            data = cur.fetchall()
        elif tipo == "turnos-especialidad":
            if not especialidad_id:
                raise HTTPException(400, "Falta especialidad_id")
    
            sql = """
                SELECT t.id, t.fecha_hora, t.estado,
                    p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
                    m.nombre AS medico_nombre, m.apellido AS medico_apellido
                FROM turnos t
                JOIN pacientes p ON t.pacientes_id = p.id
                JOIN medicos m   ON t.medicos_id = m.id
                WHERE m.especialidad_id = %s
                    AND t.fecha_hora BETWEEN %s AND %s
            """

            cur.execute(sql, (especialidad_id, f"{desde} 00:00:00", f"{hasta} 23:59:59"))
            data = cur.fetchall()


        else:
            raise HTTPException(400, f"Tipo '{tipo}' no soportado")


    # === GENERAR PDF ===
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 760, f"Reporte: {tipo.replace('-', ' ').title()}")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, 735, f"Periodo: {desde} a {hasta}")
    y = 710

    for item in data:
        if y < 40:
            pdf.showPage()
            y = 750
            pdf.setFont("Helvetica", 12)

        texto = f"{item.get('fecha_hora','')} - {item.get('paciente_nombre','')} {item.get('paciente_apellido','')}"
        pdf.drawString(50, y, texto)
        y -= 20

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=reporte_{tipo}.pdf"
        }
    )
