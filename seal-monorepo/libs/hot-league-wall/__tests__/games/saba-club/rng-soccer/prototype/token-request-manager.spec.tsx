import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../../../../src/app';

// Mock the TokenRequestManager
const mockSetTokenRequestCallback = jest.fn();
const mockExecuteTokenRequest = jest.fn();
const mockGetTokenRequestCallback = jest.fn();

jest.mock('../../../../../src/_shared/utils/token-request-manager', () => ({
    TokenRequestManager: {
        getInstance: jest.fn(() => ({
            setTokenRequestCallback: mockSetTokenRequestCallback,
            executeTokenRequest: mockExecuteTokenRequest,
            getTokenRequestCallback: mockGetTokenRequestCallback
        }))
    }
}));

describe('TokenRequestManager Implementation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should use TokenRequestManager to get token when Play button is clicked', async () => {
        // Arrange
        const mockToken = 'mock-token-123';
        mockExecuteTokenRequest.mockResolvedValue(mockToken);

        const onPlayButtonTokenRequest = jest.fn().mockResolvedValue(mockToken);

        render(
            <BrowserRouter>
                <App
                    appEnv="test"
                    token="initial-token"
                    language="en"
                    siteId="test-site"
                    onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                />
            </BrowserRouter>
        );

        // Act - Click the play button
        const playButton = screen.getByText(/play/i);
        fireEvent.click(playButton);

        // Assert
        await waitFor(() => {
            expect(mockExecuteTokenRequest).toHaveBeenCalled();
        });

        expect(mockExecuteTokenRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle TokenRequestManager returning null', async () => {
        // Arrange
        mockExecuteTokenRequest.mockResolvedValue(null);

        const onPlayButtonTokenRequest = jest.fn().mockResolvedValue(null);

        render(
            <BrowserRouter>
                <App
                    appEnv="test"
                    token="initial-token"
                    language="en"
                    siteId="test-site"
                    onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                />
            </BrowserRouter>
        );

        // Act - Click the play button
        const playButton = screen.getByText(/play/i);
        fireEvent.click(playButton);

        // Assert
        await waitFor(() => {
            expect(mockExecuteTokenRequest).toHaveBeenCalled();
        });

        expect(mockExecuteTokenRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle TokenRequestManager throwing an error', async () => {
        // Arrange
        const error = new Error('Token request failed');
        mockExecuteTokenRequest.mockRejectedValue(error);

        const onPlayButtonTokenRequest = jest.fn().mockRejectedValue(error);

        render(
            <BrowserRouter>
                <App
                    appEnv="test"
                    token="initial-token"
                    language="en"
                    siteId="test-site"
                    onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                />
            </BrowserRouter>
        );

        // Act - Click the play button
        const playButton = screen.getByText(/play/i);
        fireEvent.click(playButton);

        // Assert
        await waitFor(() => {
            expect(mockExecuteTokenRequest).toHaveBeenCalled();
        });

        expect(mockExecuteTokenRequest).toHaveBeenCalledTimes(1);
    });

    it('should set token request callback when onPlayButtonTokenRequest prop is provided', () => {
        // Arrange
        const onPlayButtonTokenRequest = jest.fn().mockResolvedValue('test-token');

        render(
            <BrowserRouter>
                <App
                    appEnv="test"
                    token="initial-token"
                    language="en"
                    siteId="test-site"
                    onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                />
            </BrowserRouter>
        );

        // Assert
        expect(mockSetTokenRequestCallback).toHaveBeenCalledWith(onPlayButtonTokenRequest);
    });

    it('should not set token request callback when onPlayButtonTokenRequest prop is not provided', () => {
        // Arrange
        render(
            <BrowserRouter>
                <App
                    appEnv="test"
                    token="initial-token"
                    language="en"
                    siteId="test-site"
                />
            </BrowserRouter>
        );

        // Assert
        expect(mockSetTokenRequestCallback).not.toHaveBeenCalled();
    });
}); 