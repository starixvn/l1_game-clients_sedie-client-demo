import * as gc from '@sg/sg-game-client';
import { appSettings } from '../app-settings';

interface SentryManagerConfig {
    dsn: string;
    environment: string;
    componentName: string;
    release?: string;
    debug?: boolean;
}

class SentryManager {
    private static instance: SentryManager;
    private isInitialized = false;
    private componentName: string = '';
    private originalConsoleError: typeof console.error;
    private originalConsoleWarn: typeof console.warn;
    private errorFilter!: (error: any) => boolean;

    private constructor() {
        this.originalConsoleError = console.error;
        this.originalConsoleWarn = console.warn;
    }

    static getInstance(): SentryManager {
        if (!SentryManager.instance) {
            SentryManager.instance = new SentryManager();
        }
        return SentryManager.instance;
    }

    initialize(config: SentryManagerConfig): void {
        if (this.isInitialized) {
            console.warn('SentryManager already initialized');
            return;
        }

        this.componentName = config.componentName;

        // Initialize the global Sentry with component-specific configuration
        try {
            gc.sentryLogger.start(
                config.dsn,
                config.environment,
                `${config.componentName}-client`
            );
        } catch (error) {
            console.error('Failed to initialize Sentry:', error);
            return;
        }

        // Set up error filtering to only capture component-specific errors
        this.setupErrorFiltering();

        // Override console methods to filter errors
        this.overrideConsoleMethods();

        this.isInitialized = true;
        console.log(`Sentry initialized for component: ${this.componentName}`);
    }

    private setupErrorFiltering(): void {
        // Create a filter function that only allows errors from our component
        this.errorFilter = (error: any): boolean => {
            // If it's a string error, check if it contains our component identifiers
            if (typeof error === 'string') {
                return this.isComponentError(error);
            }

            // If it's an Error object, check the stack trace
            if (error instanceof Error) {
                return this.isComponentError(error.message) || this.isComponentStack(error.stack || '');
            }

            // If it's an object with a message property
            if (error && typeof error === 'object' && error.message) {
                return this.isComponentError(error.message);
            }

            // Default to false for unknown error types
            return false;
        };
    }

    private isComponentError(message: string): boolean {
        const componentIdentifiers = [
            'HotLeagueWall',
            'hot-league-wall',
            'Lobby',
            'RNGSoccer',
            'App.tsx',
            'lobby',
            'games',
            'seal-vg-sg-index',
            'data-react="true"'
        ];

        return componentIdentifiers.some(identifier =>
            message.toLowerCase().includes(identifier.toLowerCase())
        );
    }

    private isComponentStack(stack: string): boolean {
        if (!stack) return false;

        const componentStackIdentifiers = [
            'hot-league-wall',
            'App.tsx',
            'lobby',
            'games',
            'RNGSoccer'
        ];

        return componentStackIdentifiers.some(identifier =>
            stack.toLowerCase().includes(identifier.toLowerCase())
        );
    }

    private overrideConsoleMethods(): void {
        // Override console.error to filter component-specific errors
        console.error = (...args: any[]) => {
            // Always log to original console for debugging
            this.originalConsoleError(...args);

            // Check if any of the arguments contain component-specific errors
            const hasComponentError = args.some(arg => this.errorFilter(arg));

            if (hasComponentError) {
                // Use the global Sentry logger for component-specific errors
                try {
                    const errorMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    gc.sentryLogger.logError(`[${this.componentName}] ${errorMessage}`);
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log to Sentry:', sentryError);
                }
            }
        };

        // Override console.warn to filter component-specific warnings
        console.warn = (...args: any[]) => {
            // Always log to original console for debugging
            this.originalConsoleWarn(...args);

            // Check if any of the arguments contain component-specific warnings
            const hasComponentWarning = args.some(arg => this.errorFilter(arg));

            if (hasComponentWarning) {
                // Use the global Sentry logger for component-specific warnings
                try {
                    const warningMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    gc.sentryLogger.logError(`[${this.componentName}] WARNING: ${warningMessage}`);
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log warning to Sentry:', sentryError);
                }
            }
        };
    }

    // Component-specific error logging
    logError(error: Error | string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        try {
            const errorMessage = typeof error === 'string' ? error : error.message;
            const fullMessage = `[${this.componentName}] ${errorMessage}`;

            if (context) {
                console.log(`[${this.componentName}] Error context:`, context);
            }

            gc.sentryLogger.logError(fullMessage);
        } catch (sentryError) {
            this.originalConsoleError('Failed to log error to Sentry:', sentryError);
        }
    }

    // Component-specific warning logging
    logWarning(warning: string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        try {
            const fullMessage = `[${this.componentName}] WARNING: ${warning}`;

            if (context) {
                console.log(`[${this.componentName}] Warning context:`, context);
            }

            gc.sentryLogger.logError(fullMessage);
        } catch (sentryError) {
            this.originalConsoleError('Failed to log warning to Sentry:', sentryError);
        }
    }

    // Component-specific info logging
    logInfo(info: string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        try {
            const fullMessage = `[${this.componentName}] INFO: ${info}`;

            if (context) {
                console.log(`[${this.componentName}] Info context:`, context);
            }

            // Note: Using logError for info as the global logger might not have logInfo
            gc.sentryLogger.logError(fullMessage);
        } catch (sentryError) {
            this.originalConsoleError('Failed to log info to Sentry:', sentryError);
        }
    }

    // Cleanup method
    close(): void {
        if (this.isInitialized) {
            // Restore original console methods
            console.error = this.originalConsoleError;
            console.warn = this.originalConsoleWarn;

            this.isInitialized = false;
            console.log(`Sentry closed for component: ${this.componentName}`);
        }
    }

    // Get component name for external use
    getComponentName(): string {
        return this.componentName;
    }
}

export default SentryManager; 