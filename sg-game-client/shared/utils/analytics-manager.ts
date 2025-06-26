export enum TrackingEvent {
    Button = "Button_Event",
}

export enum TrackingAction {
    ToggleOn = "ToggleOn",
    ToggleOff = "ToggleOff",
    Click = "Click",
    Show = "Show",
}

export interface TrackingParameter {
    location?: string;
    action?: string;
    object_name?: string;
    game_name?: string;
}

export class AnalyticsManager {
    protected static instance: AnalyticsManager;

    protected static get() {
        if (!this.instance) {
            this.instance = new AnalyticsManager();
            this.instance.initialize();
        }

        return this.instance;
    }

    private _gtag: (type: string, detail: string, params: TrackingParameter) => void;

    private initialize(): void {
        this._gtag = globalThis.gtag;
    }

    static trackEvent(event: string, params: TrackingParameter) {
        AnalyticsManager.get();
        AnalyticsManager.instance._gtag && AnalyticsManager.instance._gtag("event", event, params);
    }
}

export const PFObjectName = {
    ReBetButton: "RebetButton",
    PFIcon: "PF Icon",
    PFClientSeed: "PF Client Seed",
    PFUseGuide: "PF Use Guide",
    MusicEnabled: "musicEnabled",
    SfxEnabled: "sfxEnabled",
};
