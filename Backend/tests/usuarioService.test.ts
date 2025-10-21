import bcrypt from 'bcrypt';
import { usuarioService } from '../src/services/usuarioService';
import { usuarioRepository } from '../src/repositories/usuarioRepository';

// Evitar accesos reales al repositorio
jest.mock('../src/repositories/usuarioRepository');

describe('usuarioService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('crearUsuario lanza error si falta nombre o apellido', async () => {
        const service = new usuarioService();

        await expect(service.crearUsuario({
            nombre: '',
            apellido: 'A',
            tipo: 'alumno'
        } as any)).rejects.toThrow();

        await expect(service.crearUsuario({
            nombre: 'N',
            apellido: '',
            tipo: 'alumno'
        } as any)).rejects.toThrow();
    });

    test('crearUsuario lanza error si tipo no es válido', async () => {
        const service = new usuarioService();
        await expect(service.crearUsuario({
            nombre: 'N',
            apellido: 'A',
            tipo: 'no-existe'
        } as any)).rejects.toThrow('Tipo de usuario inválido');
    });

    test('crearUsuario hashea la contraseña antes de llamar al repositorio', async () => {
        // Mock bcrypt.hash usando mockImplementation para evitar errores de tipos en el editor
        jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed-password' as any);

        // Espiar create del repositorio con mockImplementation para evitar TS2345
        const createSpy = jest.spyOn(usuarioRepository.prototype, 'create')
            .mockImplementation(async (payload: any) => ({
                id_usuario: 1,
                nombre: payload.nombre,
                apellido: payload.apellido,
                tipo: payload.tipo,
                password_hash: payload.password_hash
            } as any));

        const service = new usuarioService();
        await service.crearUsuario({
            nombre: 'N',
            apellido: 'A',
            tipo: 'alumno',
            password: 'secret'
        });

        expect(createSpy).toHaveBeenCalled();
        const passedArg = createSpy.mock.calls[0][0];
        // El campo enviado al repositorio debe incluir password_hash con el valor del hash mockeado
        expect(passedArg.password_hash).toBe('hashed-password');
    });

    test('editarUsuario lanza error si tipo invalido', async () => {
        const service = new usuarioService();
        await expect(service.editarUsuario(1, { tipo: 'invalid-type' } as any)).rejects.toThrow('Tipo de usuario inválido');
    });
});