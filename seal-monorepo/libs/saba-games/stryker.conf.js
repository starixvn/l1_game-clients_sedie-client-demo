/**
 * @format
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */

module.exports = {
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'jest',
    coverageAnalysis: 'perTest',
    jest: {
        projectType: 'custom',
        configFile: 'stryker-jest.config.js',
        enableFindRelatedTests: true,
    },
    mutate: ['stryker-mock-test.js'],
    thresholds: {
        high: 80,
        low: 60,
        break: 50,
    },
    mutator: {
        excludedMutations: ['StringLiteral', 'ArrayDeclaration'],
    },
    timeoutMS: 60000,
    plugins: ['@stryker-mutator/jest-runner'],
    tempDirName: '.stryker-tmp',
};
