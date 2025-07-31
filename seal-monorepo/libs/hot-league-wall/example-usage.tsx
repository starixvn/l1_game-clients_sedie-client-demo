import React from 'react';
import App from './src/app';

/**
 * Example usage of Hot League Wall with error simulation enabled
 * 
 * This component demonstrates how to initialize the Hot League Wall app
 * in test mode to access the error simulation functionality.
 */
const HotLeagueWallWithErrorSimulation: React.FC = () => {
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <App
                appEnv="test"
                siteId="test-site-123"
                language="en"
                testMode={true} // This enables the error testing page
                updateBalanceCallback={undefined}
                onRequestSSOToken={async () => {
                    // Mock SSO token request for testing
                    console.log('Mock SSO token request');
                    return 'mock-token-123';
                }}
            />
        </div>
    );
};

/**
 * Example usage of Hot League Wall in normal mode
 * 
 * This component demonstrates how to initialize the Hot League Wall app
 * in normal mode without error simulation.
 */
const HotLeagueWallNormal: React.FC = () => {
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <App
                appEnv="production"
                siteId="production-site"
                language="en"
                testMode={false} // Normal mode
                updateBalanceCallback={undefined}
                onRequestSSOToken={async () => {
                    // Real SSO token request
                    const response = await fetch('/api/sso/token');
                    const data = await response.json();
                    return data.token;
                }}
            />
        </div>
    );
};

/**
 * Example of how to conditionally enable test mode based on environment
 */
const HotLeagueWallConditional: React.FC = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTestMode = process.env.REACT_APP_ENABLE_ERROR_SIMULATION === 'true';

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <App
                appEnv={isDevelopment ? 'development' : 'production'}
                siteId={isDevelopment ? 'dev-site' : 'prod-site'}
                language="en"
                testMode={isTestMode} // Only enable in development or when explicitly set
                updateBalanceCallback={undefined}
                onRequestSSOToken={async () => {
                    if (isDevelopment) {
                        // Mock token for development
                        return 'dev-mock-token';
                    } else {
                        // Real token for production
                        const response = await fetch('/api/sso/token');
                        const data = await response.json();
                        return data.token;
                    }
                }}
            />
        </div>
    );
};

export {
    HotLeagueWallWithErrorSimulation,
    HotLeagueWallNormal,
    HotLeagueWallConditional
};

export default HotLeagueWallWithErrorSimulation; 