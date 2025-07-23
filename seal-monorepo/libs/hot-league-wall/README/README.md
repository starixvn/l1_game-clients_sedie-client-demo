# Hot League Wall - Game Client Library

## Overview

Hot League Wall is a React-based game client library designed for seamless integration with various gaming platforms. The library provides a comprehensive SSO (Single Sign-On) authentication system with built-in testing capabilities and simplified 3rd party integration.

## Key Features

- **Simplified 3rd Party Integration**: Clean `onRequestSSOToken` callback interface
- **SSO Control Simulator**: Interactive testing framework for authentication scenarios
- **TokenRequestManager**: Centralized token management with singleton pattern
- **Performance Monitoring**: Comprehensive timing and logging system
- **Multi-language Support**: Internationalization (i18n) support
- **Responsive Design**: Modern UI with theme support

## Quick Start

### 3rd Party Integration

```typescript
import App from '@seal/hot-league-wall';

const MyGameClient = () => {
    const handleTokenRequest = async (): Promise<string | null> => {
        try {
            const response = await fetch('/api/sso/token');
            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Token request failed:', error);
            return null;
        }
    };

    return (
        <App
            appEnv="production"
            siteId="your-site-id"
            language="en"
            onRequestSSOToken={handleTokenRequest}
        />
    );
};
```

### Development Mode

```bash
# Start development server with SSO simulator
npm run dev

# Access SSO Control Simulator
# Navigate to: http://localhost:3000/sso-control
```

## Architecture

### Core Components

- **App Component**: Main application with internal context management
- **Preview Component**: Development environment with simulator integration
- **TokenRequestManager**: Singleton for centralized token management
- **SSO Control Simulator**: Testing framework for authentication scenarios

### Design Principles

- **Separation of Concerns**: Context management handled internally
- **3rd Party Friendly**: Simplified callback interfaces
- **Testable**: Built-in simulation and testing capabilities
- **Performance Focused**: Comprehensive monitoring and optimization

## Documentation

- [Token Callback Implementation](./TOKEN_CALLBACK_IMPLEMENTATION.md) - Detailed implementation guide
- [SSO Quick Reference](./SSO_QUICK_REFERENCE.md) - Quick reference for common tasks
- [SSO Control Guide](./SSO_CONTROL_GUIDE.md) - Comprehensive simulator usage guide
- [Testing Guide](./TESTING_GUIDE.md) - Testing strategies and best practices
- [Token Timing Logs Guide](./TOKEN_TIMING_LOGS_GUIDE.md) - Performance monitoring guide

## API Reference

### App Component Props

```typescript
interface AppProps {
    appEnv: string;                                    // Environment (production, development)
    siteId: string;                                    // Site identifier
    language: string;                                  // Language code (en, zh, etc.)
    updateBalanceCallback?: void | null;               // Balance update callback
    onRequestSSOToken?: () => Promise<string | null>;  // Simplified token request callback
}
```

### Key Benefits

- ✅ **No Context Parameter**: Callback doesn't need to handle internal contexts
- ✅ **Focus on Token Retrieval**: Simple Promise<string | null> return type
- ✅ **Internal Context Management**: App handles 'FIRST_SSO' and 'SSO_RETRY' internally
- ✅ **Clean Integration**: Minimal boilerplate for 3rd party developers

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linting
```

### Testing

The library includes comprehensive testing capabilities:

- **SSO Control Simulator**: Interactive testing at `/sso-control`
- **Unit Tests**: Jest-based test suite
- **Integration Tests**: End-to-end testing scenarios
- **Performance Tests**: Token request timing analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

[License information here] 