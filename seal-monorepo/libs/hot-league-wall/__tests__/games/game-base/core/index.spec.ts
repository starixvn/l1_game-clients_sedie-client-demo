// Mock the dependencies before imports
jest.mock('../../../../src/games/game-base/core/game-base.core', () => {
    const mockGameBase = function () { };
    return {
        __esModule: true,
        default: mockGameBase
    };
});

// Import after mocks are defined
import GameBase from '../../../../src/games/game-base/core/game-base.core';
import CoreModule from '../../../../src/games/game-base/core';

describe('Core index', () => {
    test('should export GameBase as default', () => {
        // Assert
        expect(CoreModule).toBe(GameBase);
    });
}); 