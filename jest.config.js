module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/handlers/**', // Handlers are integration points, tested via integration tests
    '!src/middleware/**', // Middleware tested via handler integration tests
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  moduleNameMapper: {
    '^@/models/(.*)$': '<rootDir>/src/models/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/handlers/(.*)$': '<rootDir>/src/handlers/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/middleware/(.*)$': '<rootDir>/src/middleware/$1',
  },
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
};
