/* eslint-disable */
export default {
  displayName: 'saba-games-standalone',
  setupFiles: ['reflect-metadata'],
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/saba-games-standalone',
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.type.ts',
    '!src/**/*.types.ts',
    '!src/**/type.ts',
    '!src/**/index.ts'
  ],
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
};
