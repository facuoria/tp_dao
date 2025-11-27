from typing import List, Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.mail_username,
            MAIL_PASSWORD=settings.mail_password,
            MAIL_FROM=settings.mail_from,
            MAIL_PORT=settings.mail_port,
            MAIL_SERVER=settings.mail_server,
            MAIL_FROM_NAME=settings.mail_from_name,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )
        self.fastmail = FastMail(self.conf)

    async def send_email(
        self,
        email_to: List[EmailStr],
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ):
        message = MessageSchema(
            subject=subject,
            recipients=email_to,
            body=html_content,
            subtype=MessageType.html
        )
        await self.fastmail.send_message(message)

    async def send_welcome_email(self, email_to: str, nombre: str):
        subject = "¡Bienvenido a la clinica San Gabriel!"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #2c3e50;">¡Hola {nombre}!</h2>
                    <p>Bienvenido a la Clínica San Gabriel. Sus datos han sido guardados exitosamente.</p>
                    <br>
                    <p>Saludos cordiales.</p>
                    <p><strong>Recepción de la Clínica San Gabriel</strong></p>
                </div>
            </body>
        </html>
        """
        await self.send_email([email_to], subject, html_content)

    async def send_appointment_confirmation_email(
        self,
        email_to: str,
        paciente_nombre: str,
        medico_nombre: str,
        medico_apellido: str,
        medico_matricula: str,
        fecha: str,
        hora: str
    ):
        subject = "Confirmación de Turno Médico"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #2c3e50;">¡Hola {paciente_nombre}!</h2>
                    <p>Su turno ha sido registrado exitosamente.</p>
                    <p>A continuación, los detalles de su turno:</p>
                    <ul>
                        <li><strong>Médico:</strong> Dr./Dra. {medico_nombre} {medico_apellido}</li>
                        <li><strong>Matrícula:</strong> {medico_matricula}</li>
                        <li><strong>Fecha:</strong> {fecha}</li>
                        <li><strong>Hora:</strong> {hora}</li>
                    </ul>
                    <br>
                    <p>Por favor, recuerde asistir con 10 minutos de antelación.</p>
                    <p>Saludos cordiales,</p>
                    <p><strong>Clínica San Gabriel</strong></p>
                </div>
            </body>
        </html>
        """
        await self.send_email([email_to], subject, html_content)

email_service = EmailService()
