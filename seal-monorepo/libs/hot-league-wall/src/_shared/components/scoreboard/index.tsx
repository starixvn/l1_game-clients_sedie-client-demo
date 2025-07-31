import React from 'react';
import { Translator } from '@sg/sg-game-client';
import Styles from './scoreboard.module.scss';
import { hasBlink } from './helper';
import { OddEvenBigRoadConverter, OverUnderBigRoadConverter } from './converters';
import { useSentryHelper, SentryLogLevel } from '../../../sentry';

type Props = {
    gameName: string | undefined;
    rows: any[];
    scoreboardCharacter: any;
    scoreboardDotClassName: any;
};

const ScoreBoard: React.FunctionComponent<Props> = ({
    gameName,
    rows,
    scoreboardCharacter,
    scoreboardDotClassName,
}) => {
    // Initialize SentryHelper for ScoreBoard
    const { logInfo } = useSentryHelper({
        componentName: 'ScoreBoard',
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    // Memoize the log data to prevent infinite re-renders
    const logData = React.useMemo(() => ({
        gameName,
        rowsCount: rows?.length,
        timestamp: Date.now()
    }), [gameName, rows?.length]);

    // Log component render in useEffect to prevent infinite re-renders
    React.useEffect(() => {
        logInfo('ScoreBoard rendered', logData);
    }, [logData]);

    const translateCharacter = (option) => Translator.t(`${gameName}.beadboard_${option}`);
    const { positiveItemContent: positiveCharacter, negativeItemContent: negativeCharacter } = scoreboardCharacter;
    const { positiveItemContent: positiveClassName, negativeItemContent: negativeClassName } = scoreboardDotClassName;
    const getDotClass = (status: boolean) => {
        return status ? Styles[positiveClassName] : Styles[negativeClassName];
    };

    return (
        <>
            {rows.map((row, row_index) => {
                return row.map((point, col_index) => {
                    const emptyDot = <div className={Styles['dot-item']} key={`${row_index}_${col_index}`}></div>;
                    const blinkDot = <div className={Styles['dot-blink']}></div>;

                    const character = translateCharacter(point.status ? positiveCharacter : negativeCharacter);
                    const dot = <div className={getDotClass(point.status)}>{character}</div>;

                    const contentDot = (
                        <div
                            className={Styles['dot-item']}
                            style={{ gridColumnStart: col_index + 1, gridRowStart: row_index + 1 }}
                            key={`${row_index}_${col_index}`}
                        >
                            {point.isBlink ? blinkDot : dot}
                        </div>
                    );

                    return point.status === undefined ? emptyDot : contentDot;
                });
            })}
        </>
    );
};

export { ScoreBoard, hasBlink, OddEvenBigRoadConverter, OverUnderBigRoadConverter };
