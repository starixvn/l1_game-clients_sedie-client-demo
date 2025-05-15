import { LobbyHandlers } from 'libs/saba-games/src/_shared/states/lobby/lobby-handlers';
import { LobbyStore } from 'libs/saba-games/src/_shared/states/lobby/lobby-store';

// Mock LobbyStore
jest.mock('libs/saba-games/src/_shared/states/lobby/lobby-store', () => {
    return {
        LobbyStore: jest.fn().mockImplementation(() => ({
            handleTryToConnect: jest.fn()
        }))
    };
});

describe('LobbyHandlers', () => {
    let lobbyStore: jest.Mocked<LobbyStore>;
    let tryToConnectHandler: LobbyHandlers.TryToConnectHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        lobbyStore = new LobbyStore() as jest.Mocked<LobbyStore>;
        tryToConnectHandler = new LobbyHandlers.TryToConnectHandler(lobbyStore);
    });

    describe('TryToConnectHandler', () => {
        it('should be properly instantiated with LobbyStore', () => {
            expect(tryToConnectHandler).toBeInstanceOf(LobbyHandlers.TryToConnectHandler);
            expect(lobbyStore).toBeDefined();
        });

        it('should call handleTryToConnect on the store when handle is called', () => {
            tryToConnectHandler.handle();
            expect(lobbyStore.handleTryToConnect).toHaveBeenCalledTimes(1);
        });

        it('should not throw any errors when handle is called', () => {
            expect(() => tryToConnectHandler.handle()).not.toThrow();
        });

        it('should maintain the same store instance across multiple handle calls', () => {
            tryToConnectHandler.handle();
            tryToConnectHandler.handle();
            expect(lobbyStore.handleTryToConnect).toHaveBeenCalledTimes(2);
        });
    });
}); 
