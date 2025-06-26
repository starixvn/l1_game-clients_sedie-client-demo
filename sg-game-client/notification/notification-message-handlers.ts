import { inject, injectable } from "inversify";
import { AuthHandlers } from "../auth/auth-handlers";
import { IHandler, NotificationServiceMessage } from "../shared";
import { NotificationStore } from "./notification-store";
import { JackpotWinnerStore } from "./jackpot-winner-store";

export namespace NotificationMessageHandlers {
    @injectable()
    export class SessionTimeout implements IHandler<void> {
        constructor(
            @inject(AuthHandlers.SignOut) private readonly signOut: AuthHandlers.SignOut,
            @inject(NotificationStore) private readonly notificationStore: NotificationStore
        ) {}

        name = NotificationServiceMessage.sessionTimeoutEventName;

        handle() {
            this.notificationStore.connection?.disconnect();
            this.signOut.handle();
        }
    }

    @injectable()
    export class NotifyJackpotWinner implements IHandler<NotificationServiceMessage.JackpotWinner> {
        constructor(@inject(JackpotWinnerStore) private readonly store: JackpotWinnerStore) {}

        name = NotificationServiceMessage.JackpotWinner.eventName;

        handle(jackpotWinner: NotificationServiceMessage.JackpotWinner) {
            this.store.setJackpotWinner(jackpotWinner);
        }
    }
}
