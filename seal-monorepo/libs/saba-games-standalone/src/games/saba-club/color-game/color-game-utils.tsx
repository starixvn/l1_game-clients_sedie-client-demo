import { ColorGameSymbol } from "../../../_shared/components/color-game-dice";
import { ColorGameChoices } from "./type";

// Map string keys to numeric values
export const resultMapper: Record<ColorGameChoices, number> = {
    [ColorGameChoices.yellow]: 0,
    [ColorGameChoices.red]: 1,
    [ColorGameChoices.pink]: 2,
    [ColorGameChoices.white]: 3,
    [ColorGameChoices.blue]: 4,
    [ColorGameChoices.green]: 5
};

// Convert numeric value to ColorGameSymbol enum
export const convertValueToSymbol = (value: number): ColorGameSymbol => {
    const symbolMap: Record<number, ColorGameSymbol> = {
        0: ColorGameSymbol.YELLOW,
        1: ColorGameSymbol.RED,
        2: ColorGameSymbol.PINK,
        3: ColorGameSymbol.WHITE,
        4: ColorGameSymbol.BLUE,
        5: ColorGameSymbol.GREEN
    };
    return symbolMap[value] ?? ColorGameSymbol.EMPTY;
};

// Map choices to their display icons/patterns
export const choiceToSymbolMap: Record<ColorGameChoices, ColorGameSymbol> = {
    [ColorGameChoices.yellow]: ColorGameSymbol.YELLOW,
    [ColorGameChoices.red]: ColorGameSymbol.RED,
    [ColorGameChoices.pink]: ColorGameSymbol.PINK,
    [ColorGameChoices.white]: ColorGameSymbol.WHITE,
    [ColorGameChoices.blue]: ColorGameSymbol.BLUE,
    [ColorGameChoices.green]: ColorGameSymbol.GREEN
};

// Create empty settlement result template
export const createEmptySettlementResult = () => {
    const result = Object.values(ColorGameChoices).reduce((acc, choice) => ({
        ...acc,
        [choice]: false
    }), { winner: ColorGameChoices.yellow } as { winner: ColorGameChoices } & Record<ColorGameChoices, boolean>);

    return result;
};

// Mapping for odds
export const oddMapper = { 1: "single", 2: "double", 3: "triple" };
