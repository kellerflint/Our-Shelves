const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173', // Frontend's url
        supportFile: 'cypress/support/e2e.js',
        specPattern: 'cypress/e2e/**/*.cy.js',
        video: true,
        screenshotOnRunFailure: true,
        viewportHeight: 1280,
        viewportWidth: 720,
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        env: {
            apiUrl: 'http://localhost:3000'
        }
    }
});