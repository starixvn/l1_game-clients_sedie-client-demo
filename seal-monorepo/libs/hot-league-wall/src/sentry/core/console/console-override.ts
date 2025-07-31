import { IConsoleOverride, ILogger } from '../interfaces';

/**
 * Console override implementation
 * Follows Single Responsibility Principle - only handles console method overrides
 */
export class ConsoleOverride implements IConsoleOverride {
    private logger: ILogger;
    private isOverriddenFlag = false;
    private originalConsoleError: typeof console.error;
    private originalConsoleWarn: typeof console.warn;
    private originalConsoleInfo: typeof console.info;
    private originalConsoleDebug: typeof console.debug;
    private originalConsoleTrace: typeof console.trace;
    private originalConsoleLog: typeof console.log;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.originalConsoleError = console.error;
        this.originalConsoleWarn = console.warn;
        this.originalConsoleInfo = console.info;
        this.originalConsoleDebug = console.debug;
        this.originalConsoleTrace = console.trace;
        this.originalConsoleLog = console.log;
    }

    override(): void {
        if (this.isOverriddenFlag) return;

        console.error = (...args: any[]) => {
            this.logger.logError(args.join(' '));
            this.originalConsoleError.apply(console, args);
        };

        console.warn = (...args: any[]) => {
            this.logger.logWarning(args.join(' '));
            this.originalConsoleWarn.apply(console, args);
        };

        console.info = (...args: any[]) => {
            this.logger.logInfo(args.join(' '));
            this.originalConsoleInfo.apply(console, args);
        };

        console.debug = (...args: any[]) => {
            this.logger.logDebug(args.join(' '));
            this.originalConsoleDebug.apply(console, args);
        };

        console.trace = (...args: any[]) => {
            this.logger.logTrace(args.join(' '));
            this.originalConsoleTrace.apply(console, args);
        };

        console.log = (...args: any[]) => {
            this.logger.logInfo(args.join(' '));
            this.originalConsoleLog.apply(console, args);
        };

        this.isOverriddenFlag = true;
    }

    restore(): void {
        if (!this.isOverriddenFlag) return;

        console.error = this.originalConsoleError;
        console.warn = this.originalConsoleWarn;
        console.info = this.originalConsoleInfo;
        console.debug = this.originalConsoleDebug;
        console.trace = this.originalConsoleTrace;
        console.log = this.originalConsoleLog;

        this.isOverriddenFlag = false;
    }

    isOverridden(): boolean {
        return this.isOverriddenFlag;
    }
} 