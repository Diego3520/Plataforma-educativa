export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    setupFiles: ['<rootDir>/tests/setupTests.ts'],
    transformIgnorePatterns: ['/node_modules/']
};