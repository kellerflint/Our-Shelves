export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.int.test.js'],
  setupFilesAfterEnv: ['./__tests__/setupTests.cjs'],
  testTimeout: 30000
};
