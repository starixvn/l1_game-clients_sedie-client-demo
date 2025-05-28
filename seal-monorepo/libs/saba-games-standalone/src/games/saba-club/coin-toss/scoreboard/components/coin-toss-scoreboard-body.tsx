import { Translator } from "@sg/sg-game-client";
import { ScoreboardItemContent } from "../../../../../_shared/components/scoreboard/types";
import { GameNames } from "../../../../../_shared/constants";
import { CoinTossResult } from "../../type";
import Styles from "./coin-toss-scoreboard-body.module.scss";
import classNames from 'classnames';
import CoinHistory from "../../../../../_shared/components/coin-history";
import { CoinSymbol } from "../../../../../_shared/components/coin";

type Props = {
    gameName: string;
    rows: any[];
    scoreboardCharacter: ScoreboardItemContent;
    scoreboardDotClassName: ScoreboardItemContent;
};

const CoinTossScoreBoardBody: React.FunctionComponent<Props> = ({ gameName, rows, scoreboardCharacter, scoreboardDotClassName }) => {
    const translateCharacter = (option: string) => Translator.t(`${gameName}.beadboard_${option}`);
    const { positiveItemContent: positiveCharacter, negativeItemContent: negativeCharacter } = scoreboardCharacter;
    const { positiveItemContent: positiveClassName, negativeItemContent: negativeClassName } = scoreboardDotClassName;

    const getDotClass = (status: boolean) => classNames({
        [Styles[positiveClassName]]: status,
        [Styles[negativeClassName]]: !status
    });

    const renderDot = (point: any) => {
        if (point.isBlink) return <div className={Styles["dot-blink"]}></div>; 
        
        const status = point.status;
        if (status === undefined) return null; 

        const character = translateCharacter(status ? positiveCharacter : negativeCharacter);

        if (gameName === GameNames.CoinToss) {
            const result: CoinTossResult = point?.data?.[0]?.result;
            return (
                <CoinHistory
                    coinType={result.head ? CoinSymbol.HEAD : CoinSymbol.TAIL}
                />
            )
        }

        return <div className={getDotClass(status)}>{character}</div>;
    };

    const dotEmpty = () => {
        return <div className={Styles["dot-empty"]}></div>;
    }

    return (
        <>
            {rows.map((row, row_index) =>
                row.map((point, col_index) => (
                    <div
                        className={Styles["dot-item"]}
                        style={{ gridColumnStart: col_index + 1, gridRowStart: row_index + 1 }}
                        key={`${row_index}_${col_index}`}
                    >
                        {point?.status === undefined ? dotEmpty() : renderDot(point)}
                    </div>
                ))
            )}
        </>
    );
};

export default CoinTossScoreBoardBody;