import { getMessage, GameState, Translator } from '../../../src/games/game-base/game-logic/message-logic';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';

describe('getMessage', () => {
    const mockTranslator = (key: string) => `translated:${key}`;
    const translator: Translator = { t: mockTranslator };

    const baseState: GameState = {
        roundState: undefined,
        placingBetStartTime: 0,
        countdownTimer: 0,
        isShowNextRoundMessage: false,
    };

    it('should return place bets message when roundState is PLACING_BET and placingBetStartTime === countdownTimer', () => {
        const state: GameState = {
            ...baseState,
            roundState: ROUND_STATE.PLACING_BET,
            placingBetStartTime: 10,
            countdownTimer: 10,
        };
        expect(getMessage(state, translator)).toEqual('translated:Common.message_place_bets');
    });

    it('should return null when roundState is PLACING_BET and placingBetStartTime !== countdownTimer', () => {
        const state: GameState = {
            ...baseState,
            roundState: ROUND_STATE.PLACING_BET,
            placingBetStartTime: 10,
            countdownTimer: 5,
        };
        expect(getMessage(state, translator)).toBeNull();
    });

    it('should return stop bet message when roundState is LOCKING_BET', () => {
        const state: GameState = {
            ...baseState,
            roundState: ROUND_STATE.LOCKING_BET,
        };
        expect(getMessage(state, translator)).toEqual('translated:Common.message_stop_bet');
    });

    it('should return next round message when isShowNextRoundMessage is true and roundState is not PLACING_BET or LOCKING_BET', () => {
        const state: GameState = {
            ...baseState,
            roundState: ROUND_STATE.NONE,
            isShowNextRoundMessage: true,
        };
        expect(getMessage(state, translator)).toEqual('translated:Common.message_placebet_next_round');
    });

    it('should return null when isShowNextRoundMessage is false and roundState is not PLACING_BET or LOCKING_BET', () => {
        const state: GameState = {
            ...baseState,
            roundState: ROUND_STATE.NONE,
            isShowNextRoundMessage: false,
        };
        expect(getMessage(state, translator)).toBeNull();
    });

}); 