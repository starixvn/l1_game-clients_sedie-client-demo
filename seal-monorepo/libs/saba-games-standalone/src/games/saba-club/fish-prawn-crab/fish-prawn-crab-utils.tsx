import { FishPrawnCrabSymbol } from "../../../_shared/components/fish-prawn-crab-dice";
import { FishPrawnCrabChoices } from "./type";

// Map string keys to numeric values
export const resultMapper = {
    stag: 0,
    gourd: 1,
    rooster: 2,
    fish: 3,
    crab: 4,
    prawn: 5
};

// Map numeric values to FishPrawnCrabSymbol enum values
export const convertValueToSymbol = (value: number): FishPrawnCrabSymbol => {
    switch (value) {
        case resultMapper.stag: return FishPrawnCrabSymbol.STAG;
        case resultMapper.gourd: return FishPrawnCrabSymbol.GOURD;
        case resultMapper.rooster: return FishPrawnCrabSymbol.ROOSTER;
        case resultMapper.fish: return FishPrawnCrabSymbol.FISH;
        case resultMapper.crab: return FishPrawnCrabSymbol.CRAB;
        case resultMapper.prawn: return FishPrawnCrabSymbol.PRAWN;
        default: return FishPrawnCrabSymbol.EMPTY;
    }
};

// Map choices to their display icons/patterns
export const choiceToSymbolMap: Record<FishPrawnCrabChoices, FishPrawnCrabSymbol> = {
    [FishPrawnCrabChoices.fish]: FishPrawnCrabSymbol.FISH,
    [FishPrawnCrabChoices.prawn]: FishPrawnCrabSymbol.PRAWN,
    [FishPrawnCrabChoices.crab]: FishPrawnCrabSymbol.CRAB,
    [FishPrawnCrabChoices.rooster]: FishPrawnCrabSymbol.ROOSTER,
    [FishPrawnCrabChoices.gourd]: FishPrawnCrabSymbol.GOURD,
    [FishPrawnCrabChoices.stag]: FishPrawnCrabSymbol.STAG,
};

// Create empty settlement result template
export const createEmptySettlementResult = () => ({
    winner: FishPrawnCrabChoices.fish,
    [FishPrawnCrabChoices.fish]: false,
    [FishPrawnCrabChoices.prawn]: false,
    [FishPrawnCrabChoices.crab]: false,
    [FishPrawnCrabChoices.rooster]: false,
    [FishPrawnCrabChoices.gourd]: false,
    [FishPrawnCrabChoices.stag]: false
});

// Mapping for odds
export const oddMapper = { 1: "single", 2: "double", 3: "triple" };
