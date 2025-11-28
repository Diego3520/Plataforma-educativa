export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    moduleNameMapper: {
        '^node-fetch$': '<rootDir>/__mocks__/nodeFetch.js'
    },
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    setupFiles: ['<rootDir>/tests/setupTests.ts'],
    transformIgnorePatterns: ['/node_modules/']
};