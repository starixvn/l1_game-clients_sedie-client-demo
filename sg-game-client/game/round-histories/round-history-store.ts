import { inject, injectable } from "inversify";
import { action, computed, makeObservable, observable, when } from "mobx";
import { GameServiceMessage } from "../../shared";
import { GameSetting } from "../game-configs";
import { ROUND_STATE, RoundTimeStore } from "../rounds/round-time-store";
import { SettlementStore } from "../settlements/settlement-store";

export interface RoundHistory {
    roundId: number;
    drawId?: number;
    result: GameServiceMessage.TResult;
    settlementResult: GameServiceMessage.TSettlementResult;
    winningPlayers?: GameServiceMessage.TWinningPlayers;
    md5Result?: GameServiceMessage.ResultHash;
}

export interface IJoinGameHistory {
    roundHistory: RoundHistory;
}

export interface IFirstJoinGameHistory {
    roundTime: number;
    roundHistory: RoundHistory;
    staticHighlight: boolean;
    animationHighlight: boolean;
}

@injectable()
export class RoundHistoryStore {
    protected displayedRoundId: string = "roundId";

    constructor(
        @inject(RoundTimeStore) protected readonly roundTimeStore: RoundTimeStore,
        @inject(GameSetting) protected readonly gameSetting: GameSetting,
        @inject(SettlementStore) protected readonly settlementStore: SettlementStore,
        public histories = [],
        public joinGameHistory = null,
        public firstJoinGameHistory = null,
        public receivedInGame = false
    ) {
        this.histories = histories;
        this.joinGameHistory = joinGameHistory;
        this.firstJoinGameHistory = firstJoinGameHistory;
        this.receivedInGame = receivedInGame;

        makeObservable(this, {
            receivedInGame: observable,
            firstJoinGameHistory: observable,
            histories: observable,
            joinGameHistory: observable,

            isValidHistories: computed,

            getLastRound: action,
            insertNewRound: action,
            limitNumberRoundHistory: action,
            updateHistoriesInGame: action,
            clearRoundHistories: action,
            generateJoinGameData: action,
        });

        when(
            () => this.isValidHistories,
            () => {
                this.generateJoinGameData();
            }
        );
    }
    generateJoinGameData() {
        const lastRound = this.getLastRound();
        const roundTime = this.roundTimeStore.roundTime;
        this.firstJoinGameHistory = {
            roundTime,
            roundHistory: lastRound,
            staticHighlight: this.roundTimeStore.isPlacingBet || this.roundTimeStore.isStartRound,
            animationHighlight: this.roundTimeStore.isShowAnimationResult || this.roundTimeStore.isShowResult,
        };

        if (this.roundTimeStore.isShowAnimationResult || this.roundTimeStore.isShowResult) {
            const showResultByFinish =
                this.settlementStore.currentFinish && this.settlementStore.currentFinish[this.displayedRoundId] >= lastRound[this.displayedRoundId];
            if (!showResultByFinish) {
                this.joinGameHistory = {
                    roundHistory: lastRound,
                };
            }
        }
    }

    get isValidHistories(): boolean {
        const { roundTimeStore } = this;
        if (!this.receivedInGame || roundTimeStore.roundState === ROUND_STATE.STOP_GAME_LOOP) {
            return false;
        }

        return true;
    }

    getLastRound() {
        return this.histories?.[0];
    }

    insertNewRound(finish: GameServiceMessage.Finish) {
        const currentRound = finish as RoundHistory;
        if (this.histories[0] && this.histories[0][this.displayedRoundId] === currentRound[this.displayedRoundId]) {
            return;
        }
        const cloneHistories = JSON.parse(JSON.stringify(this.histories));
        cloneHistories.unshift(currentRound);
        this.limitNumberRoundHistory(cloneHistories);

        this.histories = cloneHistories;
    }

    limitNumberRoundHistory(roundHistories: any) {
        if (roundHistories.length > this.gameSetting.numberOfRoundHistory) {
            roundHistories.pop();
        }
    }

    updateHistoriesInGame(roundHistories: RoundHistory[]) {
        if (roundHistories.length > 0) {
            const lastRound = roundHistories[0];
            const missingNewRound = this.settlementStore.currentFinish && this.settlementStore.currentFinish[this.displayedRoundId] > lastRound[this.displayedRoundId];
            if (missingNewRound) {
                roundHistories.unshift(this.settlementStore.currentFinish as RoundHistory);
            }
            this.limitNumberRoundHistory(roundHistories);
        }
        this.histories = roundHistories;

        this.receivedInGame = true;
    }

    clearRoundHistories() {
        this.histories = [];
    }
}
