import { LocalStorage, Memory, StorageManager, localStorageKeys } from 'libs/saba-games/src/_shared/utils/storage-manager';

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
});

// Mock window.localMemory
Object.defineProperty(window, 'localMemory', {
    value: {},
    writable: true
});

describe('storage-manager', () => {
    beforeEach(() => {
        // Reset mocks and storage before each test
        jest.clearAllMocks();
        window.localMemory = {};
        StorageManager.supportStorage = undefined as any;
        StorageManager.prefixKey = undefined as any;
    });

    describe('LocalStorage', () => {
        let localStorage: LocalStorage;

        beforeEach(() => {
            localStorage = new LocalStorage();
        });

        it('should set and get items correctly', () => {
            const testKey = 'testKey';
            const testValue = { data: 'test' };

            localStorage.set(testKey, testValue);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, JSON.stringify(testValue));

            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(testValue));
            const result = localStorage.get(testKey);
            expect(result).toEqual(testValue);
        });

        it('should handle invalid JSON when getting items', () => {
            const testKey = 'testKey';
            mockLocalStorage.getItem.mockReturnValueOnce('invalid json');

            const result = localStorage.get(testKey);
            expect(result).toBeNull();
        });

        it('should remove items correctly', () => {
            const testKey = 'testKey';
            localStorage.remove(testKey);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(testKey);
        });

        it('should check availability correctly', () => {
            // Test available case
            const result1 = localStorage.isAvailable();
            expect(result1).toBe(true);

            // Test unavailable case
            mockLocalStorage.setItem.mockImplementationOnce(() => {
                throw new Error('Storage not available');
            });
            const result2 = localStorage.isAvailable();
            expect(result2).toBe(false);
        });
    });

    describe('Memory', () => {
        let memory: Memory;

        beforeEach(() => {
            memory = new Memory();
        });

        it('should set and get items correctly', () => {
            const testKey = 'testKey';
            const testValue = { data: 'test' };

            memory.set(testKey, testValue);
            expect(window.localMemory[testKey]).toEqual(testValue);

            const result = memory.get(testKey);
            expect(result).toEqual(testValue);
        });

        it('should return null for non-existent items', () => {
            const result = memory.get('nonExistentKey');
            expect(result).toBeNull();
        });

        it('should remove items correctly', () => {
            const testKey = 'testKey';
            const testValue = { data: 'test' };
            window.localMemory[testKey] = testValue;

            memory.remove(testKey);
            expect(window.localMemory[testKey]).toBeUndefined();
        });

        it('should always be available', () => {
            expect(memory.isAvailable()).toBe(true);
        });
    });

    describe('StorageManager', () => {
        beforeEach(() => {
            // Reset storage manager state
            StorageManager.supportStorage = undefined as any;
            StorageManager.prefixKey = undefined as any;
        });

        it('should initialize with LocalStorage when available', () => {
            const storage = StorageManager.getCurrentStorage();
            expect(storage).toBeInstanceOf(LocalStorage);
        });

        it('should initialize with Memory when LocalStorage is not available', () => {
            mockLocalStorage.setItem.mockImplementationOnce(() => {
                throw new Error('Storage not available');
            });

            const storage = StorageManager.getCurrentStorage();
            expect(storage).toBeInstanceOf(Memory);
        });

        it('should use prefix key when set', () => {
            const prefix = 'testPrefix';
            StorageManager.setPrefixKey(prefix);

            const testKey = 'testKey';
            const testValue = { data: 'test' };

            StorageManager.set(testKey, testValue);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                `${prefix}_${testKey}`,
                JSON.stringify(testValue)
            );
        });

        it('should get and set items correctly', () => {
            const testKey = 'testKey';
            const testValue = { data: 'test' };

            StorageManager.set(testKey, testValue);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                testKey,
                JSON.stringify(testValue)
            );

            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(testValue));
            const result = StorageManager.get(testKey);
            expect(result).toEqual(testValue);
        });

        it('should remove items correctly', () => {
            const testKey = 'testKey';
            StorageManager.remove(testKey);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(testKey);
        });
    });

    describe('localStorageKeys', () => {
        it('should have correct keys defined', () => {
            expect(localStorageKeys).toEqual({
                isAuthorized: 'isAuthorized',
                betHistory: 'betHistory'
            });
        });
    });
}); 
