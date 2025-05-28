/* eslint-disable */
export default {
  displayName: 'saba-games',
  preset: '../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/saba-games',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',

    // Handle CSS/SCSS imports (with CSS modules)
    '\\.module\\.(css|scss)$': 'identity-obj-proxy',

    // Handle CSS/SCSS imports (without CSS modules)
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
};
