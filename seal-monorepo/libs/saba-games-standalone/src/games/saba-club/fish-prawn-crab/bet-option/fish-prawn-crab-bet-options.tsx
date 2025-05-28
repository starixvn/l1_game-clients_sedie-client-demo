import { FishPrawnOddsType } from '../type';
import * as gc from '@sg/sg-game-client';
import BetOptions, { IBetOptionsState } from '../../../../_shared/components/bet-option';
import BettingBlock from '../../../../_shared/components/bet-option/betting-block';
import OddsComponent from '../../../../_shared/components/bet-option/odd-component';
import Styles from '../fish-prawn-crab.module.scss';
import { bottomChoices, topChoices } from '../type';
import { Size } from '../../../../_shared/constants';
import FishPrawnCrabDice from '../../../../_shared/components/fish-prawn-crab-dice';
import { choiceToSymbolMap } from '../fish-prawn-crab-utils';

export default class FishPrawnCrabBetOptions extends BetOptions {
    renderBetOptions(betChoice: string, odd: number, fractional: boolean, isBoostedChoice: boolean = false) {
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
                <div className={`${Styles['container-bets']} ${Styles['padding-bet']}`}>
                    <FishPrawnCrabDice symbol={choiceToSymbolMap[betChoice]} size={Size.small} />
                    <OddsComponent value={odd} fractional={false} isBoostedChoice={isBoostedChoice} />
                </div>
            </BettingBlock>
        );
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

        return (
            <div className={Styles['bet-options-wrapper']}>
                <div className={Styles['bet-options-container']}>
                    {topChoices.map((choice) => {
                        const odd = odds?.[FishPrawnOddsType.single] || 0;
                        return (
                            <div className={`${Styles['bets-bg']}`} key={choice}>
                                {this.renderBetOptions(
                                    choice,
                                    odd,
                                    fractional,
                                    this.isBoostedChoice(choice, boostedChoices)
                                )}
                            </div>
                        );
                    })}
                    {bottomChoices.map((choice) => {
                        const odd = odds?.[FishPrawnOddsType.single] || 0;
                        return (
                            <div className={`${Styles['bets-bg']}`} key={choice}>
                                {this.renderBetOptions(
                                    choice,
                                    odd,
                                    fractional,
                                    this.isBoostedChoice(choice, boostedChoices)
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
} 