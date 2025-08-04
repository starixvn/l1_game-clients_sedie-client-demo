import axios from 'axios';
import {
    requestSSO,
    requestSSOWithRedirectUrl,
    getDynamicDomain,
    randomIntFromInterval,
    randomPlayerId
} from './sso-helper';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock app settings
jest.mock('../app-settings', () => ({
    getEnvironmentConfig: jest.fn(() => ({
        systemType: 'SG',
        serverDomain: 'lumigame.com',
        ssl: true,
        subDomain: 'l1-proxy1',
        simulatorConfigs: {
            gameLobbySimulatorUrl: 'https://l1-glbs1.lumigame.com',
            owApiSimulatorUrl: 'https://l1-ows1.lumigame.com/SabaClub',
            operatorId: 'ONEworks1',
            operatorSecret: 'ONEworks1@20luminet&',
            operatorToken: 'ONEworks1Token'
        }
    })),
    requestSSO_SITE_ID: 'VIVA88',
    reuqestSSO_APP_ENV: 'LOCAL'
}));

// Mock global window object
Object.defineProperty(window, 'location', {
    value: {
        search: '?playerId=1234567&currency=USD'
    },
    writable: true
});

Object.defineProperty(window, 'navigator', {
    value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    writable: true
});

describe('SSO Helper Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset window.location.search
        Object.defineProperty(window, 'location', {
            value: {
                search: '?playerId=1234567&currency=USD'
            },
            writable: true
        });
    });

    describe('randomIntFromInterval', () => {
        it('should return a random integer within the specified range', () => {
            // Arrange
            const min = 1;
            const max = 10;

            // Act
            const result = randomIntFromInterval(min, max);

            // Assert
            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
            expect(Number.isInteger(result)).toBe(true);
        });

        it('should handle edge cases with same min and max values', () => {
            // Arrange
            const min = 5;
            const max = 5;

            // Act
            const result = randomIntFromInterval(min, max);

            // Assert
            expect(result).toBe(5);
        });

        it('should handle negative ranges', () => {
            // Arrange
            const min = -10;
            const max = -1;

            // Act
            const result = randomIntFromInterval(min, max);

            // Assert
            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
        });
    });

    describe('getDynamicDomain', () => {
        it('should construct domain with HTTPS when SSL is enabled', () => {
            // Arrange & Act
            const result = getDynamicDomain();

            // Assert
            expect(result).toBe('https://l1-proxy1.lumigame.com');
        });

        it('should construct domain with HTTP when SSL is disabled', () => {
            // Arrange
            jest.doMock('../app-settings', () => ({
                getEnvironmentConfig: jest.fn(() => ({
                    ssl: false,
                    subDomain: 'l1-proxy1',
                    serverDomain: 'lumigame.com'
                }))
            }));

            // Act
            const result = getDynamicDomain();

            // Assert
            expect(result).toBe('http://l1-proxy1.lumigame.com');
        });
    });

    describe('requestSSO', () => {
        it('should successfully request SSO token with valid parameters', async () => {
            // Arrange
            const mockSsoResponse = {
                data: {
                    token: 'test-token-123',
                    redirectUrl: 'https://example.com/redirect?token=test-token-123'
                }
            };
            const mockCreateCustomerResponse = { data: { success: true } };
            const mockAssignBalanceResponse = { data: { success: true } };

            mockedAxios.post
                .mockResolvedValueOnce(mockSsoResponse)
                .mockResolvedValueOnce(mockCreateCustomerResponse)
                .mockResolvedValueOnce(mockAssignBalanceResponse);

            // Act
            const result = await requestSSO();

            // Assert
            expect(mockedAxios.post).toHaveBeenCalledTimes(3);
            expect(result).toEqual(mockSsoResponse.data);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://l1-glbs1.lumigame.com/signin/sso',
                expect.objectContaining({
                    playerId: 1234567,
                    currency: 'USD',
                    appType: 6
                })
            );
        });

        it('should use default currency when not provided in URL', async () => {
            // Arrange
            Object.defineProperty(window, 'location', {
                value: { search: '?playerId=1234567' },
                writable: true
            });

            const mockSsoResponse = {
                data: {
                    token: 'test-token-123',
                    redirectUrl: 'https://example.com/redirect?token=test-token-123'
                }
            };
            const mockCreateCustomerResponse = { data: { success: true } };
            const mockAssignBalanceResponse = { data: { success: true } };

            mockedAxios.post
                .mockResolvedValueOnce(mockSsoResponse)
                .mockResolvedValueOnce(mockCreateCustomerResponse)
                .mockResolvedValueOnce(mockAssignBalanceResponse);

            // Act
            const result = await requestSSO();

            // Assert
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://l1-glbs1.lumigame.com/signin/sso',
                expect.objectContaining({
                    currency: '$US' // Default currency for SG system
                })
            );
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            const mockError = new Error('Network error');
            mockedAxios.post.mockRejectedValueOnce(mockError);

            // Act & Assert
            await expect(requestSSO()).rejects.toThrow('Network error');
        });

        it('should use random player ID when not provided in URL', async () => {
            // Arrange
            Object.defineProperty(window, 'location', {
                value: { search: '' },
                writable: true
            });

            const mockSsoResponse = {
                data: {
                    token: 'test-token-123',
                    redirectUrl: 'https://example.com/redirect?token=test-token-123'
                }
            };
            const mockCreateCustomerResponse = { data: { success: true } };
            const mockAssignBalanceResponse = { data: { success: true } };

            mockedAxios.post
                .mockResolvedValueOnce(mockSsoResponse)
                .mockResolvedValueOnce(mockCreateCustomerResponse)
                .mockResolvedValueOnce(mockAssignBalanceResponse);

            // Act
            const result = await requestSSO();

            // Assert
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://l1-glbs1.lumigame.com/signin/sso',
                expect.objectContaining({
                    playerId: expect.any(Number),
                    playerName: expect.stringMatching(/^username_\d+$/)
                })
            );
        });
    });

    describe('requestSSOWithRedirectUrl', () => {
        it('should successfully request SSO and construct redirect URL on client side', async () => {
            // Arrange
            const mockSsoResponse = {
                data: {
                    token: 'test-token-123',
                    redirectUrl: 'https://example.com/redirect?token=test-token-123'
                }
            };
            const mockCreateCustomerResponse = { data: { success: true } };
            const mockAssignBalanceResponse = { data: { success: true } };

            mockedAxios.post
                .mockResolvedValueOnce(mockSsoResponse)
                .mockResolvedValueOnce(mockCreateCustomerResponse)
                .mockResolvedValueOnce(mockAssignBalanceResponse);

            // Act
            const result = await requestSSOWithRedirectUrl();

            // Assert
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://l1-glbs1.lumigame.com/signin/sso',
                expect.objectContaining({
                    playerId: 1234567,
                    currency: 'USD',
                    appType: 6
                })
            );
            expect(result).toEqual({
                token: 'test-token-123',
                redirectUrl: 'https://l1-proxy1.lumigame.com/?token=test-token-123&lang=vi-VN&appType=6&op=sg&cg=GrUSD',
                domain: 'https://l1-proxy1.lumigame.com'
            });
        });

        it('should handle gameId parameter correctly', async () => {
            // Arrange
            const gameId = 123;
            const mockSsoResponse = {
                data: {
                    token: 'test-token-123',
                    redirectUrl: 'https://example.com/redirect?token=test-token-123'
                }
            };
            const mockCreateCustomerResponse = { data: { success: true } };
            const mockAssignBalanceResponse = { data: { success: true } };

            mockedAxios.post
                .mockResolvedValueOnce(mockSsoResponse)
                .mockResolvedValueOnce(mockCreateCustomerResponse)
                .mockResolvedValueOnce(mockAssignBalanceResponse);

            // Act
            const result = await requestSSOWithRedirectUrl(gameId);

            // Assert
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://l1-glbs1.lumigame.com/signin/sso',
                expect.objectContaining({
                    gameId: 123
                })
            );
        });

        it('should handle errors from the SSO endpoint', async () => {
            // Arrange
            const mockError = new Error('SSO endpoint error');
            mockedAxios.post.mockRejectedValueOnce(mockError);

            // Act & Assert
            await expect(requestSSOWithRedirectUrl()).rejects.toThrow('SSO endpoint error');
        });

        it('should handle empty or invalid URL parameters gracefully', async () => {
            // Arrange
            Object.defineProperty(window, 'location', {
                value: { search: '?invalidParam=value' },
                writable: true
            });

            const mockSsoResponse = {
                data: {
                    token: 'test-token-123',
                    redirectUrl: 'https://example.com/redirect?token=test-token-123'
                }
            };
            const mockCreateCustomerResponse = { data: { success: true } };
            const mockAssignBalanceResponse = { data: { success: true } };

            mockedAxios.post
                .mockResolvedValueOnce(mockSsoResponse)
                .mockResolvedValueOnce(mockCreateCustomerResponse)
                .mockResolvedValueOnce(mockAssignBalanceResponse);

            // Act
            const result = await requestSSOWithRedirectUrl();

            // Assert
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://l1-glbs1.lumigame.com/signin/sso',
                expect.objectContaining({
                    playerId: expect.any(Number), // Should use random player ID
                    currency: '$US' // Should use default currency
                })
            );
        });

        it('should construct redirect URL with correct parameters', async () => {
            // Arrange
            const mockSsoResponse = {
                data: {
                    token: 'test-token-123',
                    redirectUrl: 'https://example.com/redirect?token=test-token-123'
                }
            };
            const mockCreateCustomerResponse = { data: { success: true } };
            const mockAssignBalanceResponse = { data: { success: true } };

            mockedAxios.post
                .mockResolvedValueOnce(mockSsoResponse)
                .mockResolvedValueOnce(mockCreateCustomerResponse)
                .mockResolvedValueOnce(mockAssignBalanceResponse);

            // Act
            const result = await requestSSOWithRedirectUrl();

            // Assert
            expect(result.redirectUrl).toContain('https://l1-proxy1.lumigame.com');
            expect(result.redirectUrl).toContain('token=test-token-123');
            expect(result.redirectUrl).toContain('lang=vi-VN');
            expect(result.redirectUrl).toContain('appType=6');
            expect(result.redirectUrl).toContain('op=sg');
            expect(result.redirectUrl).toContain('cg=GrUSD');
        });
    });

    describe('randomPlayerId', () => {
        it('should be a number within the expected range', () => {
            // Arrange & Act
            const result = randomPlayerId;

            // Assert
            expect(typeof result).toBe('number');
            expect(result).toBeGreaterThanOrEqual(1000000);
            expect(result).toBeLessThanOrEqual(9999999);
        });
    });

    describe('Integration Tests', () => {
        it('should maintain backward compatibility with original requestSSO function', async () => {
            // Arrange
            const mockSsoResponse = {
                data: {
                    token: 'test-token-123',
                    redirectUrl: 'https://example.com/redirect?token=test-token-123'
                }
            };
            const mockCreateCustomerResponse = { data: { success: true } };
            const mockAssignBalanceResponse = { data: { success: true } };

            mockedAxios.post
                .mockResolvedValueOnce(mockSsoResponse)
                .mockResolvedValueOnce(mockCreateCustomerResponse)
                .mockResolvedValueOnce(mockAssignBalanceResponse);

            // Act
            const result = await requestSSO();

            // Assert
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('redirectUrl');
        });

        it('should provide enhanced functionality with requestSSOWithRedirectUrl', async () => {
            // Arrange
            const mockSsoResponse = {
                data: {
                    token: 'test-token-123',
                    redirectUrl: 'https://example.com/redirect?token=test-token-123'
                }
            };
            const mockCreateCustomerResponse = { data: { success: true } };
            const mockAssignBalanceResponse = { data: { success: true } };

            mockedAxios.post
                .mockResolvedValueOnce(mockSsoResponse)
                .mockResolvedValueOnce(mockCreateCustomerResponse)
                .mockResolvedValueOnce(mockAssignBalanceResponse);

            // Act
            const result = await requestSSOWithRedirectUrl();

            // Assert
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('redirectUrl');
            expect(result).toHaveProperty('domain');
            expect(result.redirectUrl).toContain('l1-proxy1.lumigame.com');
            expect(result.redirectUrl).toContain('op=sg');
            expect(result.redirectUrl).toContain('cg=GrUSD');
        });
    });
}); 