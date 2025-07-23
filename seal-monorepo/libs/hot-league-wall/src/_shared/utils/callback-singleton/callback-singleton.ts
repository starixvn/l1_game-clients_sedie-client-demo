import { BaseSingleton } from './base-singleton';

/**
 * Callback Singleton Base Class
 * 
 * Provides a base implementation for singleton classes that manage callbacks.
 * Reduces duplication between TokenRequestManager and SyncMemberSiteBalance.
 * 
 * @template TCallback - The type of the callback function
 */
export abstract class CallbackSingleton<TCallback> extends BaseSingleton {
    protected callback: TCallback | null = null;

    protected constructor() {
        super();
    }

    /**
     * Set the callback function
     * @param callback - The callback function to set
     */
    public setCallback(callback: TCallback): void {
        this.callback = callback;
    }

    /**
     * Get the current callback function
     * @returns The current callback function or null if not set
     */
    public getCallback(): TCallback | null {
        return this.callback;
    }

    /**
     * Check if a callback is set
     * @returns True if a callback is set, false otherwise
     */
    protected hasCallback(): boolean {
        return this.callback !== null;
    }

    /**
     * Reset the singleton instance (useful for testing)
     */
    public static resetInstance(): void {
        super.resetInstance();
    }
} 