import { inject, injectable } from "inversify";
import { StorageManager, localStorageKeys } from "../../shared/utils";
import { PlayerSelection, PlayerSelectionStore } from "./player-selection-store";

export namespace PlayerSelectionHandlers {
    @injectable()
    export class InitHandlers {
        constructor(@inject(PlayerSelectionStore) private playerIngameSelectionStore: PlayerSelectionStore) { }

        async handle() {
            const settings = StorageManager.get(localStorageKeys.playerIngameSelections);
            if (settings) {
                Object.keys(settings)?.forEach((key) => {
                    try {
                        this.playerIngameSelectionStore[key] = settings[key];
                    } catch (err) {
                        console.log("Player selections init error: key ", key);
                    }
                });
            }
        }
    }

    @injectable()
    export class ChipHandlers {
        constructor(@inject(PlayerSelectionStore) private readonly playerIngameSelectionStore: PlayerSelectionStore) { }

        async handle(chip: number) {
            this.playerIngameSelectionStore.chip = chip;
            StorageManager.set(localStorageKeys.playerIngameSelections, this.playerIngameSelectionStore as PlayerSelection);
        }
    }

    @injectable()
    export class ClearHandlers {
        constructor(@inject(PlayerSelectionStore) private readonly playerIngameSelectionStore: PlayerSelectionStore) { }

        async handle() {
            this.playerIngameSelectionStore.setDefaultValues();
            StorageManager.remove(localStorageKeys.playerIngameSelections);
        }
    }
}
