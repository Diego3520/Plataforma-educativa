import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

export class emailService {
  constructor() {
    console.log('🔧 Configurando emailService con SendGrid...');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '***configurado***' : 'NO CONFIGURADO');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  }

  async enviarCodigoVerificacion(email: string, codigo: string): Promise<boolean> {
    try {
      console.log(`Enviando código de verificación a: ${email}`);
      console.log(`Código generado: ${codigo}`);

      const msg = {
        to: email,
        from: {
          email: process.env.EMAIL_FROM || '',
          name: 'Plataforma Educativa'
        },
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

      const info = await sgMail.send(msg);
      console.log('Email enviado exitosamente:', info[0]?.statusCode);
      return true;
    } catch (error) {
      console.error('Error al enviar email:', error);
      const err = error as any;
      if (err.response && err.response.body && err.response.body.errors) {
        console.error('Detalles del error:', err.response.body.errors);
      }
      return false;
    }
  }
}
