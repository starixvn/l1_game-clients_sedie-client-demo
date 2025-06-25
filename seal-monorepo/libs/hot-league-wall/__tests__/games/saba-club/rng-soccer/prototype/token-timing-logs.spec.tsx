import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Preview from '../../../../../src/preview';
import { tokenTimingAnalyzer, logTokenTiming } from '../../../../../src/_shared/utils/token-timing-analyzer';

// Mock the SSO helper
jest.mock('../../../../../src/_shared/utils/sso-helper', () => ({
    requestSSO: jest.fn()
}));

// Mock the preview context
jest.mock('../../../../../src/previewProvider', () => ({
    PreviewProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    usePreviewContext: () => ({
        theme: 'light',
        isDarkMode: false,
        language: 'en'
    })
}));

// Mock the app provider
jest.mock('../../../../../src/appProvider', () => ({
    AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAppContext: () => ({
        language: 'en'
    })
}));

// Mock Sentry
jest.mock('../../../../../src/saba-games-index', () => ({
    useSentryInit: jest.fn()
}));

// Mock console.log to capture timing logs
const originalConsoleLog = console.log;
let capturedLogs: string[] = [];

beforeEach(() => {
    capturedLogs = [];
    console.log = jest.fn((...args) => {
        capturedLogs.push(args.join(' '));
        originalConsoleLog(...args);
    });

    // Clear timing analyzer logs
    tokenTimingAnalyzer.clearLogs();
});

afterEach(() => {
    console.log = originalConsoleLog;
});

describe('Token Timing Logs', () => {
    it('should log timing information when Play button is clicked', async () => {
        // Mock successful SSO response
        const { requestSSO } = require('../../../../../src/_shared/utils/sso-helper');
        requestSSO.mockResolvedValue({ token: 'test-token-123' });

        render(
            <BrowserRouter>
                <Preview />
            </BrowserRouter>
        );

        // Wait for initial token to be set
        await waitFor(() => {
            expect(requestSSO).toHaveBeenCalled();
        });

        // Click the Play button
        const playButton = screen.getByText('Play Now');
        fireEvent.click(playButton);

        // Wait for the token request to complete
        await waitFor(() => {
            expect(requestSSO).toHaveBeenCalledTimes(2); // Initial + Play button click
        });

        // Check that timing logs were generated
        const timingLogs = capturedLogs.filter(log =>
            log.includes('[TOKEN_TIMING]') ||
            log.includes('[APP_TIMING]') ||
            log.includes('[PROTOTYPE_TIMING]') ||
            log.includes('[BASE_TIMING]')
        );

        expect(timingLogs.length).toBeGreaterThan(0);

        // Verify specific timing log entries
        expect(timingLogs.some(log => log.includes('Play button clicked'))).toBe(true);
        expect(timingLogs.some(log => log.includes('Token request SUCCESS'))).toBe(true);
        expect(timingLogs.some(log => log.includes('Duration:'))).toBe(true);
    });

    it('should log timing information for failed token requests', async () => {
        // Mock failed SSO response
        const { requestSSO } = require('../../../../../src/_shared/utils/sso-helper');
        requestSSO.mockRejectedValue(new Error('Network error'));

        render(
            <BrowserRouter>
                <Preview />
            </BrowserRouter>
        );

        // Wait for initial token request to fail
        await waitFor(() => {
            expect(requestSSO).toHaveBeenCalled();
        });

        // The component should not render if no token
        expect(screen.queryByText('Play Now')).not.toBeInTheDocument();
    });

    it('should use token timing analyzer utility', () => {
        // Test the timing analyzer utility
        logTokenTiming('TEST', 'Test action', 'start', 'Test message');
        logTokenTiming('TEST', 'Test action', 'success', 'Test success', 150.5);

        const logs = tokenTimingAnalyzer.getTimingLogs();
        expect(logs).toHaveLength(2);
        expect(logs[0].component).toBe('TEST');
        expect(logs[0].action).toBe('Test action');
        expect(logs[0].status).toBe('start');
        expect(logs[1].duration).toBe(150.5);
    });

    it('should export timing data correctly', () => {
        // Add some test logs
        logTokenTiming('TEST', 'Token request', 'start', 'Starting token request');
        logTokenTiming('TEST', 'Token request', 'success', 'Token received', 200.0);

        const exportData = tokenTimingAnalyzer.exportTimingData();
        const parsedData = JSON.parse(exportData);

        expect(parsedData.logs).toHaveLength(2);
        expect(parsedData.summary.totalLogs).toBe(2);
        expect(parsedData.summary.successfulTokenRequests).toBe(1);
        expect(parsedData.summary.failedTokenRequests).toBe(0);
    });

    it('should analyze token flow correctly', () => {
        // Add test data for analysis
        logTokenTiming('BASE', 'Play button clicked', 'start', 'Button clicked');
        logTokenTiming('TOKEN', 'Token request', 'start', 'Requesting token');
        logTokenTiming('TOKEN', 'Token request', 'success', 'Token received', 150.0);
        logTokenTiming('APP', 'Token callback', 'success', 'Callback completed', 50.0);

        // Capture console output during analysis
        const originalConsoleLog = console.log;
        const analysisLogs: string[] = [];
        console.log = jest.fn((...args) => {
            analysisLogs.push(args.join(' '));
        });

        tokenTimingAnalyzer.analyzeTokenFlow();

        // Restore console.log
        console.log = originalConsoleLog;

        // Verify analysis output
        expect(analysisLogs.some(log => log.includes('Total Play button clicks: 1'))).toBe(true);
        expect(analysisLogs.some(log => log.includes('Successful token requests: 1'))).toBe(true);
        expect(analysisLogs.some(log => log.includes('Average token request time:'))).toBe(true);
    });

    it('should handle multiple token requests and track performance', async () => {
        // Mock successful SSO response
        const { requestSSO } = require('../../../../../src/_shared/utils/sso-helper');
        requestSSO.mockResolvedValue({ token: 'test-token-123' });

        render(
            <BrowserRouter>
                <Preview />
            </BrowserRouter>
        );

        // Wait for initial load
        await waitFor(() => {
            expect(requestSSO).toHaveBeenCalled();
        });

        // Click Play button multiple times (though it should only work once)
        const playButton = screen.getByText('Play Now');

        // First click
        fireEvent.click(playButton);
        await waitFor(() => {
            expect(requestSSO).toHaveBeenCalledTimes(2);
        });

        // Wait a bit and analyze
        await new Promise(resolve => setTimeout(resolve, 100));

        const logs = tokenTimingAnalyzer.getTimingLogs();
        const tokenRequests = logs.filter(log =>
            log.action.includes('Token request') && log.status === 'success'
        );

        expect(tokenRequests.length).toBeGreaterThan(0);

        // Verify timing data is captured
        tokenRequests.forEach(log => {
            expect(log.duration).toBeDefined();
            expect(log.duration).toBeGreaterThan(0);
            expect(log.timestamp).toBeDefined();
        });
    });
}); 