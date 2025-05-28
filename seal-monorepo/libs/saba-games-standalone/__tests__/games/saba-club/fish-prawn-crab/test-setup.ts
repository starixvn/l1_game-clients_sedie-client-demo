/**
 * Common test setup for Fish Prawn Crab component tests
 */

// Add React Testing Library's custom jest matchers
import '@testing-library/jest-dom';

// Mock for CSS modules
jest.mock('*.module.scss', () => ({
    'round-history': 'mock-round-history',
    'history-item': 'mock-history-item',
    'hstack-round': 'mock-hstack-round',
    'arrow': 'mock-arrow'
}));

// Mock for sg-observer
jest.mock('@sg/sg-observer', () => ({
    render: () => {
        return function decorator(
            _target: any,
            _propertyKey: string,
            descriptor: PropertyDescriptor
        ) {
            return descriptor;
        };
    }
}));

// Setup common global mocks
global.beforeEach(() => {
    jest.clearAllMocks();
});

// Helpers for common test utilities
export const createMockRoundHistory = (roundId: string, hasResult = true, hasSettlement = true) => {
    return {
        roundId,
        result: hasResult ? {
            dice1: 'fish',
            dice2: 'prawn',
            dice3: 'crab'
        } : null,
        settlementResult: hasSettlement ? {
            fish: true
        } : null
    };
};

// Helper to simulate observer update
export const simulateStoreUpdate = (callback: Function, data: any) => {
    callback({ histories: data });
};

// Export mock enum values for tests that need them
export const MockFishPrawnCrabChoices = {
    fish: 'fish',
    prawn: 'prawn',
    crab: 'crab',
    rooster: 'rooster',
    gourd: 'gourd',
    stag: 'stag'
};

export const MockFishPrawnCrabSymbol = {
    FISH: 'fish',
    PRAWN: 'prawn',
    CRAB: 'crab',
    ROOSTER: 'rooster',
    GOURD: 'gourd',
    STAG: 'stag',
    EMPTY: 'empty'
};

export const MockSize = {
    small: 'small',
    medium: 'medium',
    large: 'large'
}; 