import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { usuarioService } from './usuarioService';
import { verificacionRepository } from '../repositories/verificacionRepository';
import { emailService } from './emailService';
import { usuario } from '../models/usuario';

export class authService {
  private usuarioSrv: usuarioService;
  private verificacionRepo: verificacionRepository;
  private emailSrv: emailService;
  private jwtSecret: string;

  constructor() {
    this.usuarioSrv = new usuarioService();
    this.verificacionRepo = new verificacionRepository();
    this.emailSrv = new emailService();
    this.jwtSecret = process.env.JWT_SECRET || 'default_secret_key_change_in_production';
  }

  async registrarUsuarioManual(datos: {
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    tipo: string;
  }): Promise<{ usuario: usuario; codigoEnviado: boolean }> {
    // Crear usuario
    const nuevoUsuario = await this.usuarioSrv.crearUsuario({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      password: datos.password,
      tipo: datos.tipo,
      activo: false // Inactivo hasta verificar
    });

    // Generar código de verificación
    const codigoEnviado = await this.generarYEnviarCodigo(nuevoUsuario.id_usuario, datos.correo);

    return { usuario: nuevoUsuario, codigoEnviado };
  }

  async registrarUsuarioOAuth(datos: {
    nombre: string;
    apellido: string;
    correo: string;
    tipo: string;
    avatar_url?: string;
    proveedor: 'google' | 'microsoft';
  }): Promise<{ usuario: usuario; codigoEnviado: boolean }> {
    // Generar contraseña aleatoria para usuarios OAuth
    const randomPassword = uuidv4();

    // Crear usuario
    const nuevoUsuario = await this.usuarioSrv.crearUsuario({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      password: randomPassword,
      tipo: datos.tipo,
      avatar_url: datos.avatar_url,
      activo: false // Inactivo hasta verificar
    });

    // Generar código de verificación
    const codigoEnviado = await this.generarYEnviarCodigo(nuevoUsuario.id_usuario, datos.correo);

    return { usuario: nuevoUsuario, codigoEnviado };
  }

  private async generarYEnviarCodigo(usuarioId: number, email: string): Promise<boolean> {
    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calcular fecha de expiración (1 hora)
    const expiraEn = new Date();
    expiraEn.setHours(expiraEn.getHours() + 1);

    // Guardar en base de datos
    await this.verificacionRepo.create({
      id_usuario: usuarioId,
      codigo,
      expira_en: expiraEn,
      verificado: false
    });

    // Enviar por email
    return await this.emailSrv.enviarCodigoVerificacion(email, codigo);
  }

  async verificarCodigo(codigo: string): Promise<{ verificado: boolean; token?: string; usuario?: usuario }> {
    const verificacion = await this.verificacionRepo.findByCodigo(codigo);
    
    if (!verificacion) {
      return { verificado: false };
    }

    // Verificar si ha expirado
    const ahora = new Date();
    if (ahora > new Date(verificacion.expira_en)) {
      return { verificado: false };
    }

    // Marcar como verificado
    await this.verificacionRepo.update(verificacion.id_verificacion, { verificado: true });
    
    // Activar usuario
    const usuario = await this.usuarioSrv.obtenerUsuarioPorId(verificacion.id_usuario);
    await this.usuarioSrv.editarUsuario(verificacion.id_usuario, { activo: true });

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id_usuario, correo: usuario.correo, tipo: usuario.tipo },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    return { verificado: true, token, usuario };
  }

  async reenviarCodigo(email: string): Promise<boolean> {
    try {
      // Buscar usuario por email
      const usuarios = await this.usuarioSrv.buscarUsuarioPorCorreo(email);
      if (usuarios.length === 0) {
        return false;
      }

      const usuario = usuarios[0];
      return await this.generarYEnviarCodigo(usuario.id_usuario, email);
    } catch (error) {
      console.error('Error al reenviar código:', error);
      return false;
    }
  }
}