import SeDieBetOptions from "../../sedie/bet-option/sedie-bet-options";

export default class VIPSeDieBetOptions extends SeDieBetOptions {
    public renderSubOptions(betChoice: string, odd: number, fractional: boolean, name: string = "", isBoostedChoice: boolean = false) {
        return super.renderSubOptions(betChoice, odd, fractional, name, isBoostedChoice);
    }

    public renderMainOption(name: string, odd: number, betChoice: string, fractional: boolean, isBoostedChoice: boolean = false) {
        return super.renderMainOption(name, odd, betChoice, fractional, isBoostedChoice);
    }
} 