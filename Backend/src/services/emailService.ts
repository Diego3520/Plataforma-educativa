import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class emailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('🔧 Configurando emailService...');
    console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configurado***' : 'NO CONFIGURADO');
    
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verificar la configuración del transporter
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Error en configuración de email:', error);
      } else {
        console.log('Servidor de email listo para enviar mensajes');
      }
    });
  }

  async enviarCodigoVerificacion(email: string, codigo: string): Promise<boolean> {
    try {
      console.log(`Enviando código de verificación a: ${email}`);
      console.log(`Código generado: ${codigo}`);
      
      const mailOptions = {
        from: `"Plataforma Educativa" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Código de verificación - Plataforma Educativa',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Verificación de correo electrónico</h2>
            <p>Gracias por registrarte en nuestra plataforma educativa. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 8px; margin: 30px 0; border: 2px solid #ddd; border-radius: 8px;">
              ${codigo}
            </div>
            <p><strong>Este código expirará en 1 hora.</strong></p>
            <p>Si no has solicitado este código, puedes ignorar este correo.</p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">Plataforma Educativa - Sistema de Verificación</p>
          </div>
        `,
        text: `Código de verificación: ${codigo}\n\nEste código expirará en 1 hora.\n\nSi no has solicitado este código, puedes ignorar este correo.`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(' Email enviado exitosamente:', info.messageId);
      return true;
    } catch (error) {
      console.error(' Error al enviar email:', error);
      console.error('Detalles del error:', {
        code: (error as any).code,
        command: (error as any).command,
        response: (error as any).response
      });
      return false;
    }
  }
}