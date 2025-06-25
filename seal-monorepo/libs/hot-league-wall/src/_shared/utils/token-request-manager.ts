export class TokenRequestManager {
    private static instance: TokenRequestManager;
    private tokenRequestCallback: (() => Promise<string | null>) | null = null;

    private constructor() {
        // Private constructor to prevent direct construction calls with the `new` operator
    }

    public static getInstance(): TokenRequestManager {
        if (!TokenRequestManager.instance) {
            TokenRequestManager.instance = new TokenRequestManager();
        }
        return TokenRequestManager.instance;
    }

    public setTokenRequestCallback(callback: () => Promise<string | null>): void {
        this.tokenRequestCallback = callback;
    }

    public getTokenRequestCallback(): (() => Promise<string | null>) | null {
        return this.tokenRequestCallback;
    }

    public async executeTokenRequest(): Promise<string | null> {
        if (this.tokenRequestCallback) {
            return await this.tokenRequestCallback();
        }
        return null;
    }
} 