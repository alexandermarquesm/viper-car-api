/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverageFrom: [
    '<rootDir>/src/application/**/*.ts',
    '<rootDir>/src/domain/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
