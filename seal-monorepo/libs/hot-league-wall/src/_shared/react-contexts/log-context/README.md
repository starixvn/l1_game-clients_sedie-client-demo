# Centralized Logging System

A React Context-based centralized logging system designed for game applications. This system collects logs from deeply nested components during a game session and sends them as a single merged log to a backend when the game ends.

## Features

-   **Centralized Log Collection**: Collect logs from any component in the React tree
-   **Session Management**: Automatic session ID generation and management
-   **Game-Specific Logging**: Support for game ID and component-specific logging
-   **Batch Processing**: Collect logs in memory and send them as a single batch
-   **Multiple Log Levels**: Support for info, warn, error, and debug levels
-   **Automatic Cleanup**: Auto-send logs on component unmount (optional)
-   **Memory Management**: Configurable log buffer size with automatic trimming
-   **TypeScript Support**: Full TypeScript support with proper type definitions

## Installation

The logging system is already integrated into the hot-league-wall project. No additional installation is required.

## Basic Usage

### 1. Wrap Your App with LogProvider

```tsx
import { LogProvider } from './_shared/react-contexts/log-context';

function App() {
    return (
        <LogProvider
            sessionId="game-session-123"
            gameId="game-456"
            enabled={true}
            maxLogs={1000}
            autoSendOnUnmount={true}
            sendEndpoint="/api/send-logs"
        >
            <YourGameComponent />
        </LogProvider>
    );
}
```

### 2. Use the Logging Hook in Components

```tsx
import { useLog, useGameLogger } from './_shared/react-contexts/log-context';

function GameComponent() {
    // Basic logging
    const logContext = useLog();

    // Game-specific logging with component name
    const gameLogger = useGameLogger('GameComponent');

    const handlePlayerMove = () => {
        // Basic log
        logContext.addLog('Player moved to position (5, 3)');

        // Game-specific log with metadata
        gameLogger.logInfo('Player movement', {
            playerId: 'player1',
            fromPosition: { x: 4, y: 3 },
            toPosition: { x: 5, y: 3 },
            timestamp: Date.now(),
        });
    };

    return <button onClick={handlePlayerMove}>Move Player</button>;
}
```

### 3. Send Logs to Backend

```tsx
function GameBoard() {
    const logContext = useLog();

    const handleEndGame = async () => {
        try {
            // Send all collected logs to backend
            await logContext.sendLogsToBackend();
            console.log('Logs sent successfully');
        } catch (error) {
            console.error('Failed to send logs:', error);
        }
    };

    return <button onClick={handleEndGame}>End Game & Send Logs</button>;
}
```

## API Reference

### LogProvider Props

| Prop                | Type              | Default            | Description                              |
| ------------------- | ----------------- | ------------------ | ---------------------------------------- |
| `children`          | `React.ReactNode` | -                  | React components to wrap                 |
| `sessionId`         | `string`          | Auto-generated     | Unique session identifier                |
| `gameId`            | `string`          | `undefined`        | Game identifier                          |
| `enabled`           | `boolean`         | `true`             | Enable/disable logging                   |
| `maxLogs`           | `number`          | `1000`             | Maximum number of logs to keep in memory |
| `autoSendOnUnmount` | `boolean`         | `false`            | Auto-send logs when provider unmounts    |
| `sendEndpoint`      | `string`          | `'/api/send-logs'` | Backend endpoint for sending logs        |

### useLog() Hook

Returns the complete logging context with the following properties and methods:

#### Properties

-   `logs: LogEntry[]` - Array of all collected logs
-   `sessionId: string` - Current session ID
-   `gameId?: string` - Current game ID
-   `isEnabled: boolean` - Whether logging is enabled

#### Methods

-   `addLog(message: string, options?: LogOptions)` - Add a log entry
-   `getMergedLogs(): string` - Get all logs as a formatted string
-   `clearLogs()` - Clear all logs from memory
-   `setSessionId(sessionId: string)` - Update session ID
-   `setGameId(gameId: string)` - Update game ID
-   `setEnabled(enabled: boolean)` - Enable/disable logging
-   `sendLogsToBackend(endpoint?: string): Promise<void>` - Send logs to backend

### useGameLogger(componentName?: string) Hook

Returns an enhanced logger with game-specific methods:

#### Methods

-   `log(message: string, level: LogLevel, metadata?: object)` - Generic log method
-   `logInfo(message: string, metadata?: object)` - Log info level
-   `logWarn(message: string, metadata?: object)` - Log warning level
-   `logError(message: string, metadata?: object)` - Log error level
-   `logDebug(message: string, metadata?: object)` - Log debug level

