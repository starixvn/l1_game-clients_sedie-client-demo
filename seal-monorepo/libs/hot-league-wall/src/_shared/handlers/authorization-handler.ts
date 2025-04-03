export default class AuthorizationHandler {
    private timeoutId: NodeJS.Timeout | null = null;
    private readonly maxTimeoutDuration = 10000;

    constructor(
        private readonly isAuthorized: boolean,
        private readonly isSignedIn: boolean,
        private readonly handleSignIn: () => void,
        private readonly autoCreateNickname: () => void
    ) {}

    public waitForAuthorization() {
        const interval = 100;
        const startTime = Date.now();
        this.clearTimeout();

        const checkAuthorization = () => {
            if (this.isAuthorized) {
                this.handleUserSignIn();
                this.clearTimeout();
            } else if (Date.now() - startTime < this.maxTimeoutDuration) {
                this.timeoutId = setTimeout(checkAuthorization, interval);
            }
        };

        this.timeoutId = setTimeout(checkAuthorization, interval);
    }

    public clearTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    private handleUserSignIn() {
        if (!this.isSignedIn) {
            this.handleSignIn();
        }
    }

    public handleWaitForAuthorize() {
        if (!this.isAuthorized) {
            this.autoCreateNickname();
        }
        this.waitForAuthorization();
    }
} 