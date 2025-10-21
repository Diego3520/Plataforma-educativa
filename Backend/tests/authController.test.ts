// Mocks que deben ejecutarse antes de importar cualquier módulo que cree recursos
jest.mock('node-fetch');

// Mock del servicio de email: exportamos emailService como "constructor" mockeado
jest.mock('../src/services/emailService', () => ({
    emailService: jest.fn().mockImplementation(() => ({
        enviarCodigoVerificacion: jest.fn().mockResolvedValue(true)
    }))
}));

import { authController } from '../src/controllers/authController';
import { usuarioRepository } from '../src/repositories/usuarioRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Evitamos accesos reales al repo en los tests
jest.mock('../src/repositories/usuarioRepository');

describe('authController.login', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('devuelve token y usuario cuando las credenciales son válidas', async () => {
        const mockUser = {
            id_usuario: 1,
            correo: 'user@test.com',
            password_hash: 'hashed',
            activo: true,
            nombre: 'User',
            apellido: 'Test'
        };

        // Espiar el método del repositorio en el prototype
        jest.spyOn(usuarioRepository.prototype, 'findByCorreo').mockResolvedValue(mockUser as any);

        // Mockear bcrypt.compare usando mockImplementation para evitar problemas de tipos
        jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

        // Mockear jwt.sign con spyOn
        jest.spyOn(jwt, 'sign').mockReturnValue('fake-token' as any);

        const req: any = { body: { correo: 'user@test.com', password: 'pass' } };
        const jsonMock = jest.fn();
        const res: any = { status: jest.fn().mockReturnThis(), json: jsonMock };

        await authController.login(req, res);

        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
            token: 'fake-token',
            usuario: expect.objectContaining({ id_usuario: 1, correo: 'user@test.com' })
        }));
    });

    test('responde 401 cuando la contraseña es inválida', async () => {
        jest.spyOn(usuarioRepository.prototype, 'findByCorreo').mockResolvedValue({
            id_usuario: 2,
            correo: 'user2@test.com',
            password_hash: 'hashed',
            activo: true
        } as any);

        // Usar mockImplementation en lugar de mockResolvedValue para evitar TS2345
        jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

        const req: any = { body: { correo: 'user2@test.com', password: 'wrong' } };
        const statusMock = jest.fn().mockReturnThis();
        const jsonMock = jest.fn();
        const res: any = { status: statusMock, json: jsonMock };

        await authController.login(req, res);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
    });
});