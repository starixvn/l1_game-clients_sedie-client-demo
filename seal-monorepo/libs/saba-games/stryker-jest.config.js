/* eslint-disable */
module.exports = {
    displayName: 'saba-games',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)', '**/stryker-mock-test.js'],
    rootDir: '.',
    verbose: true,
};
