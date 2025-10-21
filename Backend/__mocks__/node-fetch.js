/* eslint-env jest */
/* eslint-disable check-file/filename-naming-convention */

// Mock simple de node-fetch para que las pruebas no importen la implementación ESM real.
// Exportamos __esModule: true para simular un default export.
const mockFetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        ok: true,
        status: 200
    })
);

module.exports = {
    __esModule: true,
    default: mockFetch
};