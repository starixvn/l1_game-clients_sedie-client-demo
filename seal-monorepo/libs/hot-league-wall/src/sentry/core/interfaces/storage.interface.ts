/**
 * Storage interface for abstracting localStorage operations
 * Follows Dependency Inversion Principle
 */
export interface IStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}

/**
 * Configuration storage interface
 */
export interface IConfigStorage {
    getLogLevel(): string;
    setLogLevel(level: string): void;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    isDebugMode(): boolean;
    setDebugMode(debugMode: boolean): void;
    getComponentLogLevel(componentName: string): string | null;
    setComponentLogLevel(componentName: string, level: string): void;
    isComponentEnabled(componentName: string): boolean;
    setComponentEnabled(componentName: string, enabled: boolean): void;
    clear(): void;
    clearComponent(componentName: string): void;
} 