import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class emailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async enviarCodigoVerificacion(email: string, codigo: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Código de verificación - Plataforma Educativa',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verificación de correo electrónico</h2>
            <p>Gracias por registrarte en nuestra plataforma educativa. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${codigo}
            </div>
            <p>Este código expirará en 1 hora.</p>
            <p>Si no has solicitado este código, puedes ignorar este correo.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error al enviar email:', error);
      return false;
    }
  }
}