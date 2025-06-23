import { LobbyStore } from 'libs/saba-games/src/_shared/states/lobby/lobby-store';
import { makeAutoObservable } from 'mobx';

// Mock mobx
jest.mock('mobx', () => ({
    makeAutoObservable: jest.fn()
}));

describe('LobbyStore', () => {
    let lobbyStore: LobbyStore;

    beforeEach(() => {
        jest.clearAllMocks();
        lobbyStore = new LobbyStore();
    });

    it('should be properly instantiated', () => {
        expect(lobbyStore).toBeInstanceOf(LobbyStore);
        expect(makeAutoObservable).toHaveBeenCalledWith(lobbyStore);
    });

    it('should initialize tryToConnectCount to 0', () => {
        expect(lobbyStore.tryToConnectCount).toBe(0);
    });

    describe('handleTryToConnect', () => {
        it('should increment tryToConnectCount by 1', () => {
            lobbyStore.handleTryToConnect();
            expect(lobbyStore.tryToConnectCount).toBe(1);
        });

        it('should increment tryToConnectCount multiple times', () => {
            lobbyStore.handleTryToConnect();
            lobbyStore.handleTryToConnect();
            lobbyStore.handleTryToConnect();
            expect(lobbyStore.tryToConnectCount).toBe(3);
        });

        it('should not throw any errors', () => {
            expect(() => lobbyStore.handleTryToConnect()).not.toThrow();
        });
    });

    describe('observable state', () => {
        it('should maintain state between method calls', () => {
            expect(lobbyStore.tryToConnectCount).toBe(0);
            lobbyStore.handleTryToConnect();
            expect(lobbyStore.tryToConnectCount).toBe(1);
            lobbyStore.handleTryToConnect();
            expect(lobbyStore.tryToConnectCount).toBe(2);
        });

        it('should create new instance with fresh state', () => {
            const newStore = new LobbyStore();
            expect(newStore.tryToConnectCount).toBe(0);
            newStore.handleTryToConnect();
            expect(newStore.tryToConnectCount).toBe(1);
            expect(lobbyStore.tryToConnectCount).toBe(0); // Original store unchanged
        });
    });
}); 
