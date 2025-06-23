// This file tests if all the exports are working correctly

// Import from index
import {
    GameBase,
    GatewayGameBase,
    GameConnectionService,
    GameUIService,
    GameLoadingView,
    GameDisconnectView,
    IGameBaseState,
    IGatewayGameBaseState,
    GameBaseComponent
} from '../';

// Types for the test function to make TypeScript happy
type ImportTest = {
    gameBase: typeof GameBase;
    gatewayGameBase: typeof GatewayGameBase;
    connectionService: typeof GameConnectionService;
    uiService: typeof GameUIService;
    loadingView: typeof GameLoadingView;
    disconnectView: typeof GameDisconnectView;
    gameBaseState: IGameBaseState;
    gatewayGameBaseState: IGatewayGameBaseState;
    gameBaseComponent: GameBaseComponent;
};

// This is just a dummy test function that will never be executed
// It's only here to check that the imports are working
function testImports(): ImportTest {
    return {
        gameBase: GameBase,
        gatewayGameBase: GatewayGameBase,
        connectionService: GameConnectionService,
        uiService: GameUIService,
        loadingView: GameLoadingView,
        disconnectView: GameDisconnectView,
        gameBaseState: {} as IGameBaseState,
        gatewayGameBaseState: {} as IGatewayGameBaseState,
        gameBaseComponent: {} as GameBaseComponent
    };
}

export default testImports; 