Plus all methods from `useLog()`.

## Log Entry Structure

```typescript
interface LogEntry {
    id: string; // Unique log ID
    timestamp: number; // Unix timestamp
    message: string; // Log message
    sessionId?: string; // Session identifier
    gameId?: string; // Game identifier
    componentName?: string; // Component that created the log
    level?: 'info' | 'warn' | 'error' | 'debug'; // Log level
    metadata?: Record<string, any>; // Additional metadata
}
```

## Advanced Usage Examples

### Custom Log Formatting

```tsx
function CustomLogger() {
    const logContext = useLog();

    const logWithCustomFormat = (message: string, data: any) => {
        logContext.addLog(message, {
            level: 'info',
            metadata: {
                customData: data,
                formattedTime: new Date().toISOString(),
                userAgent: navigator.userAgent,
            },
        });
    };

    return <button onClick={() => logWithCustomFormat('Custom log', { value: 42 })}>Log Custom Data</button>;
}
```

### Conditional Logging

```tsx
function ConditionalLogger() {
    const logContext = useLog();
    const [debugMode, setDebugMode] = useState(false);

    const logDebug = (message: string) => {
        if (debugMode) {
            logContext.addLog(message, { level: 'debug' });
        }
    };

    return (
        <div>
            <button onClick={() => setDebugMode(!debugMode)}>Toggle Debug Mode</button>
            <button onClick={() => logDebug('Debug information')}>Log Debug Info</button>
        </div>
    );
}
```

### Error Boundary Integration

```tsx
class GameErrorBoundary extends React.Component {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // This would need to be called from a component that has access to the log context
        // You might need to use a different approach for error boundaries
        console.error('Game error:', error, errorInfo);
    }

    render() {
        return this.props.children;
    }
}
```

## Backend Integration

The system sends logs to your backend endpoint with the following payload structure:

```typescript
{
  sessionId: string;
  gameId?: string;
  logs: LogEntry[];
  mergedLogs: string;
  timestamp: number;
}
```

### Example Backend Handler (Node.js/Express)

```javascript
app.post('/api/send-logs', (req, res) => {
    const { sessionId, gameId, logs, mergedLogs, timestamp } = req.body;

    // Process the logs
    console.log(`Received ${logs.length} logs for session ${sessionId}`);

    // Store in database
    // await LogModel.create({ sessionId, gameId, logs, mergedLogs, timestamp });

    // Send to external logging service
    // await sendToExternalService(mergedLogs);

    res.status(200).json({ success: true, logCount: logs.length });
});
```

## Testing

The logging system includes comprehensive unit tests covering:

-   Happy path scenarios
-   Edge cases and boundary conditions
-   Error handling
-   Integration tests
-   Performance tests

Run tests with:

```bash
npm test -- log-context.test.tsx
```

## Best Practices

1. **Use Descriptive Component Names**: When using `useGameLogger`, provide meaningful component names for better log organization.

2. **Include Relevant Metadata**: Add useful context to your logs using the metadata parameter.

3. **Handle Errors Gracefully**: Always wrap `sendLogsToBackend()` calls in try-catch blocks.

4. **Monitor Log Volume**: Set appropriate `maxLogs` values to prevent memory issues.

5. **Use Appropriate Log Levels**: Use the correct log level for different types of messages.

6. **Test Logging in Development**: Verify that logs are being collected and sent correctly during development.

## Migration from Existing Logging

If you're migrating from an existing logging system:

1. Replace direct console.log calls with `useLog().addLog()`
2. Replace Sentry calls with `useGameLogger().logError()`
3. Update your game components to use the new logging hooks
4. Configure the LogProvider at your app's root level

## Troubleshooting

### Logs Not Appearing

-   Check that the LogProvider is wrapping your components
-   Verify that `enabled` is set to `true`
-   Check the browser console for any errors

### Logs Not Sending to Backend

-   Verify the `sendEndpoint` URL is correct
-   Check network tab for failed requests
-   Ensure your backend endpoint is working
-   Check CORS settings if applicable

### Memory Issues

-   Reduce the `maxLogs` value
-   Call `clearLogs()` periodically
-   Use `autoSendOnUnmount={true}` to automatically send logs

## Contributing

When contributing to the logging system:

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update this documentation
4. Ensure backward compatibility

## License

This logging system is part of the hot-league-wall project and follows the same licensing terms.
