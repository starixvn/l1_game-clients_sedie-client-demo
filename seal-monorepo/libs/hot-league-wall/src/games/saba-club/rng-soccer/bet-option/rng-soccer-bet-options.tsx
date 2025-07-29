import { RNGSoccerChoices } from '../type';
import styles from '../rng-soccer.module.scss';
import rngSoccerStyles from './rng-soccer-bet-options.module.scss';
import * as gc from '@sg/sg-game-client';
import BetOptions, { IBetOptionsState } from '../../../../_shared/components/bet-option';
import OddsComponent from '../../../../_shared/components/bet-option/odd-component';
import BettingBlock from '../../../../_shared/components/bet-option/betting-block';
import { useSentryHelper } from '../../../../_shared/hooks/useSentryHelper';
import { SentryLogLevel } from '../../../../_shared/utils/sentry-helper';

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
    renderBetOptions(betChoice: string, odd: number, name: string = '', isBoostedChoice: boolean = false) {
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
        logLevel: SentryLogLevel.WARNING_AND_ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    logInfo('RNGSoccerBetOptions rendered', {
        gameName: props.gameName,
        namespace: props.namespace,
        language: props.language,
        timestamp: Date.now()
    });

    return <RNGSoccerBetOptionsComponent {...props} />;
};

export default RNGSoccerBetOptions;