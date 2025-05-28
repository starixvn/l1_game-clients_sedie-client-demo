import { FishPrawnCrabSymbol } from '../../../_shared/components/fish-prawn-crab-dice';
import { resultMapper, oddMapper } from './fish-prawn-crab-utils';

export const constants = {
    resultMapper,
    oddMapper
};

export const ANIMATION_DURATION_MS = 3000;

export const MockRoundHistoryItem = {
    "roundId": 2786845,
    "result": {
        "dice1": 1,
        "dice2": 1,
        "dice3": 2
    },
    "settlementResult": {
        "stag": false,
        "gourd": true,
        "rooster": true,
        "fish": false,
        "crab": false,
        "prawn": false
    }
};

export const blinkRoundItem = {
    "dice1": FishPrawnCrabSymbol.RESULT,
    "dice2": FishPrawnCrabSymbol.RESULT,
    "dice3": FishPrawnCrabSymbol.RESULT
}


export const emptyRoundItem = {
    "dice1": FishPrawnCrabSymbol.EMPTY,
    "dice2": FishPrawnCrabSymbol.EMPTY,
    "dice3": FishPrawnCrabSymbol.EMPTY
}

