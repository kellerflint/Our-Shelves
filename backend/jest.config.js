export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.int.test.js'],
  setupFilesAfterEnv: ['./__tests__/setupTests.js'],
  testTimeout: 30000
};
