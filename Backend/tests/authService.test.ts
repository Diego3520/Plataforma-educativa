/**
 * Tests para Backend/src/services/authService.ts
 *
 */

// MOCKS — deben ir antes de importar cualquier módulo que instancie emailService
jest.mock('../src/services/emailService', () => ({
    emailService: jest.fn().mockImplementation(() => ({
        enviarCodigoVerificacion: jest.fn().mockResolvedValue(true)
    }))
}));

jest.mock('node-fetch');

// luego tus imports normales:
import { authService } from '../src/services/authService';
import { verificacionRepository } from '../src/repositories/verificacionRepository';
import { usuarioService } from '../src/services/usuarioService';
import jwt from 'jsonwebtoken';

describe('authService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('generarYEnviarCodigo llama al repositorio y al emailService y retorna true', async () => {
        // Spy al método create del repositorio de verificacion
        const createSpy = jest.spyOn(verificacionRepository.prototype, 'create').mockResolvedValue({
            id_verificacion: 1,
            id_usuario: 1,
            codigo: '123456',
            expira_en: new Date(),
            verificado: false
        } as any);

        // Instanciamos el servicio y reemplazamos la dependencia emailSrv por un stub
        const service = new authService();
        const enviarMock = jest.fn().mockResolvedValue(true);
        service['emailSrv'] = { enviarCodigoVerificacion: enviarMock } as any;

        const resultado = await service.generarYEnviarCodigo(1, 'test@example.com');

        expect(resultado).toBe(true);
        expect(createSpy).toHaveBeenCalled();
        expect(enviarMock).toHaveBeenCalledWith('test@example.com', expect.any(String));
    });

    test('verificarCodigo devuelve {verificado:false} si no existe la verificacion', async () => {
        jest.spyOn(verificacionRepository.prototype, 'findByCodigo').mockResolvedValue(null);
        const service = new authService();

        const res = await service.verificarCodigo('no-existe');
        expect(res.verificado).toBe(false);
        expect(res.token).toBeUndefined();
    });

    test('verificarCodigo marca verificado, activa usuario y devuelve token y usuario cuando es válido', async () => {
        const fakeVerificacion: any = {
            id_verificacion: 10,
            id_usuario: 99,
            codigo: 'abc123',
            expira_en: new Date(Date.now() + 60 * 60 * 1000), // 1h adelante
            verificado: false
        };

        jest.spyOn(verificacionRepository.prototype, 'findByCodigo').mockResolvedValue(fakeVerificacion);
        const updateSpy = jest.spyOn(verificacionRepository.prototype, 'update').mockResolvedValue({
            ...fakeVerificacion,
            verificado: true
        } as any);

        // Mock usuarioService methods
        jest.spyOn(usuarioService.prototype, 'obtenerUsuarioPorId').mockResolvedValue({
            id_usuario: 99,
            correo: 'u@example.com',
            tipo: 'alumno',
            activo: false
        } as any);
        const editarSpy = jest.spyOn(usuarioService.prototype, 'editarUsuario').mockResolvedValue({
            id_usuario: 99,
            activo: true
        } as any);

        // Mock jwt.sign
        jest.spyOn(jwt, 'sign').mockReturnValue('jwt-token' as any);

        // Instanciar servicio (emailSrv no se usa en verificarCodigo)
        const service = new authService();

        const res = await service.verificarCodigo('abc123');

        expect(res.verificado).toBe(true);
        expect(res.token).toBe('jwt-token');
        expect(res.usuario).toBeDefined();
        expect(updateSpy).toHaveBeenCalledWith(fakeVerificacion.id_verificacion, { verificado: true });
        expect(editarSpy).toHaveBeenCalledWith(fakeVerificacion.id_usuario, { activo: true });
    });
});