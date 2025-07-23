import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/app';
import { SyncMemberSiteBalance } from '../src/_shared/utils/sync-member-site-balance';

// Mock dependencies
jest.mock('../src/i18n', () => ({
    loadI18n: jest.fn(),
}));

jest.mock('../src/lobby/lobby', () => {
    return function MockLobby(props) {
        const { token, language, renewToken } = props;
        return (
            <div data-testid="mock-lobby">
                <span>Token: {token}</span>
                <span>Language: {language}</span>
                {renewToken && <button onClick={() => renewToken()}>Renew Token</button>}
            </div>
        );
    };
});

jest.mock('../src/appProvider', () => ({
    AppProvider: ({ children, appEnv, language, siteId }: any) => (
        <div data-testid="app-provider" data-env={appEnv} data-lang={language} data-site={siteId}>
            {children}
        </div>
    ),
    useAppContext: () => ({
        language: 'en',
        appEnv: 'test',
        siteId: 'test-site',
    }),
}));

jest.mock('../src/_shared/utils/sync-member-site-balance', () => ({
    SyncMemberSiteBalance: {
        getInstance: jest.fn(() => ({
            setSyncBalanceCallback: jest.fn(),
        })),
    },
}));

describe('App Component', () => {
    const defaultProps = {
        appEnv: 'development',
        siteId: 'test-site',
        language: 'en',
        token: 'test-token',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('App_withValidProps_shouldRenderCorrectly', () => {
        it('should render with all required props', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
            expect(screen.getByText('Token: test-token')).toBeInTheDocument();
            expect(screen.getByText('Language: en')).toBeInTheDocument();
        });

        it('should render with optional renewToken prop', () => {
            // Arrange
            const renewToken = jest.fn();
            const props = { ...defaultProps, renewToken };

            // Act
            render(<App {...props} />);

            // Assert
            const renewButton = screen.getByText('Renew Token');
            expect(renewButton).toBeInTheDocument();

            fireEvent.click(renewButton);
            expect(renewToken).toHaveBeenCalledTimes(1);
        });

        it('should render with updateBalanceCallback prop', () => {
            // Arrange
            const updateBalanceCallback = jest.fn() as any;
            const props = { ...defaultProps, updateBalanceCallback };

            // Act
            render(<App {...props} />);

            // Assert
            expect(SyncMemberSiteBalance.getInstance).toHaveBeenCalled();
            const mockInstance = (SyncMemberSiteBalance.getInstance as jest.Mock).mock.results[0].value;
            expect(mockInstance.setSyncBalanceCallback).toHaveBeenCalledWith(updateBalanceCallback);
        });
    });

    describe('App_withEdgeCases_shouldHandleGracefully', () => {
        it('should handle empty token gracefully', () => {
            // Arrange
            const props = { ...defaultProps, token: '' };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.queryByTestId('mock-lobby')).not.toBeInTheDocument();
        });

        it('should handle null token gracefully', () => {
            // Arrange
            const props = { ...defaultProps, token: null as any };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.queryByTestId('mock-lobby')).not.toBeInTheDocument();
        });

        it('should handle undefined token gracefully', () => {
            // Arrange
            const props = { ...defaultProps, token: undefined as any };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.queryByTestId('mock-lobby')).not.toBeInTheDocument();
        });

        it('should handle null updateBalanceCallback gracefully', () => {
            // Arrange
            const props = { ...defaultProps, updateBalanceCallback: null };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
        });
    });

    describe('App_componentStructure_shouldHaveCorrectElements', () => {
        it('should have correct container structure', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            const { container } = render(<App {...props} />);

            // Assert
            const appContainer = container.querySelector('[data-react="true"]');
            expect(appContainer).toBeInTheDocument();
            expect(appContainer).toHaveStyle({ width: '100%' });
        });

        it('should pass correct props to AppProvider', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            // Assert
            const appProvider = screen.getByTestId('app-provider');
            expect(appProvider).toHaveAttribute('data-env', 'development');
            expect(appProvider).toHaveAttribute('data-lang', 'en');
            expect(appProvider).toHaveAttribute('data-site', 'test-site');
        });

        it('should pass correct props to Lobby component', () => {
            // Arrange
            const renewToken = jest.fn();
            const props = { ...defaultProps, renewToken };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByText('Token: test-token')).toBeInTheDocument();
            expect(screen.getByText('Language: en')).toBeInTheDocument();
        });
    });

    describe('App_integration_shouldWorkWithDependencies', () => {
        it('should call loadI18n with correct language', () => {
            // Arrange
            const { loadI18n } = require('../src/i18n');
            const props = { ...defaultProps, language: 'zh' };

            // Act
            render(<App {...props} />);

            // Assert
            expect(loadI18n).toHaveBeenCalledWith('en'); // Uses language from context, not prop
        });

        it('should set up sync balance callback when provided', () => {
            // Arrange
            const updateBalanceCallback = jest.fn() as any;
            const props = { ...defaultProps, updateBalanceCallback };

            // Act
            render(<App {...props} />);

            // Assert
            const mockInstance = (SyncMemberSiteBalance.getInstance as jest.Mock).mock.results[0].value;
            expect(mockInstance.setSyncBalanceCallback).toHaveBeenCalledWith(updateBalanceCallback);
        });
    });

    describe('App_accessibility_shouldBeAccessible', () => {
        it('should have proper container attributes', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            const { container } = render(<App {...props} />);

            // Assert
            const appContainer = container.querySelector('[data-react="true"]');
            expect(appContainer).toBeInTheDocument();
        });
    });

    describe('App_propTypes_shouldHandleAllProps', () => {
        it('should handle all optional props', () => {
            // Arrange
            const renewToken = jest.fn();
            const updateBalanceCallback = jest.fn() as any;
            const props = {
                ...defaultProps,
                renewToken,
                updateBalanceCallback,
            };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
        });

        it('should handle minimal required props', () => {
            // Arrange
            const props = {
                appEnv: 'production',
                siteId: 'minimal-site',
                language: 'en',
                token: 'minimal-token',
            };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
        });
    });
}); 