import { sentryHelper } from './sentry/sentry-helper';

interface IActionStorage {
    remove: (name: string) => void;
    get: (name: string) => string | object;
    set: (name: string, value: string | object, expiresDay?: number) => void;
    isAvailable: () => boolean;
}

declare global {
    interface Window {
        localMemory: object;
    }
}

export class LocalStorage implements IActionStorage {
    remove(name: string) {
        sentryHelper.logInfo('LocalStorage', 'Removing item from localStorage', {
            name,
            timestamp: Date.now()
        });

        localStorage.removeItem(name);
    }

    get(name: string) {
        sentryHelper.logInfo('LocalStorage', 'Getting item from localStorage', {
            name,
            timestamp: Date.now()
        });

        const storage = localStorage.getItem(name);
        if (!storage) {
            sentryHelper.logInfo('LocalStorage', 'Item not found in localStorage', {
                name,
                timestamp: Date.now()
            });
            return null;
        }
        try {
            const parsed = JSON.parse(storage);
            sentryHelper.logInfo('LocalStorage', 'Item retrieved successfully from localStorage', {
                name,
                hasValue: !!parsed,
                timestamp: Date.now()
            });
            return parsed;
        } catch (error) {
            sentryHelper.logWarning('LocalStorage', 'Failed to parse localStorage item', {
                name,
                error: error instanceof Error ? error.message : String(error),
                timestamp: Date.now()
            });
            console.warn(`LocalStorage ${name} can not parse`);
            return null;
        }
    }

    set(name: string, value: string | object) {
        sentryHelper.logInfo('LocalStorage', 'Setting item in localStorage', {
            name,
            hasValue: !!value,
            timestamp: Date.now()
        });

        localStorage.setItem(name, JSON.stringify(value));
    }

    isAvailable() {
        const test = 'test storage';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);

            sentryHelper.logInfo('LocalStorage', 'localStorage availability check passed', {
                timestamp: Date.now()
            });

            return true;
        } catch (e) {
            sentryHelper.logWarning('LocalStorage', 'localStorage availability check failed', {
                error: e instanceof Error ? e.message : String(e),
                timestamp: Date.now()
            });
            return false;
        }
    }
}

export class Memory implements IActionStorage {
    localMemory: any;
    constructor() {
        sentryHelper.logInfo('Memory', 'Initializing Memory storage', {
            timestamp: Date.now()
        });

        window.localMemory = {};
        this.localMemory = window.localMemory;
    }

    remove(name: string) {
        sentryHelper.logInfo('Memory', 'Removing item from memory storage', {
            name,
            timestamp: Date.now()
        });

        delete this.localMemory[name];
    }

    get(name: string) {
        sentryHelper.logInfo('Memory', 'Getting item from memory storage', {
            name,
            timestamp: Date.now()
        });

        const value = this.localMemory[name] ? this.localMemory[name] : null;

        sentryHelper.logInfo('Memory', 'Item retrieved from memory storage', {
            name,
            hasValue: !!value,
            timestamp: Date.now()
        });

        return value;
    }

    set(name: string, value: any) {
        sentryHelper.logInfo('Memory', 'Setting item in memory storage', {
            name,
            hasValue: !!value,
            timestamp: Date.now()
        });

        this.localMemory[name] = value;
    }

    isAvailable() {
        sentryHelper.logInfo('Memory', 'Memory storage availability check', {
            timestamp: Date.now()
        });
        return true;
    }
}

export class StorageManager {
    static supportStorage: IActionStorage;
    static prefixKey: string;

    private static initialize() {
        if (!StorageManager.supportStorage) {
            sentryHelper.logInfo('StorageManager', 'Initializing StorageManager', {
                timestamp: Date.now()
            });

            const allStorage = [new LocalStorage(), new Memory()];
            StorageManager.supportStorage = allStorage.filter((storage) => storage.isAvailable())[0];

            sentryHelper.logInfo('StorageManager', 'StorageManager initialized successfully', {
                storageType: StorageManager.supportStorage.constructor.name,
                timestamp: Date.now()
            });
        }
    }

    static getCurrentStorage() {
        StorageManager.initialize();
        return StorageManager.supportStorage;
    }

    static get(name: string) {
        const fullName = StorageManager.getName(name);

        sentryHelper.logInfo('StorageManager', 'Getting item from storage', {
            originalName: name,
            fullName,
            timestamp: Date.now()
        });

        const result = StorageManager.getCurrentStorage().get(fullName);

        sentryHelper.logInfo('StorageManager', 'Item retrieved from storage', {
            originalName: name,
            fullName,
            hasValue: !!result,
            timestamp: Date.now()
        });

        return result;
    }

    static set(name: string, value: string | object) {
        const fullName = StorageManager.getName(name);

        sentryHelper.logInfo('StorageManager', 'Setting item in storage', {
            originalName: name,
            fullName,
            hasValue: !!value,
            timestamp: Date.now()
        });

        StorageManager.getCurrentStorage().set(fullName, value);
    }

    static remove(name: string) {
        const fullName = StorageManager.getName(name);

        sentryHelper.logInfo('StorageManager', 'Removing item from storage', {
            originalName: name,
            fullName,
            timestamp: Date.now()
        });

        StorageManager.getCurrentStorage().remove(fullName);
    }

    static setPrefixKey(prefixKey: string) {
        sentryHelper.logInfo('StorageManager', 'Setting prefix key', {
            oldPrefix: StorageManager.prefixKey,
            newPrefix: prefixKey,
            timestamp: Date.now()
        });

        StorageManager.prefixKey = prefixKey;
    }

    static getName(name: string) {
        const fullName = StorageManager.prefixKey ? `${StorageManager.prefixKey}_${name}` : name;

        sentryHelper.logInfo('StorageManager', 'Getting full storage name', {
            originalName: name,
            fullName,
            hasPrefix: !!StorageManager.prefixKey,
            timestamp: Date.now()
        });

        return fullName;
    }
}

export const localStorageKeys = {
    isAuthorized: 'isAuthorized',
    betHistory: 'betHistory',
};
