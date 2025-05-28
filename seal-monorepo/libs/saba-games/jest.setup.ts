// Import reflect-metadata for decorator support
import 'reflect-metadata';

// Import testing-library jest-dom extensions
import '@testing-library/jest-dom';

// Mock any global objects needed for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock file imports (images, svg, etc.)
jest.mock('../assets/sedie.png', () => 'mocked-image-file', { virtual: true });
jest.mock('../assets/arrow.svg', () => 'mocked-svg-file', { virtual: true });

// Mock image files more generally
class MockImage {
    onload: () => void = () => { };

    constructor() {
        setTimeout(() => this.onload());
    }
}

Object.defineProperty(global, 'Image', {
    writable: true,
    value: MockImage
});

// Mock for style imports
jest.mock('*.module.scss', () => ({}), { virtual: true }); 