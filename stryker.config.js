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
    configFile: "seal-monorepo/jest.config.ts",
    enableFindRelatedTests: true,
  },
  mutate: [
    "libs/saba-games/src/**/*.ts",
    "libs/saba-games/src/**/*.tsx",
    "!libs/saba-games/src/**/*.test.ts",
    "!libs/saba-games/src/**/*.test.tsx",
    "!libs/saba-games/src/**/*.spec.ts",
    "!libs/saba-games/src/**/*.spec.tsx",
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
};
