import axios from 'axios';
import { randomIntFromInterval, randomPlayerId, requestSSO } from 'libs/saba-games/src/_shared/utils/sso-helper';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock app settings
jest.mock('libs/saba-games/src/_shared/app-settings', () => ({
    getEnvironmentConfig: jest.fn().mockReturnValue({
        systemType: 'SG',
        simulatorConfigs: {
            operatorId: 'test-operator-id',
            operatorSecret: 'test-operator-secret',
            operatorToken: 'test-operator-token',
            gameLobbySimulatorUrl: 'http://test-lobby-url',
            owApiSimulatorUrl: 'http://test-ow-api-url'
        }
    }),
    requestSSO_SITE_ID: 'test-site-id',
    reuqestSSO_APP_ENV: 'test-env'
}));

describe('sso-helper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: {
                search: ''
            },
            writable: true
        });
    });

    describe('randomIntFromInterval', () => {
        it('should generate a random number within the specified range', () => {
            const min = 1;
            const max = 10;
            const result = randomIntFromInterval(min, max);

            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
        });

        it('should handle negative ranges', () => {
            const min = -10;
            const max = -1;
            const result = randomIntFromInterval(min, max);

            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
        });

        it('should handle same min and max values', () => {
            const value = 5;
            const result = randomIntFromInterval(value, value);
            expect(result).toBe(value);
        });
    });

    describe('randomPlayerId', () => {
        it('should generate a random player ID between 1000000 and 9999999', () => {
            expect(randomPlayerId).toBeGreaterThanOrEqual(1000000);
            expect(randomPlayerId).toBeLessThanOrEqual(9999999);
        });
    });

    describe('requestSSO', () => {
        const mockSsoResponse = { token: 'test-token' };
        const mockPlayerId = 1234567;
        const mockCurrency = 'USD';

        beforeEach(() => {
            // Mock successful API responses
            mockedAxios.post.mockImplementation((url, data) => {
                if (url.includes('/signin/sso')) {
                    return Promise.resolve({ data: mockSsoResponse });
                }
                return Promise.resolve({ data: {} });
            });

            // Mock window.location.search
            Object.defineProperty(window, 'location', {
                value: {
                    search: `?playerId=${mockPlayerId}&currency=${mockCurrency}`
                },
                writable: true
            });
        });

        // it('should make SSO request with correct parameters', async () => {
        //     const result = await requestSSO(1);

        //     expect(mockedAxios.post).toHaveBeenCalledWith(
        //         'http://test-lobby-url/signin/sso',
        //         expect.objectContaining({
        //             playerId: mockPlayerId,
        //             playerName: `username_${mockPlayerId}`,
        //             currency: mockCurrency,
        //             gameId: 1,
        //             auth: {
        //                 operatorId: 'test-operator-id',
        //                 operatorSecret: 'test-operator-secret'
        //             },
        //             operatorToken: 'test-operator-token',
        //             browserUserAgent: expect.any(String)
        //         })
        //     );

        //     expect(result).toEqual(mockSsoResponse);
        // });

        it('should use random player ID when no playerId is provided', async () => {
            Object.defineProperty(window, 'location', {
                value: {
                    search: ''
                },
                writable: true
            });

            await requestSSO();

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    playerId: expect.any(Number)
                })
            );
        });

        it('should use default currency when no currency is provided', async () => {
            Object.defineProperty(window, 'location', {
                value: {
                    search: '?playerId=123'
                },
                writable: true
            });

            await requestSSO();

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    currency: '$US' // Default for SG system type
                })
            );
        });

        it('should handle API errors gracefully', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

            await expect(requestSSO()).rejects.toThrow('API Error');
        });

        it('should handle createCustomer API errors', async () => {
            mockedAxios.post.mockImplementation((url) => {
                if (url.includes('/CreateCustomer')) {
                    return Promise.reject(new Error('Create Customer Error'));
                }
                return Promise.resolve({ data: mockSsoResponse });
            });

            await expect(requestSSO()).rejects.toThrow('Create Customer Error');
        });

        it('should handle assignBalance API errors', async () => {
            mockedAxios.post.mockImplementation((url) => {
                if (url.includes('/SetDefaultBalance')) {
                    return Promise.reject(new Error('Assign Balance Error'));
                }
                return Promise.resolve({ data: mockSsoResponse });
            });

            await expect(requestSSO()).rejects.toThrow('Assign Balance Error');
        });

        it('should handle invalid playerId in URL', async () => {
            Object.defineProperty(window, 'location', {
                value: {
                    search: '?playerId=invalid'
                },
                writable: true
            });

            await requestSSO();

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    playerId: expect.any(Number) // Should fallback to random player ID
                })
            );
        });

        it('should include browser user agent in request', async () => {
            const mockUserAgent = 'Mozilla/5.0 (Test Browser)';
            Object.defineProperty(window.navigator, 'userAgent', {
                value: mockUserAgent,
                writable: true
            });

            await requestSSO();

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    browserUserAgent: mockUserAgent
                })
            );
        });

        it('should handle missing browser user agent', async () => {
            Object.defineProperty(window, 'navigator', {
                value: undefined,
                writable: true
            });

            await requestSSO();

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    browserUserAgent: ''
                })
            );
        });
    });
}); 
