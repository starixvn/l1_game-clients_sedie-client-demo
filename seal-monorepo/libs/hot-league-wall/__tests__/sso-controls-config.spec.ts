import { shouldShowSSOControls, getSSOControlsConfig, forceEnableSSOControls } from '../src/_shared/utils/sso-controls-config';

// Mock process.env
const originalEnv = process.env;

describe('SSO Controls Configuration', () => {
    beforeEach(() => {
        // Reset environment variables before each test
        process.env = { ...originalEnv };
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    describe('shouldShowSSOControls', () => {
        it('should return false in production environment', () => {
            // Arrange
            process.env.NODE_ENV = 'production';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":true},"simulatorConfigs":{"enabled":true}}';

            // Act
            const result = shouldShowSSOControls();

            // Assert
            expect(result).toBe(false);
        });

        it('should return true when both simulation mode and simulator configs are enabled', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":true},"simulatorConfigs":{"enabled":true,"defaultGameType":"rng-soccer"}}';

            // Act
            const result = shouldShowSSOControls();

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when simulation mode is disabled', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":false},"simulatorConfigs":{"enabled":true,"defaultGameType":"rng-soccer"}}';

            // Act
            const result = shouldShowSSOControls();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when simulator configs are disabled', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":true},"simulatorConfigs":{"enabled":false,"defaultGameType":"rng-soccer"}}';

            // Act
            const result = shouldShowSSOControls();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when both are disabled', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":false},"simulatorConfigs":{"enabled":false,"defaultGameType":"rng-soccer"}}';

            // Act
            const result = shouldShowSSOControls();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when SIMULATOR_CONFIG is not provided', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            delete process.env.SIMULATOR_CONFIG;

            // Act
            const result = shouldShowSSOControls();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when SIMULATOR_CONFIG is invalid JSON', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.SIMULATOR_CONFIG = 'invalid json';

            // Act
            const result = shouldShowSSOControls();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false in test environment', () => {
            // Arrange
            process.env.NODE_ENV = 'test';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":true},"simulatorConfigs":{"enabled":true}}';

            // Act
            const result = shouldShowSSOControls();

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('forceEnableSSOControls', () => {
        it('should return true in development when no SIMULATOR_CONFIG is provided', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            delete process.env.SIMULATOR_CONFIG;

            // Act
            const result = forceEnableSSOControls();

            // Assert
            expect(result).toBe(true);
        });

        it('should return false in development when SIMULATOR_CONFIG is provided', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":false},"simulatorConfigs":{"enabled":false}}';

            // Act
            const result = forceEnableSSOControls();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false in production even when no SIMULATOR_CONFIG is provided', () => {
            // Arrange
            process.env.NODE_ENV = 'production';
            delete process.env.SIMULATOR_CONFIG;

            // Act
            const result = forceEnableSSOControls();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false in test environment', () => {
            // Arrange
            process.env.NODE_ENV = 'test';
            delete process.env.SIMULATOR_CONFIG;

            // Act
            const result = forceEnableSSOControls();

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('getSSOControlsConfig', () => {
        it('should return complete configuration object', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":true},"simulatorConfigs":{"enabled":true,"defaultGameType":"rng-soccer"}}';

            // Act
            const config = getSSOControlsConfig();

            // Assert
            expect(config).toHaveProperty('showControls');
            expect(config).toHaveProperty('simulatorConfig');
            expect(config).toHaveProperty('environmentVariable');
            expect(config).toHaveProperty('nodeEnv');
            expect(config).toHaveProperty('isDevelopment');
            expect(config).toHaveProperty('isProduction');
            expect(config).toHaveProperty('isTest');
            expect(config.showControls).toBe(true);
            expect(config.nodeEnv).toBe('development');
            expect(config.isDevelopment).toBe(true);
        });

        it('should handle missing SIMULATOR_CONFIG', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            delete process.env.SIMULATOR_CONFIG;

            // Act
            const config = getSSOControlsConfig();

            // Assert
            expect(config.showControls).toBe(false);
            expect(config.simulatorConfig).toBeNull();
            expect(config.environmentVariable).toBeUndefined();
        });
    });

    describe('Integration Scenarios', () => {
        it('should work correctly with start-hot-league:with-sso-controls script', () => {
            // Arrange - Simulate the script configuration
            process.env.NODE_ENV = 'development';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":true},"simulatorConfigs":{"enabled":true,"defaultGameType":"rng-soccer"}}';

            // Act
            const shouldShow = shouldShowSSOControls();
            const forceEnable = forceEnableSSOControls();
            const finalResult = shouldShow || forceEnable;

            // Assert
            expect(shouldShow).toBe(true);
            expect(forceEnable).toBe(false);
            expect(finalResult).toBe(true);
        });

        it('should work correctly with start-hot-league:no-sso-controls script', () => {
            // Arrange - Simulate the script configuration
            process.env.NODE_ENV = 'development';
            process.env.SIMULATOR_CONFIG = '{"simulationMode":{"enabled":false},"simulatorConfigs":{"enabled":false,"defaultGameType":"rng-soccer"}}';

            // Act
            const shouldShow = shouldShowSSOControls();
            const forceEnable = forceEnableSSOControls();
            const finalResult = shouldShow || forceEnable;

            // Assert
            expect(shouldShow).toBe(false);
            expect(forceEnable).toBe(false);
            expect(finalResult).toBe(false);
        });

        it('should fallback to enabled in development when no config provided', () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            delete process.env.SIMULATOR_CONFIG;

            // Act
            const shouldShow = shouldShowSSOControls();
            const forceEnable = forceEnableSSOControls();
            const finalResult = shouldShow || forceEnable;

            // Assert
            expect(shouldShow).toBe(false);
            expect(forceEnable).toBe(true);
            expect(finalResult).toBe(true);
        });
    });
}); 