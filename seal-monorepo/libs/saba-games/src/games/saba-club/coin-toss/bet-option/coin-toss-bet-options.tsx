import { CoinTossChoices } from '../type';
import styles from '../coin-toss.module.scss';
import coinTossStyles from './coin-toss-bet-options.module.scss'
import * as gc from '@sg/sg-game-client';
import BetOptions, { IBetOptionsState } from '../../../../_shared/components/bet-option';
import OddsComponent from '../../../../_shared/components/bet-option/odd-component';
import OwnBet from '../../../../_shared/components/bet-option/own-bet';
import TotalBet from '../../../../_shared/components/bet-option/total-bet';
import Coin from '../../../../_shared/components/coin';
import BettingBlock from '../../../../_shared/components/bet-option/betting-block';
import { choiceToSymbolMap } from '../coin-toss-utils';

export default class CoinTossBetOptions extends BetOptions {
    renderBetOptions(betChoice: string, odd: number, fractional: boolean, name: string = '', isBoostedChoice: boolean = false) {
        const { settlementResult } = this.state;

        return (
            <BettingBlock
                odd={odd}
                betChoice={betChoice}
                gameName={this.props.gameName}
                namespace={this.props.namespace}
                settlementResult={settlementResult}
                onBet={this.props.onBet}
            >
                <div className={`${styles['container-bets']} ${coinTossStyles['padding-bet']}`}>
                    <div className={coinTossStyles['bet-option']}>
                        <Coin coinType={choiceToSymbolMap[betChoice]} />
                        <div className={coinTossStyles['bet-choice-text']}>{name}</div>
                    </div>
                    <OddsComponent value={odd} fractional={false} isBoostedChoice={isBoostedChoice} />
                </div>
            </BettingBlock>
        );
    }

    renderTotalBet(choice: string) {
        return <TotalBet value={this.state?.totalBets?.[choice]} choice={choice} />;
    }

    renderOwnBet(choice: string) {
        return <OwnBet value={this.state?.ownBets?.[choice]} choice={choice} />;
    }

    isBoostedChoice = (choice: string, boostedChoices: string[] | null) => {
        if (!boostedChoices) {
            return false;
        }
        return boostedChoices.includes(choice);
    };

    render() {
        const { roundOdds, boostedOdds } = this.state as IBetOptionsState;
        const odds = roundOdds?.odds || {};
        const boostedChoices = boostedOdds ? boostedOdds.boostedChoices : roundOdds?.boostedChoices;
        const fractional = roundOdds?.fractional;
        
        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
        const headChoice = CoinTossChoices.head;
        const tailChoice = CoinTossChoices.tail;

        return (
            <div className={coinTossStyles['bet-options-wrapper']}>
                <div className={coinTossStyles['bet-options-container']}>
                    <div className={`${coinTossStyles['bets-bg']}`} key={headChoice}>
                        {this.renderBetOptions(
                            headChoice,
                            odds?.head || 0,
                            fractional,
                            t(`${this.props.namespace}.${headChoice}`),
                            this.isBoostedChoice(headChoice, boostedChoices)
                        )}
                    </div>
                    <div className={`${coinTossStyles['bets-bg']}`} key={tailChoice}>
                        {this.renderBetOptions(
                            tailChoice,
                            odds?.tail || 0,
                            fractional,
                            t(`${this.props.namespace}.${tailChoice}`),
                            this.isBoostedChoice(tailChoice, boostedChoices)
                        )}
                    </div>
                </div>
            </div>
        );
    }
} 