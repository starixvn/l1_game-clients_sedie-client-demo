import React from 'react';
import { LogProvider, useGameLogger } from '../../react-contexts/log-context';
import { LoggingDemo } from 'sg-sentry-dev';

/**
 * Example showing how to integrate the logging system with existing game components
 * This demonstrates the complete workflow from game initialization to log collection and sending
 */

// Example of integrating with existing GameBase class
interface GameWithLoggingProps {
    logContext?: any; // This would be the logging context
}

class GameWithLogging extends React.Component<GameWithLoggingProps> {
    private logger: any; // This would be the logging context

    componentDidMount() {
        // Initialize logging for the game
        this.logger = this.props.logContext; // Passed from parent
        if (this.logger) {
            this.logger.logInfo('Game initialized', {
                gameType: 'example-game',
                version: '1.0.0',
                timestamp: Date.now()
            });
        }
    }

    componentWillUnmount() {
        // Log game cleanup
        this.logger.logInfo('Game cleanup started', {
            timestamp: Date.now()
        });
    }

    render() {
        return (
            <div>
                <h2>Game with Logging Integration</h2>
                <p>This demonstrates how to integrate logging with existing game components.</p>
            </div>
        );
    }
}

// Example of a game component that uses the logging system
const GameComponentWithLogging: React.FC = () => {
    const logger = useGameLogger('GameComponent');

    React.useEffect(() => {
        logger.logInfo('Game component mounted', {
            componentName: 'GameComponentWithLogging',
            timestamp: Date.now()
        });

        return () => {
            logger.logInfo('Game component unmounting', {
                componentName: 'GameComponentWithLogging',
                timestamp: Date.now()
            });
        };
    }, [logger]);

    const handleGameEvent = (eventType: string, data: any) => {
        logger.logInfo(`Game event: ${eventType}`, {
            eventType,
            data,
            timestamp: Date.now()
        });
    };

    const handleGameError = (error: Error) => {
        logger.logError('Game error occurred', {
            error: error.message,
            stack: error.stack,
            timestamp: Date.now()
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Game Component with Logging</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => handleGameEvent('player_move', { x: 5, y: 3 })}>
                    Log Player Move
                </button>
                <button onClick={() => handleGameEvent('item_collected', { itemId: 'treasure_1' })}>
                    Log Item Collection
                </button>
                <button onClick={() => handleGameError(new Error('Simulated game error'))}>
                    Simulate Error
                </button>
            </div>
        </div>
    );
};

// Example of integrating with the existing game structure
const GameIntegrationExample: React.FC = () => {
    const [showDemo, setShowDemo] = React.useState(false);
    const [integrationType, setIntegrationType] = React.useState<'basic' | 'advanced' | 'demo'>('basic');

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Game Logging Integration Examples</h1>

            <div style={{ marginBottom: '20px' }}>
                <h3>Choose Integration Type:</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setIntegrationType('basic')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: integrationType === 'basic' ? '#4caf50' : '#ddd',
                            color: integrationType === 'basic' ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Basic Integration
                    </button>
                    <button
                        onClick={() => setIntegrationType('advanced')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: integrationType === 'advanced' ? '#4caf50' : '#ddd',
                            color: integrationType === 'advanced' ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Advanced Integration
                    </button>
                    <button
                        onClick={() => setIntegrationType('demo')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: integrationType === 'demo' ? '#4caf50' : '#ddd',
                            color: integrationType === 'demo' ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Full Demo
                    </button>
                </div>
            </div>

            {integrationType === 'basic' && (
                <LogProvider
                    sessionId="basic-integration-session"
                    gameId="basic-game-123"
                    enabled={true}
                    maxLogs={100}
                    autoSendOnUnmount={false}
                >
                    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                        <h2>Basic Integration Example</h2>
                        <p>This shows the simplest way to integrate logging into your game components.</p>

                        <GameComponentWithLogging />

                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                            <h4>Integration Steps:</h4>
                            <ol>
                                <li>Wrap your game with LogProvider</li>
                                <li>Use useGameLogger hook in components</li>
                                <li>Log important game events</li>
                                <li>Send logs when game ends</li>
                            </ol>
                        </div>
                    </div>
                </LogProvider>
            )}

            {integrationType === 'advanced' && (
                <LogProvider
                    sessionId="advanced-integration-session"
                    gameId="advanced-game-456"
                    enabled={true}
                    maxLogs={500}
                    autoSendOnUnmount={true}
                    sendEndpoint="/api/advanced/send-logs"
                >
                    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                        <h2>Advanced Integration Example</h2>
                        <p>This shows advanced features like auto-send, custom endpoints, and comprehensive logging.</p>

                        <GameComponentWithLogging />

                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                            <h4>Advanced Features:</h4>
                            <ul>
                                <li>Auto-send logs on unmount</li>
                                <li>Custom backend endpoint</li>
                                <li>Larger log buffer (500 logs)</li>
                                <li>Comprehensive error logging</li>
                                <li>Performance monitoring</li>
                            </ul>
                        </div>
                    </div>
                </LogProvider>
            )}

            {integrationType === 'demo' && (
                <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                    <h2>Full Interactive Demo</h2>
                    <p>This demonstrates the complete logging system with interactive game pieces and real-time log collection.</p>

                    <button
                        onClick={() => setShowDemo(!showDemo)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        {showDemo ? 'Hide Demo' : 'Show Full Demo'}
                    </button>

                    {showDemo && <LoggingDemo />}
                </div>
            )}

            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h3>Integration Guidelines</h3>

                <h4>1. Game Base Integration</h4>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {`// In your main game component
import { LogProvider } from './_shared/react-contexts/log-context';

class YourGame extends GameBase {
  render() {
    return (
      <LogProvider
        sessionId={this.props.sessionId}
        gameId={this.props.gameId}
        enabled={true}
        autoSendOnUnmount={true}
      >
        {/* Your existing game content */}
        {this.renderGameLayout()}
      </LogProvider>
    );
  }
}`}
                </pre>

                <h4>2. Component-Level Logging</h4>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {`// In your game components
import { useGameLogger } from './_shared/react-contexts/log-context';

const GamePiece = ({ pieceId, position }) => {
  const logger = useGameLogger('GamePiece');
  
  const handleMove = (newPosition) => {
    logger.logInfo('Piece moved', {
      pieceId,
      fromPosition: position,
      toPosition: newPosition
    });
  };
  
  return (
    <div onClick={() => handleMove({ x: position.x + 1, y: position.y })}>
      Game Piece
    </div>
  );
};`}
                </pre>

                <h4>3. Error Handling</h4>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {`// Error boundary or try-catch blocks
const handleGameAction = async () => {
  const logger = useGameLogger('GameAction');
  
  try {
    // Game logic here
    logger.logInfo('Action completed successfully');
  } catch (error) {
    logger.logError('Action failed', {
      error: error.message,
      stack: error.stack
    });
  }
};`}
                </pre>

                <h4>4. Game End Handling</h4>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {`// When game ends
const handleGameEnd = async () => {
  const logger = useGameLogger('GameEnd');
  
  logger.logInfo('Game ending', {
    finalScore: score,
    duration: gameDuration,
    playerActions: actionCount
  });
  
  try {
    await logger.sendLogsToBackend();
    console.log('Game logs sent successfully');
  } catch (error) {
    console.error('Failed to send game logs:', error);
  }
};`}
                </pre>
            </div>
        </div>
    );
};

export default GameIntegrationExample; 