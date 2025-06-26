import { inject, injectable } from "inversify";
import * as _ from "lodash";
import { action, computed, makeObservable, observable } from "mobx";
import { MainPlayerStore } from "../../players/main-player-store";
import { GameServiceMessage } from "../../shared";
import { NumberUtils } from "../../shared/utils/number-utils";

@injectable()
export class SettlementStore {
    private _winningPlayers: GameServiceMessage.TWinningPlayers = null;

    constructor(
        @inject(MainPlayerStore) protected readonly mainPlayerStore: MainPlayerStore,
        public roundId = 0,
        public result: GameServiceMessage.TResult = null,
        public settlementResult: GameServiceMessage.TSettlementResult = null,
        public isFinishedShowResult = false,
        public md5Result: GameServiceMessage.ResultHash = null,
        public currentFinish: GameServiceMessage.Finish = null,
        public pf: GameServiceMessage.ProvablyFair = null,
    ) {
        this.roundId = roundId;
        this.result = result;
        this.settlementResult = settlementResult;
        this.isFinishedShowResult = isFinishedShowResult;
        this.md5Result = md5Result;
        this.currentFinish = currentFinish;
        this.pf = pf;

        makeObservable(this, {
            roundId: observable,
            result: observable,
            settlementResult: observable,
            md5Result: observable,
            currentFinish: observable,
            pf: observable,
            isFinishedShowResult: observable,

            winningPlayers: computed,

            setSettlementStore: action,
            resetSettlementStore: action
        });
    }

    get winningPlayers() {
        if (this._winningPlayers) {
            const convertedWinningPlayers = {};
            Object.keys(this._winningPlayers).forEach((key) => {
                const winningPlayer = this._winningPlayers[key];
                convertedWinningPlayers[key] = {
                    ...winningPlayer,
                    bet: NumberUtils.getValueByCurrency(winningPlayer.bet, this.mainPlayerStore.rate, winningPlayer.rate),
                };
            });
            return convertedWinningPlayers;
        }
        return this._winningPlayers;
    }

    set winningPlayers(winningPlayers: GameServiceMessage.TWinningPlayers) {
        !_.isEmpty(winningPlayers) && (this._winningPlayers = winningPlayers);
    }

    setSettlementStore(finish: GameServiceMessage.Finish | undefined) {
        this.currentFinish = finish;
        this.isFinishedShowResult = false;
        finish?.roundId && (this.roundId = finish.roundId);
        finish?.result && (this.result = finish.result);
        finish?.settlementResult && (this.settlementResult = finish.settlementResult);
        finish?.winningPlayers && (this.winningPlayers = finish.winningPlayers);
        finish?.md5Result && (this.md5Result = finish.md5Result);
        finish?.pf && (this.pf = finish.pf);
    }

    resetSettlementStore() {
        this._winningPlayers = null;
        this.settlementResult = null;
        this.result = null;
        this.isFinishedShowResult = false;
        this.md5Result = null;
        this.pf = null;

        this.currentFinish = null;
    }
}
