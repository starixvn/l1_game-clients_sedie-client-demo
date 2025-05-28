import { Converter } from 'sc-scoreboards';
import { choices, OddEvenSettlementResult } from '../../../types/settlement-result';

export class OddEvenBigRoadConverter extends Converter<OddEvenSettlementResult> {
    static addBlinkNode(rounds: OddEvenSettlementResult[]) {
        const lastRound = rounds.find((round) => round.odd || round.even);

        const blinkRound: any = {
            odd: lastRound?.odd,
            even: undefined,
        };

        rounds.unshift(blinkRound);
    }

    static instance = new OddEvenBigRoadConverter();

    protected positiveKey(): string {
        return choices.odd;
    }

    protected specialKey(): string {
        return '';
    }
}
