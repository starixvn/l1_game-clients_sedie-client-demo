/**
 * @format
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */

module.exports = {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  jest: {
    projectType: "custom",
    configFile: "jest.config.ts",
    enableFindRelatedTests: true,
  },
  mutate: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.test.ts",
    "!src/**/*.test.tsx",
    "!src/**/*.spec.ts",
    "!src/**/*.spec.tsx",
    "!src/**/*.stories.ts",
    "!src/**/*.stories.tsx",
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
  mutator: {
    excludedMutations: ["StringLiteral", "ArrayDeclaration"],
  },
  timeoutMS: 60000,
  plugins: ["@stryker-mutator/jest-runner"],
};
