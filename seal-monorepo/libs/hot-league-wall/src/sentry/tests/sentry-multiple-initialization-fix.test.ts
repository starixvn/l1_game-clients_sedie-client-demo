import { jest } from '@jest/globals';
import * as Sentry from '@sentry/react';
import { initializeSentryWithSessionReplay, configureSessionReplayForEnvironment } from '../core/sentry-session-replay';
import { SentryManager } from '../core/sentry-manager';

// Mock Sentry
jest.mock('@sentry/react', () => ({
    init: jest.fn(),
    replayIntegration: jest.fn(() => ({})),
    setContext: jest.fn(),
    setTag: jest.fn(),
    setUser: jest.fn(),
}));

// Mock window object
const mockWindow = {
    __SENTRY_INITIALIZED__: false,
};

Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true,
});

describe('Sentry Multiple Initialization Fix', () => {
    beforeEach(() => {
        // Reset mocks and global state
        jest.clearAllMocks();
        mockWindow.__SENTRY_INITIALIZED__ = false;

        // Reset SentryManager singleton
        (SentryManager as any).instance = undefined;
    });

    afterEach(() => {
        // Clean up global state
        mockWindow.__SENTRY_INITIALIZED__ = false;
    });

    describe('initializeSentryWithSessionReplay', () => {
        it('should initialize Sentry with Session Replay on first call', () => {
            // Arrange
            const config = configureSessionReplayForEnvironment('development');

            // Act
            initializeSentryWithSessionReplay(config);

            // Assert
            expect(Sentry.init).toHaveBeenCalledTimes(1);
            expect(mockWindow.__SENTRY_INITIALIZED__).toBe(true);
        });

        it('should not initialize Sentry again on subsequent calls', () => {
            // Arrange
            const config = configureSessionReplayForEnvironment('development');

            // Act - First call
            initializeSentryWithSessionReplay(config);

            // Act - Second call
            initializeSentryWithSessionReplay(config);

            // Assert
            expect(Sentry.init).toHaveBeenCalledTimes(1);
            expect(mockWindow.__SENTRY_INITIALIZED__).toBe(true);
        });

        it('should log warning when trying to initialize multiple times', () => {
            // Arrange
            const config = configureSessionReplayForEnvironment('development');
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Act - First call
            initializeSentryWithSessionReplay(config);

            // Act - Second call
            initializeSentryWithSessionReplay(config);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(
                'Sentry is already initialized. Skipping Session Replay initialization to prevent multiple instances.'
            );

            consoleSpy.mockRestore();
        });

        it('should handle initialization errors gracefully', () => {
            // Arrange
            const config = configureSessionReplayForEnvironment('development');
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            (Sentry.init as jest.Mock).mockImplementation(() => {
                throw new Error('Initialization failed');
            });

            // Act
            initializeSentryWithSessionReplay(config);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to initialize Sentry with Session Replay:',
                expect.any(Error)
            );
            expect(mockWindow.__SENTRY_INITIALIZED__).toBe(false);

            consoleSpy.mockRestore();
        });
    });

    describe('SentryManager', () => {
        it('should not initialize Sentry if already initialized by Session Replay', () => {
            // Arrange
            const config = {
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent',
                release: 'test-release',
                debug: false,
                logLevel: 'error' as const,
            };

            // Set the global flag as if Sentry was already initialized
            mockWindow.__SENTRY_INITIALIZED__ = true;

            // Act
            const sentryManager = SentryManager.getInstance();
            sentryManager.initialize(config);

            // Assert
            expect(Sentry.init).not.toHaveBeenCalled();
        });

        it('should log warning when trying to initialize after Session Replay', () => {
            // Arrange
            const config = {
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent',
                release: 'test-release',
                debug: false,
                logLevel: 'error' as const,
            };
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Set the global flag as if Sentry was already initialized
            mockWindow.__SENTRY_INITIALIZED__ = true;

            // Act
            const sentryManager = SentryManager.getInstance();
            sentryManager.initialize(config);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(
                'Sentry is already initialized. Skipping SentryManager initialization to prevent multiple instances.'
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Integration Test', () => {
        it('should handle the complete initialization flow without multiple instances', () => {
            // Arrange
            const sessionReplayConfig = configureSessionReplayForEnvironment('development');
            const sentryManagerConfig = {
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent',
                release: 'test-release',
                debug: false,
                logLevel: 'error' as const,
            };

            // Act - Initialize Session Replay first
            initializeSentryWithSessionReplay(sessionReplayConfig);

            // Act - Try to initialize SentryManager
            const sentryManager = SentryManager.getInstance();
            sentryManager.initialize(sentryManagerConfig);

            // Assert
            expect(Sentry.init).toHaveBeenCalledTimes(1);
            expect(mockWindow.__SENTRY_INITIALIZED__).toBe(true);
        });

        it('should handle the reverse initialization flow', () => {
            // Arrange
            const sessionReplayConfig = configureSessionReplayForEnvironment('development');
            const sentryManagerConfig = {
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent',
                release: 'test-release',
                debug: false,
                logLevel: 'error' as const,
            };

            // Act - Initialize SentryManager first
            const sentryManager = SentryManager.getInstance();
            sentryManager.initialize(sentryManagerConfig);

            // Act - Try to initialize Session Replay
            initializeSentryWithSessionReplay(sessionReplayConfig);

            // Assert
            expect(Sentry.init).toHaveBeenCalledTimes(1);
            expect(mockWindow.__SENTRY_INITIALIZED__).toBe(true);
        });
    });

    describe('Environment Configuration', () => {
        it('should configure development environment correctly', () => {
            // Arrange & Act
            const config = configureSessionReplayForEnvironment('development');

            // Assert
            expect(config.environment).toBe('development');
            expect(config.debug).toBe(true);
            expect(config.maskAllText).toBe(false);
            expect(config.blockAllMedia).toBe(false);
            expect(config.sendDefaultPii).toBe(true);
        });

        it('should configure production environment correctly', () => {
            // Arrange & Act
            const config = configureSessionReplayForEnvironment('production');

            // Assert
            expect(config.environment).toBe('production');
            expect(config.debug).toBe(false);
            expect(config.maskAllText).toBe(true);
            expect(config.blockAllMedia).toBe(true);
            expect(config.sendDefaultPii).toBe(false);
        });

        it('should configure test environment correctly', () => {
            // Arrange & Act
            const config = configureSessionReplayForEnvironment('test');

            // Assert
            expect(config.environment).toBe('test');
            expect(config.debug).toBe(false);
            expect(config.replaysSessionSampleRate).toBe(0.0);
            expect(config.replaysOnErrorSampleRate).toBe(0.0);
            expect(config.maskAllText).toBe(true);
            expect(config.blockAllMedia).toBe(true);
            expect(config.sendDefaultPii).toBe(false);
        });
    });
}); 