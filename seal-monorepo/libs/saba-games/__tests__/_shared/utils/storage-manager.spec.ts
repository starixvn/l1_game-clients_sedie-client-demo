import { LocalStorage, Memory, StorageManager, localStorageKeys } from '../../../src/_shared/utils/storage-manager';

describe('StorageManager Utility', () => {
    let mockLocalStorage: { [key: string]: string };
    let mockWindow: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock localStorage
        mockLocalStorage = {};
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
                setItem: jest.fn((key: string, value: string) => {
                    mockLocalStorage[key] = value;
                }),
                removeItem: jest.fn((key: string) => {
                    delete mockLocalStorage[key];
                }),
            },
            writable: true,
        });

        // Mock window.localMemory
        mockWindow = {
            localMemory: {},
        };
        Object.defineProperty(window, 'localMemory', {
            value: mockWindow.localMemory,
            writable: true,
        });

        // Reset StorageManager state
        (StorageManager as any).supportStorage = undefined;
        StorageManager.prefixKey = '';
    });

    describe('LocalStorage_withValidOperations_shouldWorkCorrectly', () => {
        it('should set and get string values', () => {
            // Arrange
            const storage = new LocalStorage();
            const key = 'test-key';
            const value = 'test-value';

            // Act
            storage.set(key, value);
            const result = storage.get(key);

            // Assert
            expect(result).toBe(value);
            expect(window.localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
            expect(window.localStorage.getItem).toHaveBeenCalledWith(key);
        });

        it('should set and get object values', () => {
            // Arrange
            const storage = new LocalStorage();
            const key = 'test-key';
            const value = { name: 'test', id: 123 };

            // Act
            storage.set(key, value);
            const result = storage.get(key);

            // Assert
            expect(result).toEqual(value);
            expect(window.localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
        });

        it('should remove items correctly', () => {
            // Arrange
            const storage = new LocalStorage();
            const key = 'test-key';
            const value = 'test-value';
            storage.set(key, value);

            // Act
            storage.remove(key);
            const result = storage.get(key);

            // Assert
            expect(result).toBeNull();
            expect(window.localStorage.removeItem).toHaveBeenCalledWith(key);
        });

        it('should return null for non-existent keys', () => {
            // Arrange
            const storage = new LocalStorage();
            const key = 'non-existent-key';

            // Act
            const result = storage.get(key);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('LocalStorage_errorHandling_shouldHandleGracefully', () => {
        it('should handle JSON parse errors gracefully', () => {
            // Arrange
            const storage = new LocalStorage();
            const key = 'test-key';
            const invalidJson = 'invalid-json';
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Mock localStorage to return invalid JSON
            (window.localStorage.getItem as jest.Mock).mockReturnValue(invalidJson);

            // Act
            const result = storage.get(key);

            // Assert
            expect(result).toBeNull();
            expect(consoleWarnSpy).toHaveBeenCalledWith(`LocalStorage ${key} can not parse`);
        });

        it('should handle localStorage availability check', () => {
            // Arrange
            const storage = new LocalStorage();

            // Act
            const isAvailable = storage.isAvailable();

            // Assert
            expect(isAvailable).toBe(true);
            expect(window.localStorage.setItem).toHaveBeenCalledWith('test storage', 'test storage');
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('test storage');
        });

        it('should return false when localStorage is not available', () => {
            // Arrange
            const storage = new LocalStorage();
            (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
                throw new Error('localStorage not available');
            });

            // Act
            const isAvailable = storage.isAvailable();

            // Assert
            expect(isAvailable).toBe(false);
        });
    });

    describe('Memory_withValidOperations_shouldWorkCorrectly', () => {
        it('should set and get values', () => {
            // Arrange
            const storage = new Memory();
            const key = 'test-key';
            const value = 'test-value';

            // Act
            storage.set(key, value);
            const result = storage.get(key);

            // Assert
            expect(result).toBe(value);
            expect(storage.localMemory[key]).toBe(value);
        });

        it('should set and get object values', () => {
            // Arrange
            const storage = new Memory();
            const key = 'test-key';
            const value = { name: 'test', id: 123 };

            // Act
            storage.set(key, value);
            const result = storage.get(key);

            // Assert
            expect(result).toEqual(value);
            expect(storage.localMemory[key]).toEqual(value);
        });

        it('should remove items correctly', () => {
            // Arrange
            const storage = new Memory();
            const key = 'test-key';
            const value = 'test-value';
            storage.set(key, value);

            // Act
            storage.remove(key);
            const result = storage.get(key);

            // Assert
            expect(result).toBeNull();
            expect(storage.localMemory[key]).toBeUndefined();
        });

        it('should return null for non-existent keys', () => {
            // Arrange
            const storage = new Memory();
            const key = 'non-existent-key';

            // Act
            const result = storage.get(key);

            // Assert
            expect(result).toBeNull();
        });

        it('should always be available', () => {
            // Arrange
            const storage = new Memory();

            // Act
            const isAvailable = storage.isAvailable();

            // Assert
            expect(isAvailable).toBe(true);
        });
    });

    describe('StorageManager_withValidOperations_shouldWorkCorrectly', () => {
        it('should initialize with available storage', () => {
            // Arrange
            // Act
            const storage = StorageManager.getCurrentStorage();

            // Assert
            expect(storage).toBeInstanceOf(LocalStorage);
        });

        it('should get values with prefix', () => {
            // Arrange
            StorageManager.setPrefixKey('test-prefix');
            const key = 'test-key';
            const value = 'test-value';
            StorageManager.set(key, value);

            // Act
            const result = StorageManager.get(key);

            // Assert
            expect(result).toBe(value);
            expect(window.localStorage.setItem).toHaveBeenCalledWith('test-prefix_test-key', JSON.stringify(value));
        });

        it('should set values with prefix', () => {
            // Arrange
            StorageManager.setPrefixKey('test-prefix');
            const key = 'test-key';
            const value = 'test-value';

            // Act
            StorageManager.set(key, value);

            // Assert
            expect(window.localStorage.setItem).toHaveBeenCalledWith('test-prefix_test-key', JSON.stringify(value));
        });

        it('should remove values with prefix', () => {
            // Arrange
            StorageManager.setPrefixKey('test-prefix');
            const key = 'test-key';

            // Act
            StorageManager.remove(key);

            // Assert
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('test-prefix_test-key');
        });

        it('should work without prefix', () => {
            // Arrange
            StorageManager.prefixKey = '';
            const key = 'test-key';
            const value = 'test-value';

            // Act
            StorageManager.set(key, value);

            // Assert
            expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(value));
        });
    });

    describe('StorageManager_edgeCases_shouldHandleGracefully', () => {
        it('should handle null values', () => {
            // Arrange
            const key = 'test-key';
            const value = null;

            // Act
            StorageManager.set(key, value as any);
            const result = StorageManager.get(key);

            // Assert
            expect(result).toBeNull();
        });

        it('should handle undefined values', () => {
            // Arrange
            const key = 'test-key';
            const value = undefined;

            // Act
            StorageManager.set(key, value as any);
            const result = StorageManager.get(key);

            // Assert
            expect(result).toBeNull();
        });

        it('should handle empty string values', () => {
            // Arrange
            const key = 'test-key';
            const value = '';

            // Act
            StorageManager.set(key, value);
            const result = StorageManager.get(key);

            // Assert
            expect(result).toBe('');
        });

        it('should handle complex object values', () => {
            // Arrange
            const key = 'test-key';
            const value = {
                nested: {
                    array: [1, 2, 3],
                    string: 'test',
                    number: 123,
                    boolean: true,
                },
            };

            // Act
            StorageManager.set(key, value);
            const result = StorageManager.get(key);

            // Assert
            expect(result).toEqual(value);
        });
    });

    describe('StorageManager_fallback_shouldUseMemoryStorage', () => {
        it('should fallback to Memory storage when localStorage is not available', () => {
            // Arrange
            (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
                throw new Error('localStorage not available');
            });

            // Act
            const storage = StorageManager.getCurrentStorage();

            // Assert
            expect(storage).toBeInstanceOf(Memory);
        });

        it('should work with Memory storage fallback', () => {
            // Arrange
            (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
                throw new Error('localStorage not available');
            });
            const key = 'test-key';
            const value = 'test-value';

            // Act
            StorageManager.set(key, value);
            const result = StorageManager.get(key);

            // Assert
            expect(result).toBe(value);
            // Note: We can't easily test the memory storage in this context
            // as it's created internally by StorageManager
        });
    });

    describe('StorageManager_integration_shouldWorkWithRealData', () => {
        it('should handle localStorageKeys constants', () => {
            // Arrange
            const value = { authorized: true };

            // Act
            StorageManager.set(localStorageKeys.isAuthorized, value);
            const result = StorageManager.get(localStorageKeys.isAuthorized);

            // Assert
            expect(result).toEqual(value);
        });

        it('should handle bet history data', () => {
            // Arrange
            const betHistory = [
                { id: 1, amount: 100, result: 'win' },
                { id: 2, amount: 50, result: 'loss' },
            ];

            // Act
            StorageManager.set(localStorageKeys.betHistory, betHistory);
            const result = StorageManager.get(localStorageKeys.betHistory);

            // Assert
            expect(result).toEqual(betHistory);
        });
    });

    describe('StorageManager_performance_shouldBeEfficient', () => {
        it('should reuse storage instance', () => {
            // Arrange
            // Act
            const storage1 = StorageManager.getCurrentStorage();
            const storage2 = StorageManager.getCurrentStorage();

            // Assert
            expect(storage1).toBe(storage2);
        });

        it('should not reinitialize storage unnecessarily', () => {
            // Arrange
            // Reset storage to force reinitialization
            (StorageManager as any).supportStorage = undefined;

            // Act
            StorageManager.getCurrentStorage();
            StorageManager.getCurrentStorage();

            // Assert
            // The storage should be the same instance
            const storage1 = StorageManager.getCurrentStorage();
            const storage2 = StorageManager.getCurrentStorage();
            expect(storage1).toBe(storage2);
        });
    });

    describe('StorageManager_accessibility_shouldBeAccessible', () => {
        it('should have proper interface implementation', () => {
            // Arrange
            const storage = new LocalStorage();

            // Assert
            expect(typeof storage.remove).toBe('function');
            expect(typeof storage.get).toBe('function');
            expect(typeof storage.set).toBe('function');
            expect(typeof storage.isAvailable).toBe('function');
        });

        it('should have proper static methods', () => {
            // Assert
            expect(typeof StorageManager.getCurrentStorage).toBe('function');
            expect(typeof StorageManager.get).toBe('function');
            expect(typeof StorageManager.set).toBe('function');
            expect(typeof StorageManager.remove).toBe('function');
            expect(typeof StorageManager.setPrefixKey).toBe('function');
            expect(typeof StorageManager.getName).toBe('function');
        });
    });

    describe('StorageManager_constants_shouldBeCorrect', () => {
        it('should have correct localStorageKeys values', () => {
            // Assert
            expect(localStorageKeys.isAuthorized).toBe('isAuthorized');
            expect(localStorageKeys.betHistory).toBe('betHistory');
        });

        it('should have proper key structure', () => {
            // Assert
            expect(typeof localStorageKeys.isAuthorized).toBe('string');
            expect(typeof localStorageKeys.betHistory).toBe('string');
        });
    });
}); 