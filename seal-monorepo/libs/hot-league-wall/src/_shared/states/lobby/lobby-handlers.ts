import { inject, injectable } from 'inversify';
import { LobbyStore } from './lobby-store';

export namespace LobbyHandlers {
    @injectable()
    export class TryToConnectHandler {
        constructor(@inject(LobbyStore) protected readonly store: LobbyStore) {}

        handle() {
            this.store.handleTryToConnect();
        }
    }
}
