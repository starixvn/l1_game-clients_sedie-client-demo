import { GameBaseComponent } from '../interfaces/common-types';

export class GameConnectionService {
    static createConnection(component: GameBaseComponent) {
        document.addEventListener('visibilitychange', component.onVisibilityChange);
        component.connectToServiceGateway();
    }

    static terminateConnection(component: GameBaseComponent) {
        component.terminateConnection();
    }

    static handleReconnect(component: GameBaseComponent) {
        GameConnectionService.terminateConnection(component);
        GameConnectionService.createConnection(component);
        component.resetStateWhenReconnect();
    }
} 