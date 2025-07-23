import { TokenRequestManager } from '../../../src/_shared/utils/callback-singleton/token-request-manager';

describe('TokenRequestManager', () => {
    let manager: TokenRequestManager;
    let mockCallback: jest.Mock;

    beforeEach(() => {
        // Reset the singleton instance before each test
        (TokenRequestManager as any).instance = undefined;
        manager = TokenRequestManager.getInstance();
        mockCallback = jest.fn().mockResolvedValue('test-token');
    });

    describe('getInstance', () => {
        it('should return the same instance on multiple calls', () => {
            // Arrange & Act
            const instance1 = TokenRequestManager.getInstance();
            const instance2 = TokenRequestManager.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
        });

        it('should create a new instance when instance is undefined', () => {
            // Arrange & Act
            const instance = TokenRequestManager.getInstance();

            // Assert
            expect(instance).toBeInstanceOf(TokenRequestManager);
        });

        it('should maintain singleton pattern across multiple getInstance calls', () => {
            // Arrange & Act
            const instance1 = TokenRequestManager.getInstance();
            const instance2 = TokenRequestManager.getInstance();
            const instance3 = TokenRequestManager.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
        });
    });

    describe('setTokenRequestCallback', () => {
        it('should set the token request callback', () => {
            // Arrange
            const callback = () => Promise.resolve('test-token');

            // Act
            manager.setTokenRequestCallback(callback);

            // Assert
            expect(manager.getTokenRequestCallback()).toBe(callback);
        });

        it('should overwrite existing callback when set again', () => {
            // Arrange
            const callback1 = () => Promise.resolve('token1');
            const callback2 = () => Promise.resolve('token2');

            // Act
            manager.setTokenRequestCallback(callback1);
            manager.setTokenRequestCallback(callback2);

            // Assert
            expect(manager.getTokenRequestCallback()).toBe(callback2);
            expect(manager.getTokenRequestCallback()).not.toBe(callback1);
        });
    });

    describe('getTokenRequestCallback', () => {
        it('should return null when no callback is set', () => {
            // Arrange & Act
            const callback = manager.getTokenRequestCallback();

            // Assert
            expect(callback).toBeNull();
        });

        it('should return the set callback function', () => {
            // Arrange
            const callback = () => Promise.resolve('test-token');
            manager.setTokenRequestCallback(callback);

            // Act
            const retrievedCallback = manager.getTokenRequestCallback();

            // Assert
            expect(retrievedCallback).toBe(callback);
        });
    });

    describe('executeTokenRequest', () => {
        it('should execute the callback and return token when callback is set', async () => {
            // Arrange
            const expectedToken = 'test-token-123';
            const callback = jest.fn().mockResolvedValue(expectedToken);
            manager.setTokenRequestCallback(callback);

            // Act
            const result = await manager.executeTokenRequest();

            // Assert
            expect(result).toBe(expectedToken);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should return null when no callback is set', async () => {
            // Arrange & Act
            const result = await manager.executeTokenRequest();

            // Assert
            expect(result).toBeNull();
        });

        it('should return null when callback returns null', async () => {
            // Arrange
            const callback = jest.fn().mockResolvedValue(null);
            manager.setTokenRequestCallback(callback);

            // Act
            const result = await manager.executeTokenRequest();

            // Assert
            expect(result).toBeNull();
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from callback', async () => {
            // Arrange
            const error = new Error('Token request failed');
            const callback = jest.fn().mockRejectedValue(error);
            manager.setTokenRequestCallback(callback);

            // Act & Assert
            await expect(manager.executeTokenRequest()).rejects.toThrow('Token request failed');
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should handle async callback that throws error', async () => {
            // Arrange
            const error = new Error('Network error');
            const callback = jest.fn().mockImplementation(() => {
                throw error;
            });
            manager.setTokenRequestCallback(callback);

            // Act & Assert
            await expect(manager.executeTokenRequest()).rejects.toThrow('Network error');
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('integration with CallbackSingleton', () => {
        it('should use CallbackSingleton base functionality', () => {
            // Arrange
            const callback = () => Promise.resolve('test');

            // Act
            manager.setTokenRequestCallback(callback);

            // Assert
            expect(manager.getTokenRequestCallback()).toBe(callback);
            expect((manager as any).hasCallback()).toBe(true);
        });

        it('should handle callback state through base class', () => {
            // Arrange
            expect((manager as any).hasCallback()).toBe(false);

            // Act
            manager.setTokenRequestCallback(mockCallback);

            // Assert
            expect((manager as any).hasCallback()).toBe(true);
        });
    });
}); 