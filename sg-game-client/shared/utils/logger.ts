import { ignoreErrors } from "../constants/ignore-errors";

declare global {
    interface Window {
        Sentry: any;
    }
}

export const sentryLogger = {
    sentryUrl: "",
    env: "",
    identifier: "",
    loaded: false,
    isEnabled: () => {
        if (typeof document !== "undefined") {
            return sentryLogger.sentryUrl && document?.head;
        }

        return false;
    },
    loadScript: () => {
        if (globalThis.Sentry && !sentryLogger.loaded) {
            globalThis.Sentry.init({
                dsn: sentryLogger.sentryUrl,
                environment: sentryLogger.env,
                maxValueLength: 5000,
                ignoreErrors,
            });
            globalThis.Sentry.setTag("game-client", sentryLogger.identifier);

            sentryLogger.loaded = true;
        }
    },
    start: (sentryUrl = "", env = "", identifier = "") => {
        try {
            if (!sentryUrl) {
                return;
            }
            sentryLogger.sentryUrl = sentryUrl;
            sentryLogger.env = env;
            sentryLogger.identifier = identifier;

            if (typeof document !== "undefined") {
                const sentryScript = document?.createElement("script");
                if (sentryScript) {
                    sentryScript.setAttribute("id", "sentry-logger");
                    sentryScript.setAttribute("src", "https://browser.sentry-cdn.com/5.15.0/bundle.min.js");
                    sentryScript.setAttribute("integrity", "sha384-+ysfQckQvwCB5SppH41IScIz/Iynt2pePnJNMl+D7ZOzDJ+VYhQEuwB0pA60IDM0");
                    sentryScript.setAttribute("crossorigin", "anonymous");
                    sentryScript.onload = () => {
                        sentryLogger.loadScript();
                    };
                }
                document?.head.appendChild(sentryScript);
            }
        } catch (err) {
            console.log(err);
        }
    },

    logInfo: (message: string) => {
        if (sentryLogger.isEnabled()) {
            sentryLogger.loadScript();
            globalThis.Sentry?.captureMessage(`${sentryLogger.identifier}: ${message}`);
        }
    },

    logError: (exception: string | Error) => {
        if (sentryLogger.isEnabled()) {
            sentryLogger.loadScript();
            globalThis.Sentry?.captureMessage(`${sentryLogger.identifier}: ${exception}`, "error");
        }
    },
};
