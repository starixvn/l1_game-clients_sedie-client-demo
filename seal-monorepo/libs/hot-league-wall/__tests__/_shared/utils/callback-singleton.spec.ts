import { CallbackSingleton } from '../../../src/_shared/utils/callback-singleton/callback-singleton';

// Test implementation of CallbackSingleton
class TestCallbackSingleton extends CallbackSingleton<(value: string) => string> {
    private constructor() {
        super();
    }

    public static getInstance(): TestCallbackSingleton {
        if (!TestCallbackSingleton.instance) {
            TestCallbackSingleton.instance = new TestCallbackSingleton();
        }
        return TestCallbackSingleton.instance;
    }

    public static resetInstanceForTesting(): void {
        TestCallbackSingleton.resetInstance();
    }

    public executeCallback(value: string): string | null {
        if (this.hasCallback()) {
            return this.callback!(value);
        }
        return null;
    }
}

describe('CallbackSingleton', () => {
    let singleton: TestCallbackSingleton;
    let mockCallback: jest.Mock;

    beforeEach(() => {
        // Reset the singleton instance before each test
        TestCallbackSingleton.resetInstanceForTesting();
        singleton = TestCallbackSingleton.getInstance();
        mockCallback = jest.fn((value: string) => `processed: ${value}`);
    });

    describe('setCallback', () => {
        it('should set the callback function', () => {
            // Arrange
            const callback = (value: string) => `test: ${value}`;

            // Act
            singleton.setCallback(callback);

            // Assert
            expect(singleton.getCallback()).toBe(callback);
        });

        it('should overwrite existing callback when set again', () => {
            // Arrange
            const callback1 = (value: string) => `first: ${value}`;
            const callback2 = (value: string) => `second: ${value}`;

            // Act
            singleton.setCallback(callback1);
            singleton.setCallback(callback2);

            // Assert
            expect(singleton.getCallback()).toBe(callback2);
            expect(singleton.getCallback()).not.toBe(callback1);
        });
    });

    describe('getCallback', () => {
        it('should return null when no callback is set', () => {
            // Arrange & Act
            const callback = singleton.getCallback();

            // Assert
            expect(callback).toBeNull();
        });

        it('should return the set callback function', () => {
            // Arrange
            const callback = (value: string) => `test: ${value}`;
            singleton.setCallback(callback);

            // Act
            const retrievedCallback = singleton.getCallback();

            // Assert
            expect(retrievedCallback).toBe(callback);
        });
    });

    describe('hasCallback', () => {
        it('should return false when no callback is set', () => {
            // Arrange & Act
            const hasCallback = (singleton as any).hasCallback();

            // Assert
            expect(hasCallback).toBe(false);
        });

        it('should return true when callback is set', () => {
            // Arrange
            singleton.setCallback(mockCallback);

            // Act
            const hasCallback = (singleton as any).hasCallback();

            // Assert
            expect(hasCallback).toBe(true);
        });

        it('should return false when callback is set to null', () => {
            // Arrange
            singleton.setCallback(mockCallback);
            (singleton as any).callback = null;

            // Act
            const hasCallback = (singleton as any).hasCallback();

            // Assert
            expect(hasCallback).toBe(false);
        });
    });

    describe('executeCallback', () => {
        it('should execute the callback when set', () => {
            // Arrange
            singleton.setCallback(mockCallback);
            const testValue = 'test input';

            // Act
            const result = singleton.executeCallback(testValue);

            // Assert
            expect(result).toBe('processed: test input');
            expect(mockCallback).toHaveBeenCalledWith(testValue);
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('should return null when no callback is set', () => {
            // Arrange
            const testValue = 'test input';

            // Act
            const result = singleton.executeCallback(testValue);

            // Assert
            expect(result).toBeNull();
            expect(mockCallback).not.toHaveBeenCalled();
        });

        it('should handle callback that returns null', () => {
            // Arrange
            const nullCallback = jest.fn(() => null as any);
            singleton.setCallback(nullCallback);
            const testValue = 'test input';

            // Act
            const result = singleton.executeCallback(testValue);

            // Assert
            expect(result).toBeNull();
            expect(nullCallback).toHaveBeenCalledWith(testValue);
        });
    });

    describe('singleton pattern', () => {
        it('should maintain singleton pattern', () => {
            // Arrange & Act
            const instance1 = TestCallbackSingleton.getInstance();
            const instance2 = TestCallbackSingleton.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
        });

        it('should share callback state between instances', () => {
            // Arrange
            const instance1 = TestCallbackSingleton.getInstance();
            const instance2 = TestCallbackSingleton.getInstance();
            const callback = (value: string) => `shared: ${value}`;

            // Act
            instance1.setCallback(callback);

            // Assert
            expect(instance2.getCallback()).toBe(callback);
        });
    });

    describe('resetInstance', () => {
        it('should reset callback when instance is reset', () => {
            // Arrange
            singleton.setCallback(mockCallback);
            expect(singleton.getCallback()).toBe(mockCallback);

            // Act
            TestCallbackSingleton.resetInstanceForTesting();
            const newInstance = TestCallbackSingleton.getInstance();

            // Assert
            expect(newInstance.getCallback()).toBeNull();
        });
    });
}); 