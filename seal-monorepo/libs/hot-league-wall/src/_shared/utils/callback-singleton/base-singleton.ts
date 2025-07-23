/**
 * Base Singleton Class
 * 
 * Provides a generic singleton pattern implementation that can be extended
 * by other classes to reduce code duplication.
 */
export abstract class BaseSingleton {
    protected static instance: any;

    protected constructor() {
        // Protected constructor to prevent direct construction calls with the `new` operator
    }

    /**
     * Reset the singleton instance (useful for testing)
     */
    protected static resetInstance(): void {
        this.instance = undefined;
    }
} 