import { Converter } from 'sc-scoreboards';
import { choices, OverUnderSettlementResult } from '../../../types/settlement-result';

export class OverUnderBigRoadConverter extends Converter<OverUnderSettlementResult> {
    static addBlinkNode(rounds: OverUnderSettlementResult[]) {
        const lastRound = rounds.find((round) => round.over || round.under);

        const blinkRound: OverUnderSettlementResult = {
            over: lastRound?.over,
            under: undefined,
        };

        rounds.unshift(blinkRound);
    }

    static instance = new OverUnderBigRoadConverter();

    protected positiveKey(): string {
        return choices.over;
    }

    protected specialKey(): string {
        return '';
    }
}
