// Mocks globales aplicados antes de que se importen los módulos en los tests.
// Mockeamos emailService para evitar que nodemailer abra conexiones/sockets.
jest.mock('../src/services/emailService', () => ({
    emailService: jest.fn().mockImplementation(() => ({
        enviarCodigoVerificacion: jest.fn().mockResolvedValue(true),
    }))
}));

jest.mock('node-fetch', () => jest.fn());