import React from 'react';
import { RNGSoccerChoices } from '../type';
import styles from '../rng-soccer.module.scss';
import rngSoccerStyles from './rng-soccer-bet-options.module.scss';
import * as gc from '@sg/sg-game-client';
import BetOptions, { IBetOptionsState } from '../../../../_shared/components/bet-option';
import OddsComponent from '../../../../_shared/components/bet-option/odd-component';
import BettingBlock from '../../../../_shared/components/bet-option/betting-block';
import { useSentryHelper } from '../../../../_shared/hooks/useSentryHelper';
import { SentryLogLevel } from '../../../../_shared/utils/sentry/sentry-types';
import { useGameCronSentry } from '../../../../_shared/hooks/useGameCronSentry';

interface RNGSoccerBetOptionsProps {
    gameName: string;
    namespace: string;
    language: string;
    onBet: () => void;
}

const betOptionsList = [
    RNGSoccerChoices.home,
    RNGSoccerChoices.draw,
    RNGSoccerChoices.away
]

class RNGSoccerBetOptionsComponent extends BetOptions {
    renderBetOptions(betChoice: string, odd: number, name = '', isBoostedChoice = false) {
        const { settlementResult } = this.state;

        return (
            <BettingBlock
                odd={odd}
                betChoice={betChoice}
                gameName={this.props.gameName}
                namespace={this.props.namespace}
                settlementResult={settlementResult}
                onBet={() => {
                    this.props.onBet();
                }}
            >
                <div className={`${styles['container-bets']} ${rngSoccerStyles['padding-bet']}`}>
                    <span className={rngSoccerStyles['bet-choice-text']} title={name}>{name}</span>
                    <OddsComponent value={odd} fractional={false} isBoostedChoice={isBoostedChoice} />
                </div>
            </BettingBlock>
        );
    }

    isBoostedChoice = (choice: string, boostedChoices: string[] | null) => {
        const result = boostedChoices ? boostedChoices.includes(choice) : false;
        return result;
    };

    render() {
        const { roundOdds, boostedOdds } = this.state as IBetOptionsState;
        const odds = roundOdds?.odds || {};
        const boostedChoices = boostedOdds ? boostedOdds.boostedChoices : roundOdds?.boostedChoices;
        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

        return (
            <div className={rngSoccerStyles['bet-options-wrapper']}>
                <div className={rngSoccerStyles['bet-options-container']}>
                    {
                        betOptionsList.map((choice) => (
                            <div className={rngSoccerStyles['bets-bg']} key={choice} data-choice={choice}>
                                {this.renderBetOptions(
                                    choice,
                                    odds?.[choice] || 0,
                                    t(`${this.props.namespace}.${choice}`),
                                    this.isBoostedChoice(choice, boostedChoices)
                                )}
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}

// Wrapper component to provide SentryHelper to the class component
const RNGSoccerBetOptions: React.FC<RNGSoccerBetOptionsProps> = (props) => {
    const { logInfo } = useSentryHelper({
        componentName: 'RNGSoccerBetOptions',
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    // Initialize Game Cron Batch Manager for RNG Soccer Bet Options
    const {
        logInfo: gameLogInfo,
        logWarning: gameLogWarning,
        logError: gameLogError,
        startGameCron,
        completeGameCron
    } = useGameCronSentry({
        gameCronId: 'sg-rng-soccer-bet-options',
        gameName: 'RNG Soccer Bet Options',
        systemType: 'SG',
        environment: 'LOCAL1',
        onlySendOnIssues: true
    });

    // Memoize the game cron props to prevent infinite re-renders
    const gameCronProps = React.useMemo(() => ({
        gameId: '118',
        component: 'RNGSoccerBetOptions',
        props: {
            gameName: props.gameName,
            namespace: props.namespace,
            language: props.language
        }
    }), [props.gameName, props.namespace, props.language]);

    // Memoize the log data to prevent infinite re-renders
    const logData = React.useMemo(() => ({
        gameName: props.gameName,
        namespace: props.namespace,
        language: props.language,
        timestamp: Date.now()
    }), [props.gameName, props.namespace, props.language]);

    // Start game cron when component mounts
    React.useEffect(() => {
        startGameCron(gameCronProps);
        gameLogInfo('RNG Soccer bet options mounted', { component: 'RNGSoccerBetOptions' });

        // Complete game cron when component unmounts
        return () => {
            completeGameCron(true, { reason: 'component_unmounted' });
        };
    }, [gameCronProps]);

    // Log component render in useEffect to prevent infinite re-renders
    React.useEffect(() => {
        logInfo('RNGSoccerBetOptions rendered', logData);
    }, [logData]);

    return <RNGSoccerBetOptionsComponent {...props} />;
};

export default RNGSoccerBetOptions;