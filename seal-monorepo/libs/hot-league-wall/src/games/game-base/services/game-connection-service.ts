import { GameBaseComponent } from '../interfaces/common-types';

export class GameConnectionService {
    static createConnection(component: GameBaseComponent) {
        console.log('🔴 GameConnectionService: createConnection called');
        document.addEventListener('visibilitychange', component.onVisibilityChange);
        component.connectToServiceGateway();
    }

    static terminateConnection(component: GameBaseComponent) {
        console.log('🔴 GameConnectionService: terminateConnection called');
        component.terminateConnection();
    }

    static handleReconnect(component: GameBaseComponent) {
        console.log('🔴 GameConnectionService: handleReconnect called');
        GameConnectionService.terminateConnection(component);
        GameConnectionService.createConnection(component);
        component.resetStateWhenReconnect();
    }
} 