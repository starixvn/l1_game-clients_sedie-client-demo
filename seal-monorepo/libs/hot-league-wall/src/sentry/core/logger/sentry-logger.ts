import * as Sentry from '@sentry/react';
import { ILogger } from '../interfaces';
import { SentryLogLevel } from '../sentry-types';

/**
 * Sentry Logger implementation
 * Follows Single Responsibility Principle - only handles Sentry logging
 */
export class SentryLogger implements ILogger {
    private componentName: string;
    private logLevel: SentryLogLevel;
    private enabled: boolean;

    constructor(componentName: string, logLevel: SentryLogLevel = SentryLogLevel.ERROR, enabled = true) {
        this.componentName = componentName;
        this.logLevel = logLevel;
        this.enabled = enabled;
    }

    logTrace(message: string, context?: Record<string, any>): void {
        if (this.isLoggingEnabled(SentryLogLevel.TRACE)) {
            Sentry.addBreadcrumb({
                category: this.componentName,
                message,
                level: 'debug',
                data: context
            });
        }
    }

    logDebug(message: string, context?: Record<string, any>): void {
        if (this.isLoggingEnabled(SentryLogLevel.DEBUG)) {
            Sentry.addBreadcrumb({
                category: this.componentName,
                message,
                level: 'debug',
                data: context
            });
        }
    }

    logInfo(message: string, context?: Record<string, any>): void {
        if (this.isLoggingEnabled(SentryLogLevel.INFO)) {
            Sentry.addBreadcrumb({
                category: this.componentName,
                message,
                level: 'info',
                data: context
            });
        }
    }

    logWarning(message: string, context?: Record<string, any>): void {
        if (this.isLoggingEnabled(SentryLogLevel.WARN)) {
            Sentry.addBreadcrumb({
                category: this.componentName,
                message,
                level: 'warning',
                data: context
            });
        }
    }

    logError(error: Error | string, context?: Record<string, any>): void {
        if (this.isLoggingEnabled(SentryLogLevel.ERROR)) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            Sentry.captureException(error, {
                tags: { component: this.componentName },
                extra: context
            });
        }
    }

    logFatal(error: Error | string, context?: Record<string, any>): void {
        if (this.isLoggingEnabled(SentryLogLevel.FATAL)) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            Sentry.captureException(error, {
                tags: { component: this.componentName, level: 'fatal' },
                extra: context
            });
        }
    }

    isLoggingEnabled(level: SentryLogLevel): boolean {
        if (!this.enabled) return false;

        const levelHierarchy = {
            [SentryLogLevel.TRACE]: 0,
            [SentryLogLevel.DEBUG]: 1,
            [SentryLogLevel.INFO]: 2,
            [SentryLogLevel.WARN]: 3,
            [SentryLogLevel.ERROR]: 4,
            [SentryLogLevel.FATAL]: 5
        };

        return levelHierarchy[level] >= levelHierarchy[this.logLevel];
    }

    setLogLevel(level: SentryLogLevel): void {
        this.logLevel = level;
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    getComponentName(): string {
        return this.componentName;
    }
} 