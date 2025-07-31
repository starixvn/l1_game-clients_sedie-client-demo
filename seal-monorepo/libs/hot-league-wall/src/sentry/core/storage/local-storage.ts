import { IStorage, IConfigStorage } from '../interfaces';

/**
 * LocalStorage implementation
 * Follows Single Responsibility Principle - only handles localStorage operations
 */
export class LocalStorage implements IStorage {
    getItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return null;
        }
    }

    setItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('Failed to write to localStorage:', error);
        }
    }

    removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }

    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }
}

/**
 * Sentry configuration storage implementation
 * Follows Single Responsibility Principle - only handles Sentry configuration storage
 */
export class SentryConfigStorage implements IConfigStorage {
    private storage: IStorage;
    private readonly LOG_LEVEL_KEY = 'sentry_log_level';
    private readonly ENABLED_KEY = 'hot-league-wall-debug-enabled';
    private readonly DEBUG_MODE_KEY = 'sentry_debug_mode';
    private readonly COMPONENT_LOG_LEVEL_PREFIX = 'sentry_component_log_level_';
    private readonly COMPONENT_ENABLED_PREFIX = 'sentry_component_enabled_';

    constructor(storage: IStorage = new LocalStorage()) {
        this.storage = storage;
    }

    getLogLevel(): string {
        return this.storage.getItem(this.LOG_LEVEL_KEY) || 'error';
    }

    setLogLevel(level: string): void {
        this.storage.setItem(this.LOG_LEVEL_KEY, level);
    }

    isEnabled(): boolean {
        return this.storage.getItem(this.ENABLED_KEY) !== 'false';
    }

    setEnabled(enabled: boolean): void {
        this.storage.setItem(this.ENABLED_KEY, enabled.toString());
    }

    isDebugMode(): boolean {
        return this.storage.getItem(this.DEBUG_MODE_KEY) === 'true';
    }

    setDebugMode(debugMode: boolean): void {
        this.storage.setItem(this.DEBUG_MODE_KEY, debugMode.toString());
    }

    getComponentLogLevel(componentName: string): string | null {
        const key = `${this.COMPONENT_LOG_LEVEL_PREFIX}${componentName}`;
        return this.storage.getItem(key);
    }

    setComponentLogLevel(componentName: string, level: string): void {
        const key = `${this.COMPONENT_LOG_LEVEL_PREFIX}${componentName}`;
        this.storage.setItem(key, level);
    }

    isComponentEnabled(componentName: string): boolean {
        const key = `${this.COMPONENT_ENABLED_PREFIX}${componentName}`;
        return this.storage.getItem(key) !== 'false';
    }

    setComponentEnabled(componentName: string, enabled: boolean): void {
        const key = `${this.COMPONENT_ENABLED_PREFIX}${componentName}`;
        this.storage.setItem(key, enabled.toString());
    }

    clear(): void {
        this.storage.removeItem(this.LOG_LEVEL_KEY);
        this.storage.removeItem(this.ENABLED_KEY);
        this.storage.removeItem(this.DEBUG_MODE_KEY);
    }

    clearComponent(componentName: string): void {
        const logLevelKey = `${this.COMPONENT_LOG_LEVEL_PREFIX}${componentName}`;
        const enabledKey = `${this.COMPONENT_ENABLED_PREFIX}${componentName}`;
        this.storage.removeItem(logLevelKey);
        this.storage.removeItem(enabledKey);
    }
} 