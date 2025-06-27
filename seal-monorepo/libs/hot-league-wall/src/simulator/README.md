# Simulator Module

This module contains all simulator-related functionality for the hot-league-wall preview system.

## Structure

```
simulator/
├── components/           # React components for simulator functionality
│   ├── SSOFailureModeLogic.tsx
│   └── ScenarioResetWrapper.tsx
├── hooks/               # Custom React hooks
│   ├── useAppConfiguration.ts
│   ├── usePrototypeState.ts
│   └── useTokenRequest.ts
├── constants.ts         # Simulator-related constants
├── types.ts            # TypeScript type definitions
├── index.ts            # Main export file
└── README.md           # This file
```

## Components

### SSOFailureModeLogic

A logic-only component that handles SSO failure mode calculations. Returns `null` as it's purely for logic organization.

### ScenarioResetWrapper

A wrapper component that provides scenario key management for app resets.

## Hooks

### usePrototypeState

Manages prototype state including play button click count.

### useTokenRequest

Handles token request logic with simulation capabilities for testing failure scenarios.

### useAppConfiguration

Manages app configuration including theme, language, platform settings, and SSO controls.

## Constants

-   `DEFAULT_SCENARIO_KEY`: Default scenario key for normal flow
-   `DEFAULT_SSO_CONFIG`: Default SSO simulator configuration

## Types

-   `TokenRequestContext`: Type for token request contexts
-   `PrototypeState`: Interface for prototype state management
-   `PreviewContextProps`: Props interface for PreviewContext component
-   `ScenarioResetWrapperProps`: Props interface for ScenarioResetWrapper
-   `SSOFailureModeLogicProps`: Props interface for SSOFailureModeLogic
-   `TokenRequestHookParams`: Parameters for useTokenRequest hook
-   `AppConfiguration`: Interface for app configuration

## Usage

```typescript
import {
    usePrototypeState,
    useTokenRequest,
    useAppConfiguration,
    ScenarioResetWrapper,
    SSOFailureModeLogic,
    DEFAULT_SCENARIO_KEY,
    DEFAULT_SSO_CONFIG,
} from './simulator';
```

## Benefits

1. **Separation of Concerns**: Simulator logic is isolated from main preview logic
2. **Reusability**: Components and hooks can be reused across different parts of the application
3. **Testability**: Each module can be tested independently
4. **Maintainability**: Easier to maintain and update simulator functionality
5. **Type Safety**: Strong TypeScript typing throughout the module
6. **Clean Code**: Removed unused code and simplified interfaces
