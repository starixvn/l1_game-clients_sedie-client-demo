import * as gc from "@sg/sg-game-client";
import { WinnerDisplay } from "../../../../_shared/components/winner-display/winner-display";
import { SettlementResultService } from "../services/settlement-result-service";
import Styles from "./color-game-animations.module.scss";

interface ResultDisplayProps {
    result: gc.GameServiceMessage.TResult;
    language?: string;
    className?: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
    result,
    language,
    className
}) => {
    const t = (key) => gc.Translator.t(key, { lng: language || '' });
    const settlementService = new SettlementResultService();

    if (!result || Object.keys(result).length === 0) {
        return null;
    }

    const diceSymbols = settlementService.getWinningTextListByResult(result);
    const resultText = diceSymbols.join(' - ');

    return <WinnerDisplay resultText={resultText} className={className || Styles['color-game-result']} />;
}; 