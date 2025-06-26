import { enableLogging } from "mobx-logger";
import { StorageManager } from "./storage-manager";

export const initMobxLogger = () => {
    try {
        const enabledMobxDebug = !!StorageManager.get("enabledMobxDebug");

        if (enabledMobxDebug) {
            enableLogging();
        }
    } catch {}
};
