import { BaseSingleton } from '../../../src/_shared/utils/callback-singleton/base-singleton';

// Test implementation of BaseSingleton
class TestSingleton extends BaseSingleton {
    private constructor() {
        super();
    }

    public static getInstance(): TestSingleton {
        if (!TestSingleton.instance) {
            TestSingleton.instance = new TestSingleton();
        }
        return TestSingleton.instance;
    }

    public static resetInstanceForTesting(): void {
        TestSingleton.resetInstance();
    }
}

describe('BaseSingleton', () => {
    beforeEach(() => {
        // Reset the singleton instance before each test
        TestSingleton.resetInstanceForTesting();
    });

    describe('getInstance', () => {
        it('should return the same instance on multiple calls', () => {
            // Arrange
            const instance1 = TestSingleton.getInstance();
            const instance2 = TestSingleton.getInstance();

            // Act & Assert
            expect(instance1).toBe(instance2);
        });

        it('should create a new instance when instance is undefined', () => {
            // Arrange & Act
            const instance = TestSingleton.getInstance();

            // Assert
            expect(instance).toBeInstanceOf(TestSingleton);
        });

        it('should maintain singleton pattern across multiple getInstance calls', () => {
            // Arrange & Act
            const instance1 = TestSingleton.getInstance();
            const instance2 = TestSingleton.getInstance();
            const instance3 = TestSingleton.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
        });
    });

    describe('resetInstance', () => {
        it('should reset the singleton instance', () => {
            // Arrange
            const instance1 = TestSingleton.getInstance();
            expect(instance1).toBeInstanceOf(TestSingleton);

            // Act
            TestSingleton.resetInstanceForTesting();
            const instance2 = TestSingleton.getInstance();

            // Assert
            expect(instance2).toBeInstanceOf(TestSingleton);
            expect(instance2).not.toBe(instance1);
        });

        it('should allow creating new instance after reset', () => {
            // Arrange
            const originalInstance = TestSingleton.getInstance();

            // Act
            TestSingleton.resetInstanceForTesting();
            const newInstance = TestSingleton.getInstance();

            // Assert
            expect(newInstance).not.toBe(originalInstance);
            expect(newInstance).toBeInstanceOf(TestSingleton);
        });
    });
}); 