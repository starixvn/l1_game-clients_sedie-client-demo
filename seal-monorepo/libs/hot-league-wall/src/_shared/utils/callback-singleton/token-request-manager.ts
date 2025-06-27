import { CallbackSingleton } from './callback-singleton';

export class TokenRequestManager extends CallbackSingleton<() => Promise<string | null>> {
    private constructor() {
        super();
    }

    public static getInstance(): TokenRequestManager {
        if (!TokenRequestManager.instance) {
            TokenRequestManager.instance = new TokenRequestManager();
        }
        return TokenRequestManager.instance;
    }

    public setTokenRequestCallback(callback: () => Promise<string | null>): void {
        this.setCallback(callback);
    }

    public getTokenRequestCallback(): (() => Promise<string | null>) | null {
        return this.getCallback();
    }

    public async executeTokenRequest(): Promise<string | null> {
        if (this.hasCallback()) {
            return await this.callback!();
        }
        return null;
    }
} 