# ConnectionManager Testing Guide

## Overview

This guide provides comprehensive testing strategies, patterns, and examples for the ConnectionManager class. The ConnectionManager is a critical component that manages WebSocket gateway connections, so thorough testing is essential for ensuring reliability and preventing memory leaks.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Setup](#test-setup)
3. [Unit Test Patterns](#unit-test-patterns)
4. [Integration Test Patterns](#integration-test-patterns)
5. [Mocking Strategies](#mocking-strategies)
6. [Test Coverage](#test-coverage)
7. [Performance Testing](#performance-testing)
8. [Test Examples](#test-examples)

## Testing Strategy

### AAA Pattern (Arrange, Act, Assert)

All ConnectionManager tests should follow the AAA pattern:

```typescript
describe('ConnectionManager', () => {
    it('should register gateway connection', () => {
        // Arrange
        const manager = ConnectionManager.getInstance();
        const mockConnection = createMockConnection();

        // Act
        manager.registerGatewayConnection(mockConnection);

        // Assert
        expect(manager.getActiveGatewayConnectionCount()).toBe(1);
        expect(manager.hasActiveGatewayConnections()).toBe(true);
    });
});
```

### Test Categories

1. **Unit Tests**: Test individual methods in isolation
2. **Integration Tests**: Test interaction with dependencies
3. **Lifecycle Tests**: Test connection registration and cleanup
4. **Error Handling Tests**: Test error scenarios and edge cases
5. **Concurrency Tests**: Test concurrent operations
6. **Memory Leak Tests**: Test proper cleanup and reference clearing

## Test Setup

### Basic Test Setup

```typescript
import { ConnectionManager } from '../../../../src/_shared/components/game-base/connection-manager';

describe('ConnectionManager', () => {
    let manager: ConnectionManager;
    let mockConnection: any;
    let mockHandler: any;
    let mockContainer: any;

    beforeEach(() => {
        // Reset singleton instance
        (ConnectionManager as any).instance = undefined;

        // Create mock objects
        mockConnection = createMockWebSocket();
        mockHandler = createMockGatewayHandler();
        mockContainer = createMockContainer();

        // Get fresh instance
        manager = ConnectionManager.getInstance();
    });

    afterEach(() => {
        // Clean up connections
        manager.clearGatewayConnections();

        // Reset mocks
        jest.clearAllMocks();
    });
});
```

### Mock Factory Functions

```typescript
function createMockWebSocket(): any {
    return {
        readyState: WebSocket.OPEN,
        close: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
    };
}

function createMockGatewayHandler(): any {
    return {
        connection: createMockWebSocket(),
        disconnect: jest.fn().mockResolvedValue(undefined),
        connect: jest.fn().mockResolvedValue(undefined),
    };
}

function createMockContainer(): any {
    return {
        get: jest.fn().mockReturnValue(createMockGatewayHandler()),
        has: jest.fn().mockReturnValue(true),
    };
}
```

## Unit Test Patterns

### 1. Singleton Pattern Tests

```typescript
describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
        // Arrange & Act
        const instance1 = ConnectionManager.getInstance();
        const instance2 = ConnectionManager.getInstance();

        // Assert
        expect(instance1).toBe(instance2);
        expect(instance1).toBeInstanceOf(ConnectionManager);
    });

    it('should not allow direct instantiation', () => {
        // Arrange & Act & Assert
        expect(() => new (ConnectionManager as any)()).toThrow();
    });
});
```

### 2. Connection Registration Tests

```typescript
describe('Connection Registration', () => {
    it('should register a new connection', () => {
        // Arrange
        const connection = createMockWebSocket();

        // Act
        manager.registerGatewayConnection(connection);

        // Assert
        expect(manager.getActiveGatewayConnectionCount()).toBe(1);
        expect(manager.hasActiveGatewayConnections()).toBe(true);
    });

    it('should not register duplicate connections', () => {
        // Arrange
        const connection = createMockWebSocket();
        manager.registerGatewayConnection(connection);

        // Act
        manager.registerGatewayConnection(connection);

        // Assert
        expect(manager.getActiveGatewayConnectionCount()).toBe(1);
    });

    it('should not register null or undefined connections', () => {
        // Arrange & Act
        manager.registerGatewayConnection(null);
        manager.registerGatewayConnection(undefined);

        // Assert
        expect(manager.getActiveGatewayConnectionCount()).toBe(0);
    });
});
```

### 3. Connection Cleanup Tests

```typescript
describe('Connection Cleanup', () => {
    it('should close a single connection properly', async () => {
        // Arrange
        const connection = createMockWebSocket();
        manager.registerGatewayConnection(connection);

        // Act
        const result = await manager.closeGatewayConnection(connection, 'test');

        // Assert
        expect(result).toBe(true);
        expect(connection.close).toHaveBeenCalled();
        expect(connection.removeEventListener).toHaveBeenCalled();
        expect(manager.getActiveGatewayConnectionCount()).toBe(0);
    });

    it('should handle closing non-existent connection', async () => {
        // Arrange
        const connection = createMockWebSocket();

        // Act
        const result = await manager.closeGatewayConnection(connection, 'test');

        // Assert
        expect(result).toBe(false);
        expect(connection.close).not.toHaveBeenCalled();
    });

    it('should close all connections', async () => {
        // Arrange
        const connection1 = createMockWebSocket();
        const connection2 = createMockWebSocket();
        manager.registerGatewayConnection(connection1);
        manager.registerGatewayConnection(connection2);

        // Act
        await manager.closeAllGatewayConnections('test');

        // Assert
        expect(connection1.close).toHaveBeenCalled();
        expect(connection2.close).toHaveBeenCalled();
        expect(manager.getActiveGatewayConnectionCount()).toBe(0);
    });
});
```

### 4. Disconnect Tests

```typescript
describe('Disconnect', () => {
    it('should disconnect using handler', async () => {
        // Arrange
        const mockHandler = createMockGatewayHandler();
        mockContainer.get.mockReturnValue(mockHandler);

        // Mock container access
        jest.spyOn(manager as any, 'getSharedContainer').mockReturnValue(mockContainer);

        // Act
        await manager.disconnect('test');

        // Assert
        expect(mockHandler.disconnect).toHaveBeenCalled();
    });

    it('should handle missing handler gracefully', async () => {
        // Arrange
        mockContainer.get.mockReturnValue(null);
        jest.spyOn(manager as any, 'getSharedContainer').mockReturnValue(mockContainer);

        // Act & Assert
        await expect(manager.disconnect('test')).resolves.not.toThrow();
    });

    it('should prevent concurrent disconnects', async () => {
        // Arrange
        const mockHandler = createMockGatewayHandler();
        mockHandler.disconnect.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
        mockContainer.get.mockReturnValue(mockHandler);
        jest.spyOn(manager as any, 'getSharedContainer').mockReturnValue(mockContainer);

        // Act
        const disconnect1 = manager.disconnect('test1');
        const disconnect2 = manager.disconnect('test2');

        await Promise.all([disconnect1, disconnect2]);

        // Assert
        expect(mockHandler.disconnect).toHaveBeenCalledTimes(1);
    });
});
```

### 5. Status Query Tests

```typescript
describe('Status Queries', () => {
    it('should return correct connection count', () => {
        // Arrange
        const connection1 = createMockWebSocket();
        const connection2 = createMockWebSocket();

        // Act
        manager.registerGatewayConnection(connection1);
        expect(manager.getActiveGatewayConnectionCount()).toBe(1);

        manager.registerGatewayConnection(connection2);
        expect(manager.getActiveGatewayConnectionCount()).toBe(2);

        manager.unregisterGatewayConnection(connection1);
        expect(manager.getActiveGatewayConnectionCount()).toBe(1);
    });

    it('should correctly check for active connections', () => {
        // Arrange & Act & Assert
        expect(manager.hasActiveGatewayConnections()).toBe(false);

        const connection = createMockWebSocket();
        manager.registerGatewayConnection(connection);
        expect(manager.hasActiveGatewayConnections()).toBe(true);
    });

    it('should track shutdown status', () => {
        // Arrange & Act & Assert
        expect(manager.isGatewayShutdownInProgress()).toBe(false);

        // Mock disconnect to set shutdown flag
        const mockHandler = createMockGatewayHandler();
        mockContainer.get.mockReturnValue(mockHandler);
        jest.spyOn(manager as any, 'getSharedContainer').mockReturnValue(mockContainer);

        // Act
        manager.disconnect('test');

        // Assert - Note: This might be async, so we'd need to handle timing
        // expect(manager.isGatewayShutdownInProgress()).toBe(true);
    });
});
```

## Integration Test Patterns

### 1. Container Integration Tests

```typescript
describe('Container Integration', () => {
    it('should get handler from multiple container sources', () => {
        // Arrange
        const mockHandler = createMockGatewayHandler();

        // Test different container sources
        const sources = [
            { source: 'sharedContainer', mock: () => ({ get: jest.fn().mockReturnValue(mockHandler) }) },
            { source: 'window.saba_games_shared_container', mock: () => ({ get: jest.fn().mockReturnValue(mockHandler) }) },
            { source: 'gc.sharedContainer', mock: () => ({ get: jest.fn().mockReturnValue(mockHandler) }) },
            { source: 'window.sharedContainer', mock: () => ({ get: jest.fn().mockReturnValue(mockHandler) }) },
            { source: 'gc.getContainer()', mock: () => ({ get: jest.fn().mockReturnValue(mockHandler) }) },
        ];

        sources.forEach(({ source, mock }) => {
            // Arrange
            const containerMock = mock();
            jest.spyOn(manager as any, 'getSharedContainer').mockReturnValue(containerMock);

            // Act
            const handler = (manager as any).getGatewayConnectHandler();

            // Assert
            expect(handler).toBe(mockHandler);
        });
    });
});
```

### 2. WebSocket Integration Tests

```typescript
describe('WebSocket Integration', () => {
    it('should properly handle WebSocket close events', async () => {
        // Arrange
        const connection = createMockWebSocket();
        let closeCallback: Function;
        connection.addEventListener.mockImplementation((event, callback) => {
            if (event === 'close') {
                closeCallback = callback;
            }
        });

        manager.registerGatewayConnection(connection);

        // Act
        const closePromise = manager.closeGatewayConnection(connection, 'test');

        // Simulate close event
        setTimeout(() => closeCallback(), 10);

        // Assert
        await expect(closePromise).resolves.toBe(true);
        expect(connection.close).toHaveBeenCalled();
    });

    it('should handle WebSocket errors during close', async () => {
        // Arrange
        const connection = createMockWebSocket();
        connection.close.mockImplementation(() => {
            throw new Error('WebSocket error');
        });

        manager.registerGatewayConnection(connection);

        // Act & Assert
        await expect(manager.closeGatewayConnection(connection, 'test')).resolves.toBe(false);
    });
});
```

## Mocking Strategies

### 1. Container Mocking

```typescript
class MockContainer {
    private handlers = new Map<string, any>();

    set(key: string, handler: any) {
        this.handlers.set(key, handler);
    }

    get(key: string) {
        return this.handlers.get(key);
    }

    has(key: string) {
        return this.handlers.has(key);
    }
}

// Usage
const mockContainer = new MockContainer();
mockContainer.set('ConnectHandler', createMockGatewayHandler());
```

### 2. WebSocket Mocking

```typescript
class MockWebSocket {
    public readyState = WebSocket.OPEN;
    public close = jest.fn();
    public addEventListener = jest.fn();
    public removeEventListener = jest.fn();
    public send = jest.fn();

    constructor(url?: string) {
        // Simulate connection establishment
        setTimeout(() => {
            this.readyState = WebSocket.OPEN;
        }, 0);
    }
}

// Usage
const mockWebSocket = new MockWebSocket('ws://test.com');
```

### 3. Gateway Handler Mocking

```typescript
class MockGatewayHandler {
    public connection: MockWebSocket;
    public disconnect = jest.fn().mockResolvedValue(undefined);
    public connect = jest.fn().mockResolvedValue(undefined);

    constructor() {
        this.connection = new MockWebSocket();
    }

    setConnection(connection: MockWebSocket) {
        this.connection = connection;
    }
}

// Usage
const mockHandler = new MockGatewayHandler();
```

## Test Coverage

### Required Test Coverage Areas

1. **Singleton Pattern**: 100%
2. **Connection Registration**: 100%
3. **Connection Cleanup**: 100%
4. **Disconnect Operations**: 100%
5. **Status Queries**: 100%
6. **Error Handling**: 100%
7. **Container Integration**: 100%
8. **WebSocket Lifecycle**: 100%

### Coverage Goals

```typescript
// Jest configuration for coverage
module.exports = {
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.spec.ts', '!src/**/*.test.ts'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
    },
};
```

## Performance Testing

### 1. Memory Leak Tests

```typescript
describe('Memory Leak Prevention', () => {
    it('should not leak memory with multiple connections', () => {
        // Arrange
        const connections: any[] = [];

        // Act - Create many connections
        for (let i = 0; i < 100; i++) {
            const connection = createMockWebSocket();
            connections.push(connection);
            manager.registerGatewayConnection(connection);
        }

        // Clean up
        connections.forEach((connection) => {
            manager.unregisterGatewayConnection(connection);
        });

        // Assert
        expect(manager.getActiveGatewayConnectionCount()).toBe(0);

        // Check for circular references
        connections.forEach((connection) => {
            expect(connection.connection).toBeUndefined();
            expect(connection.socket).toBeUndefined();
        });
    });
});
```

### 2. Concurrent Operation Tests

```typescript
describe('Concurrent Operations', () => {
    it('should handle concurrent registrations', async () => {
        // Arrange
        const connections = Array.from({ length: 10 }, () => createMockWebSocket());

        // Act
        const promises = connections.map((connection) => Promise.resolve(manager.registerGatewayConnection(connection)));

        await Promise.all(promises);

        // Assert
        expect(manager.getActiveGatewayConnectionCount()).toBe(10);
    });

    it('should handle concurrent disconnects', async () => {
        // Arrange
        const connections = Array.from({ length: 5 }, () => createMockWebSocket());
        connections.forEach((connection) => manager.registerGatewayConnection(connection));

        // Act
        const promises = connections.map((connection) => manager.closeGatewayConnection(connection, 'concurrent_test'));

        await Promise.all(promises);

        // Assert
        expect(manager.getActiveGatewayConnectionCount()).toBe(0);
    });
});
```

## Test Examples

### Complete Test Suite Example

```typescript
import { ConnectionManager } from '../../../../src/_shared/components/game-base/connection-manager';

describe('ConnectionManager', () => {
    let manager: ConnectionManager;
    let mockConnection: any;
    let mockHandler: any;
    let mockContainer: any;

    beforeEach(() => {
        // Reset singleton instance
        (ConnectionManager as any).instance = undefined;

        // Create mocks
        mockConnection = createMockWebSocket();
        mockHandler = createMockGatewayHandler();
        mockContainer = createMockContainer();

        // Get fresh instance
        manager = ConnectionManager.getInstance();
    });

    afterEach(() => {
        manager.clearGatewayConnections();
        jest.clearAllMocks();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = ConnectionManager.getInstance();
            const instance2 = ConnectionManager.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(ConnectionManager);
        });
    });

    describe('Connection Registration', () => {
        it('should register a new connection', () => {
            manager.registerGatewayConnection(mockConnection);

            expect(manager.getActiveGatewayConnectionCount()).toBe(1);
            expect(manager.hasActiveGatewayConnections()).toBe(true);
        });

        it('should not register duplicate connections', () => {
            manager.registerGatewayConnection(mockConnection);
            manager.registerGatewayConnection(mockConnection);

            expect(manager.getActiveGatewayConnectionCount()).toBe(1);
        });

        it('should handle null connections gracefully', () => {
            manager.registerGatewayConnection(null);
            manager.registerGatewayConnection(undefined);

            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });
    });

    describe('Connection Cleanup', () => {
        it('should close connection properly', async () => {
            manager.registerGatewayConnection(mockConnection);

            const result = await manager.closeGatewayConnection(mockConnection, 'test');

            expect(result).toBe(true);
            expect(mockConnection.close).toHaveBeenCalled();
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });

        it('should close all connections', async () => {
            const connection1 = createMockWebSocket();
            const connection2 = createMockWebSocket();

            manager.registerGatewayConnection(connection1);
            manager.registerGatewayConnection(connection2);

            await manager.closeAllGatewayConnections('test');

            expect(connection1.close).toHaveBeenCalled();
            expect(connection2.close).toHaveBeenCalled();
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });
    });

    describe('Disconnect Operations', () => {
        beforeEach(() => {
            mockContainer.get.mockReturnValue(mockHandler);
            jest.spyOn(manager as any, 'getSharedContainer').mockReturnValue(mockContainer);
        });

        it('should disconnect using handler', async () => {
            await manager.disconnect('test');

            expect(mockHandler.disconnect).toHaveBeenCalled();
        });

        it('should handle missing handler gracefully', async () => {
            mockContainer.get.mockReturnValue(null);

            await expect(manager.disconnect('test')).resolves.not.toThrow();
        });
    });

    describe('Status Queries', () => {
        it('should return correct connection count', () => {
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);

            manager.registerGatewayConnection(mockConnection);
            expect(manager.getActiveGatewayConnectionCount()).toBe(1);

            manager.unregisterGatewayConnection(mockConnection);
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });

        it('should check for active connections', () => {
            expect(manager.hasActiveGatewayConnections()).toBe(false);

            manager.registerGatewayConnection(mockConnection);
            expect(manager.hasActiveGatewayConnections()).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle WebSocket errors during close', async () => {
            mockConnection.close.mockImplementation(() => {
                throw new Error('WebSocket error');
            });

            manager.registerGatewayConnection(mockConnection);

            const result = await manager.closeGatewayConnection(mockConnection, 'test');

            expect(result).toBe(false);
        });

        it('should handle container errors gracefully', () => {
            jest.spyOn(manager as any, 'getSharedContainer').mockImplementation(() => {
                throw new Error('Container error');
            });

            const handler = (manager as any).getGatewayConnectHandler();

            expect(handler).toBeNull();
        });
    });
});

// Helper functions
function createMockWebSocket(): any {
    return {
        readyState: WebSocket.OPEN,
        close: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
    };
}

function createMockGatewayHandler(): any {
    return {
        connection: createMockWebSocket(),
        disconnect: jest.fn().mockResolvedValue(undefined),
        connect: jest.fn().mockResolvedValue(undefined),
    };
}

function createMockContainer(): any {
    return {
        get: jest.fn().mockReturnValue(createMockGatewayHandler()),
        has: jest.fn().mockReturnValue(true),
    };
}
```

## Best Practices for Testing

### 1. Test Organization

-   Group related tests using `describe` blocks
-   Use descriptive test names that explain the scenario
-   Follow the AAA pattern consistently
-   Keep tests independent and isolated

### 2. Mock Management

-   Create reusable mock factory functions
-   Reset mocks between tests
-   Use appropriate mock implementations for different scenarios
-   Verify mock calls when relevant

### 3. Async Testing

-   Use `async/await` for asynchronous operations
-   Handle promises properly in tests
-   Test both success and failure scenarios
-   Use appropriate timeouts for async operations

### 4. Error Testing

-   Test all error paths
-   Verify error messages and logging
-   Test graceful degradation
-   Ensure errors don't break the application

### 5. Performance Considerations

-   Test with realistic data volumes
-   Monitor memory usage in tests
-   Test concurrent operations
-   Verify cleanup operations

This comprehensive testing guide ensures that the ConnectionManager is thoroughly tested and reliable in production environments.
