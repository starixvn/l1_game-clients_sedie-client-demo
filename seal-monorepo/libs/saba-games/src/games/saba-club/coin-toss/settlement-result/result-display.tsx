import * as gc from "@sg/sg-game-client";
import { WinnerDisplay } from "../../../../_shared/components/winner-display/winner-display";
import Styles from "./coin-toss-animations.module.scss";
import { CoinTossResult } from "../type";

interface ResultDisplayProps {
    result: gc.GameServiceMessage.TResult;
    language?: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
    result,
    language
}) => {
    const t = (key) => gc.Translator.t(key, { lng: language || '' });

    if (!result || Object.keys(result).length === 0) {
        return null;
    }
    const { head } = result as CoinTossResult;
    
    const resultText = head ? t('CoinToss.head') : t('CoinToss.tail');
    return <WinnerDisplay resultText={resultText} className={Styles['coin-toss-result']} />;
}; 